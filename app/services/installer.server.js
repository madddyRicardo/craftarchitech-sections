import prisma from "../db.server";
import { getActiveThemeId, createThemeAsset, deleteThemeAsset } from "./theme.server";

/**
 * Ensures a merchant entry exists in the DB for the current shop.
 * @param {string} shop - The shop domain (e.g. my-store.myshopify.com)
 * @returns {Promise<Object>} The merchant record
 */
export async function getOrCreateMerchant(shop) {
  let merchant = await prisma.merchant.findUnique({
    where: { shop },
  });

  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: {
        shop,
        autoUpdate: false,
      },
    });
  }

  return merchant;
}

/**
 * Installs a section into the merchant's active theme
 * @param {Object} session - The authenticated Shopify session
 * @param {string} sectionId - The ID of the section to install
 * @returns {Promise<Object>} The installation record
 */
export async function installSection(session, sectionId) {
  const shop = session.shop;
  const merchant = await getOrCreateMerchant(shop);

  // Retrieve the section and its latest version from the library
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      versions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!section) {
    throw new Error(`Section with ID ${sectionId} not found in the library.`);
  }

  const latestVersionObj = section.versions[0];
  if (!latestVersionObj) {
    throw new Error(`No version templates found for section: ${section.name}`);
  }

  // Get active Shopify theme
  const themeId = await getActiveThemeId(session);

  // Install file templates into the active theme
  console.log(`Writing theme files for section: ${section.handle} in theme ${themeId}`);
  
  // 1. Write the Liquid Section file (protected with license checking wrapper)
  const protectedLiquid = injectLicenseProtection(latestVersionObj.liquidCode);
  await createThemeAsset(
    session,
    themeId,
    `sections/${section.handle}.liquid`,
    protectedLiquid
  );

  // 2. Write the CSS Asset file if code exists
  if (latestVersionObj.cssCode && latestVersionObj.cssCode.trim() !== "") {
    await createThemeAsset(
      session,
      themeId,
      `assets/${section.handle}.css`,
      latestVersionObj.cssCode
    );
  }

  // 3. Write the JS Asset file if code exists
  if (latestVersionObj.jsCode && latestVersionObj.jsCode.trim() !== "") {
    await createThemeAsset(
      session,
      themeId,
      `assets/${section.handle}.js`,
      latestVersionObj.jsCode
    );
  }

  // Record/Upsert the installation status in the DB
  const installation = await prisma.installation.upsert({
    where: {
      shop_themeId_sectionId: {
        shop,
        themeId,
        sectionId,
      },
    },
    update: {
      installedVersion: latestVersionObj.versionNumber,
      status: "active",
    },
    create: {
      shop,
      merchantId: merchant.id,
      themeId,
      sectionId,
      installedVersion: latestVersionObj.versionNumber,
      status: "active",
    },
  });

  return installation;
}

/**
 * Updates an installed section to the latest available library version
 * @param {Object} session - The authenticated Shopify session
 * @param {string} installationId - The ID of the current installation
 * @returns {Promise<Object>} The updated installation record
 */
