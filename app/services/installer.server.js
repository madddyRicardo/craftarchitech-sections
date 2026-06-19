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
  
  // 1. Write the Liquid Section file
  await createThemeAsset(
    session,
    themeId,
    `sections/${section.handle}.liquid`,
    latestVersionObj.liquidCode
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

  // Re-write updated asset files
  await createThemeAsset(
    session,
    themeId,
    `sections/${installation.section.handle}.liquid`,
    latestVersionObj.liquidCode
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