export async function updateSection(session, installationId) {
  const shop = session.shop;

  const installation = await prisma.installation.findFirst({
    where: { id: installationId, shop },
    include: {
      section: {
        include: {
          versions: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!installation) {
    throw new Error(`Installation ${installationId} not found.`);
  }

  const latestVersionObj = installation.section.versions[0];
  if (!latestVersionObj) {
    throw new Error(`No versions available for update.`);
  }

  const themeId = installation.themeId;

  // Re-write updated asset files (protected with license checking wrapper)
  const protectedLiquid = injectLicenseProtection(latestVersionObj.liquidCode);
  await createThemeAsset(
    session,
    themeId,
    `sections/${installation.section.handle}.liquid`,
    protectedLiquid
  );

  if (latestVersionObj.cssCode && latestVersionObj.cssCode.trim() !== "") {
    await createThemeAsset(
      session,
      themeId,
      `assets/${installation.section.handle}.css`,
      latestVersionObj.cssCode
    );
  }

  if (latestVersionObj.jsCode && latestVersionObj.jsCode.trim() !== "") {
    await createThemeAsset(
      session,
      themeId,
      `assets/${installation.section.handle}.js`,
      latestVersionObj.jsCode
    );
  }

  // Update DB installation state
  const updatedInstallation = await prisma.installation.update({
    where: { id: installationId },
    data: {
      installedVersion: latestVersionObj.versionNumber,
      status: "active",
    },
  });

  return updatedInstallation;
}

/**
 * Uninstalls a section by removing all assets from the Shopify theme and updating DB
 * @param {Object} session - The authenticated Shopify session
 * @param {string} installationId - The ID of the installation
 * @returns {Promise<boolean>} Success status
 */
export async function uninstallSection(session, installationId) {
  const shop = session.shop;

  const installation = await prisma.installation.findFirst({
    where: { id: installationId, shop },
    include: { section: true },
  });

  if (!installation) {
    throw new Error(`Installation record not found for ID: ${installationId}`);
  }

  const themeId = installation.themeId;
  const handle = installation.section.handle;

  console.log(`Uninstalling section ${handle} from theme ${themeId}`);

  // Delete assets from Shopify theme (ignore errors if files already manually deleted)
  try {
    await deleteThemeAsset(session, themeId, `sections/${handle}.liquid`);
  } catch (err) {
    console.warn(`Could not delete liquid file: ${err.message}`);
  }

  try {
    await deleteThemeAsset(session, themeId, `assets/${handle}.css`);
  } catch (err) {
    console.warn(`Could not delete css file: ${err.message}`);
  }

  try {
    await deleteThemeAsset(session, themeId, `assets/${handle}.js`);
  } catch (err) {
    console.warn(`Could not delete js file: ${err.message}`);
  }

  // Delete installation from local database
  await prisma.installation.delete({
    where: { id: installationId },
  });

  return true;
}

/**
 * Wraps Liquid sections code in a license validation script and injects the license_key setting into the schema.
 * @param {string} liquidCode - The raw liquid template code
 * @returns {string} The license-protected liquid code
 */
function injectLicenseProtection(liquidCode) {
  // 1. Find the {% schema %} block
  const schemaStartIndex = liquidCode.indexOf("{% schema %}");
  const schemaEndIndex = liquidCode.indexOf("{% endschema %}");

  if (schemaStartIndex === -1 || schemaEndIndex === -1) {
    return liquidCode; // If no schema, return original
  }

  const beforeSchema = liquidCode.substring(0, schemaStartIndex);
  const schemaContent = liquidCode.substring(schemaStartIndex + 12, schemaEndIndex);
  const afterSchema = liquidCode.substring(schemaEndIndex + 14);

  // 2. Wrap beforeSchema in protection wrapper
  const wrappedLiquid = `
<div id="ca-section-{{ section.id }}" class="ca-section-wrapper" style="display: none;">
  ${beforeSchema}
</div>
<div id="ca-license-error-{{ section.id }}" class="ca-license-error" style="display: none; padding: 30px; text-align: center; border: 2px dashed #f43f5e; color: #e11d48; background: #fff1f2; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px auto; max-width: 600px;">
  <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold;">⚠️ License Verification Required</p>
  <p style="margin: 0; font-size: 14px; opacity: 0.9;">Invalid, missing, or unregistered License Key for this storefront. Please enter your valid license key in the section settings in your Theme Editor.</p>
</div>

<script>
  (function() {
    const shop = "{{ shop.permanent_domain }}";
    const key = "{{ section.settings.license_key }}";
    const sectionId = "{{ section.id }}";
    
    if (!key || key.trim() === "") {
      document.getElementById("ca-license-error-" + sectionId).style.display = "block";
      return;
    }
    
    fetch("https://craftarchitech-sections.onrender.com/api/validate-license?shop=" + encodeURIComponent(shop) + "&key=" + encodeURIComponent(key))
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          document.getElementById("ca-section-" + sectionId).style.display = "block";
        } else {
          document.getElementById("ca-license-error-" + sectionId).style.display = "block";
        }
      })
      .catch(err => {
        console.error("License check failed:", err);
        document.getElementById("ca-license-error-" + sectionId).style.display = "block";
      });
  })();
</script>
`;

  // 3. Inject license_key setting into the schema settings array
  try {
    const schemaObj = JSON.parse(schemaContent.trim());
    if (!schemaObj.settings) {
      schemaObj.settings = [];
    }
    
    // Check if license_key setting already exists
    const hasLicenseKey = schemaObj.settings.some(s => s.id === "license_key");
    if (!hasLicenseKey) {
      schemaObj.settings.push({
        type: "text",
        id: "license_key",
        label: "CraftArchitech License Key",
        default: ""
      });
    }

    const newSchemaContent = JSON.stringify(schemaObj, null, 2);
    return `${wrappedLiquid}\n{% schema %}\n${newSchemaContent}\n{% endschema %}\n${afterSchema}`;
  } catch (error) {
    console.error("Failed to parse and inject license settings into schema:", error);
    return liquidCode; // Return original if parsing fails
  }
}
