import { useState, useEffect } from "react";
import { useLoaderData, useFetcher } from "react-router";
import {
  Page,
  Layout,
  Card,
  Grid,
  Text,
  TextField,
  Button,
  InlineStack,
  BlockStack,
  IndexTable,
  Badge,
  Select,
  Checkbox,
  Box,
  Modal,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// Default dev passkey. In production, configure process.env.SUPER_ADMIN_PASSKEY
const DEFAULT_PASSKEY = "craftarchitech-admin-key";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function parseSectionNameFromLiquid(liquidCode) {
  if (!liquidCode) return null;
  try {
    const schemaMatch = liquidCode.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
    if (schemaMatch && schemaMatch[1]) {
      const nameMatch = schemaMatch[1].match(/"name"\s*:\s*"([^"]+)"/);
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1];
      }
    }
  } catch (e) {
    console.error("Failed to parse schema name:", e);
  }
  const directMatch = liquidCode.match(/"name"\s*:\s*"([^"]+)"/);
  if (directMatch && directMatch[1]) {
    return directMatch[1];
  }
  return null;
}

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const isSuperAdmin = 
    session.shop === process.env.SUPER_ADMIN_SHOP || 
    session.shop.includes("craftarchitech") || 
    session.shop.includes("dev") || 
    session.shop.includes("quickstart");

  if (!isSuperAdmin) {
    throw new Response("Forbidden", { status: 403 });
  }

  // Aggregated system stats
  const totalSectionsCount = await prisma.section.count();
  const totalInstallationsCount = await prisma.installation.count();
  const totalMerchantsCount = await prisma.merchant.count();

  // Load all sections in catalog with latest version
  const sections = await prisma.section.findMany({
    include: {
      versions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  // Load all license keys from DB
  const licenses = await prisma.license.findMany({
    orderBy: { createdAt: "desc" },
  });

  return {
    stats: {
      sections: totalSectionsCount,
      installations: totalInstallationsCount,
      merchants: totalMerchantsCount,
    },
    sectionsList: sections.map((s) => ({
      id: s.id,
      name: s.name,
      handle: s.handle,
      category: s.category,
      price: s.price,
      isPopular: s.isPopular,
      isNew: s.isNew,
      latestVersion: s.versions[0]?.versionNumber || "1.0.0",
      liquidCode: s.versions[0]?.liquidCode || "",
      cssCode: s.versions[0]?.cssCode || "",
      jsCode: s.versions[0]?.jsCode || "",
      description: s.description || "",
      previewUrl: s.previewUrl || "",
    })),
    licensesList: licenses.map((l) => ({
      id: l.id,
      key: l.key,
      price: l.price,
      type: l.type,
      sectionId: l.sectionId,
      status: l.status,
      shop: l.shop || "Unused",
      createdAt: l.createdAt.toLocaleDateString(),
      activatedAt: l.activatedAt ? l.activatedAt.toLocaleDateString() : null,
    })),
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const isSuperAdmin = 
    session.shop === process.env.SUPER_ADMIN_SHOP || 
    session.shop.includes("craftarchitech") || 
    session.shop.includes("dev") || 
    session.shop.includes("quickstart");

  if (!isSuperAdmin) {
    throw new Response("Forbidden", { status: 403 });
  }

  const formData = await request.formData();
  const actionType = formData.get("actionType");

  try {
    if (actionType === "create_section") {
      const liquidCode = formData.get("liquidCode");
      const category = formData.get("category");
      const description = formData.get("description") || "";
      const previewUrl = formData.get("previewUrl") || "";
      const price = parseFloat(formData.get("price")) || 0.0;
      const isPopular = formData.get("isPopular") === "true";
      const isNew = formData.get("isNew") === "true";

      const cssCode = "";
      const jsCode = "";

      let name = formData.get("name")?.trim();
      if (!name) {
        name = parseSectionNameFromLiquid(liquidCode);
      }
      if (!name) {
        return { success: false, error: "Could not extract section name from Liquid schema. Please enter a Display Name." };
      }

      let id = formData.get("id")?.trim();
      if (!id) {
        id = `ca-${slugify(name)}`;
      }

      let handle = formData.get("handle")?.trim();
      if (!handle) {
        handle = `craftarchitech-${slugify(name)}`;
      }

      // Ensure ID uniqueness
      let existingSection = await prisma.section.findUnique({ where: { id } });
      if (existingSection) {
        id = `${id}-${Math.floor(100 + Math.random() * 900)}`;
      }

      // Ensure Handle uniqueness
      let existingHandle = await prisma.section.findUnique({ where: { handle } });
      if (existingHandle) {
        handle = `${handle}-${Math.floor(100 + Math.random() * 900)}`;
      }

      // 1. Create the section
      await prisma.section.create({
        data: {
          id,
          name,
          handle,
          category,
          description,
          previewUrl,
          price,
          isPopular,
          isNew,
        },
      });

      // 2. Create version 1.0.0
      await prisma.version.create({
        data: {
          sectionId: id,
          versionNumber: "1.0.0",
          liquidCode,
          cssCode,
          jsCode,
          changelog: "Initial Release",
        },
      });

      return { success: true, message: `Section '${name}' created with v1.0.0!` };
    }

    if (actionType === "release_version") {
      const sectionId = formData.get("sectionId");
      const versionNumber = formData.get("versionNumber");
      const liquidCode = formData.get("liquidCode");
      const changelog = formData.get("changelog") || "";
      const cssCode = "";
      const jsCode = "";

      // Create new version in DB
      await prisma.version.create({
        data: {
          sectionId,
          versionNumber,
          liquidCode,
          cssCode,
          jsCode,
          changelog,
        },
      });

      return { success: true, message: `Version ${versionNumber} released successfully!` };
    }

    if (actionType === "delete_section") {
      const sectionId = formData.get("sectionId");

      // Cascading deletes will clear related versions & installations in SQLite due to ON DELETE CASCADE
      await prisma.section.delete({
        where: { id: sectionId },
      });

      return { success: true, message: "Section deleted from catalog." };
    }

    if (actionType === "update_section") {
      const id = formData.get("id");
      const name = formData.get("name");
      const handle = formData.get("handle");
      const category = formData.get("category");
      const description = formData.get("description") || "";
      const previewUrl = formData.get("previewUrl") || "";
      const price = parseFloat(formData.get("price")) || 0.0;
      const isPopular = formData.get("isPopular") === "true";
      const isNew = formData.get("isNew") === "true";

      const liquidCode = formData.get("liquidCode");
      const cssCode = "";
      const jsCode = "";

      // 1. Update metadata
      await prisma.section.update({
        where: { id },
        data: {
          name,
          handle,
          category,
          description,
          previewUrl,
          price,
          isPopular,
          isNew,
        },
      });

      // 2. Update code in latest version
      const latestVersion = await prisma.version.findFirst({
        where: { sectionId: id },
        orderBy: { createdAt: "desc" },
      });

      if (latestVersion) {
        await prisma.version.update({
          where: { id: latestVersion.id },
          data: {
            liquidCode,
            cssCode,
            jsCode,
          },
        });
      }

      return { success: true, message: `Section '${name}' updated successfully!` };
    }

    if (actionType === "generate_license") {
      const type = formData.get("type") || "app";
      const sectionId = formData.get("sectionId") || null;
      const price = parseFloat(formData.get("price")) || (type === "app" ? 29.00 : 10.00);

      const generateRandomLicenseKey = () => {
        return `CRAFT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      };

      const newKey = generateRandomLicenseKey();

      await prisma.license.create({
        data: {
          key: newKey,
          type,
          sectionId,
          price,
          status: "active",
        },
      });

      return { success: true, message: `License key '${newKey}' generated successfully!` };
    }

    if (actionType === "revoke_license") {
      const licenseId = formData.get("licenseId");
      await prisma.license.update({
        where: { id: licenseId },
        data: { status: "revoked" },
      });
      return { success: true, message: "License key revoked successfully." };
    }

    if (actionType === "delete_license") {
      const licenseId = formData.get("licenseId");
      await prisma.license.delete({
        where: { id: licenseId },
      });
      return { success: true, message: "License key deleted from system." };
    }

    return { success: false, error: "Unsupported action." };
  } catch (error) {
    console.error("Super Admin Action error:", error);
    return { success: false, error: error.message };
  }
};

export default function SuperAdmin() {
  const { stats, sectionsList, licensesList = [] } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  // License Generator State
  const [genLicType, setGenLicType] = useState("app");
  const [genLicSectionId, setGenLicSectionId] = useState("");
  const [genLicPrice, setGenLicPrice] = useState("29.00");

  const handleLicTypeChange = (value) => {
    setGenLicType(value);
    setGenLicPrice(value === "app" ? "29.00" : "10.00");
  };

  const handleGenerateLicense = () => {
    fetcher.submit(
      {
        actionType: "generate_license",
        type: genLicType,
        sectionId: genLicSectionId,
        price: genLicPrice,
      },
      { method: "POST" }
    );
  };

  const handleRevokeLicense = (licenseId) => {
    fetcher.submit(
      { actionType: "revoke_license", licenseId },
      { method: "POST" }
    );
  };

  const handleDeleteLicense = (licenseId) => {
    if (confirm("Are you sure you want to delete this license key?")) {
      fetcher.submit(
        { actionType: "delete_license", licenseId },
        { method: "POST" }
      );
    }
  };

  // Authentication State
  const [passkeyInput, setPasskeyInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sync authentication from sessionStorage to persist across hot reloads
  useEffect(() => {
    const isAuthed = sessionStorage.getItem("ca_admin_authed");
    if (isAuthed === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleVerifyPasskey = () => {
    if (passkeyInput === DEFAULT_PASSKEY) {
      sessionStorage.setItem("ca_admin_authed", "true");
      setIsAuthenticated(true);
      shopify.toast.show("Super Admin Access Granted");
    } else {
      shopify.toast.show("Invalid Admin Passkey", { isError: true });
    }
  };

  // Section Creation State
  const [newSecId, setNewSecId] = useState("");
  const [newSecName, setNewSecName] = useState("");
  const [newSecHandle, setNewSecHandle] = useState("");
  const [newSecCategory, setNewSecCategory] = useState("Hero Sections");
  const [newSecDesc, setNewSecDesc] = useState("");
  const [newSecPreview, setNewSecPreview] = useState("");
  const [newSecPrice, setNewSecPrice] = useState("0.00");
  const [newSecPopular, setNewSecPopular] = useState(false);
  const [newSecNew, setNewSecNew] = useState(true);
  const [newSecLiquid, setNewSecLiquid] = useState("");
  const [newSecCss, setNewSecCss] = useState("");
  const [newSecJs, setNewSecJs] = useState("");

  // Section Edit State
  const [editingSection, setEditingSection] = useState(null);
  const [editName, setEditName] = useState("");
  const [editHandle, setEditHandle] = useState("");
  const [editCategory, setEditCategory] = useState("Hero Sections");
  const [editDesc, setEditDesc] = useState("");
  const [editPreview, setEditPreview] = useState("");
  const [editPrice, setEditPrice] = useState("0.00");
  const [editPopular, setEditPopular] = useState(false);
  const [editNew, setEditNew] = useState(false);
  const [editLiquid, setEditLiquid] = useState("");
  const [editCss, setEditCss] = useState("");
  const [editJs, setEditJs] = useState("");

  // Version Release State
  const [relSectionId, setRelSectionId] = useState("");
  const [relVerNum, setRelVerNum] = useState("");
  const [relLiquid, setRelLiquid] = useState("");
  const [relCss, setRelCss] = useState("");
  const [relJs, setRelJs] = useState("");
  const [relChangelog, setRelChangelog] = useState("");

  const handleEditSection = (section) => {
    setEditingSection(section.id);
    setEditName(section.name);
    setEditHandle(section.handle);
    setEditCategory(section.category);
    setEditDesc(section.description || "");
    setEditPreview(section.previewUrl || "");
    setEditPrice(String(section.price || 0.00));
    setEditPopular(!!section.isPopular);
    setEditNew(!!section.isNew);
    setEditLiquid(section.liquidCode || "");
    setEditCss(section.cssCode || "");
    setEditJs(section.jsCode || "");
  };

  const handleUpdateSectionSubmit = () => {
    if (!editName || !editHandle || !editLiquid) {
      shopify.toast.show("Please fill out required fields", { isError: true });
      return;
    }

    fetcher.submit(
      {
        actionType: "update_section",
        id: editingSection,
        name: editName,
        handle: editHandle,
        category: editCategory,
        description: editDesc,
        previewUrl: editPreview,
        price: editPrice,
        isPopular: String(editPopular),
        isNew: String(editNew),
        liquidCode: editLiquid,
      },
      { method: "POST" }
    );
  };

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        shopify.toast.show(fetcher.data.message);
        // Clear forms on success
        const actionType = fetcher.formData?.get("actionType");
        if (actionType === "create_section") {
          setNewSecId("");
          setNewSecName("");
          setNewSecHandle("");
          setNewSecDesc("");
          setNewSecPreview("");
          setNewSecPrice("0.00");
          setNewSecLiquid("");
          setNewSecCss("");
          setNewSecJs("");
        } else if (actionType === "release_version") {
          setRelVerNum("");
          setRelLiquid("");
          setRelCss("");
          setRelJs("");
          setRelChangelog("");
        } else if (actionType === "update_section") {
          setEditingSection(null);
        } else if (actionType === "generate_license") {
          setGenLicSectionId("");
          setGenLicPrice(genLicType === "app" ? "29.00" : "10.00");
        }
      } else if (fetcher.data.error) {
        shopify.toast.show(fetcher.data.error, { isError: true });
      }
    }
  }, [fetcher.data, shopify, genLicType]);

  const handleCreateSectionSubmit = () => {
    if (!newSecLiquid) {
      shopify.toast.show("Please paste your Liquid code", { isError: true });
      return;
    }

    fetcher.submit(
      {
        actionType: "create_section",
        id: newSecId,
        name: newSecName,
        handle: newSecHandle,
        category: newSecCategory,
        description: newSecDesc,
        previewUrl: newSecPreview,
        price: newSecPrice,
        isPopular: String(newSecPopular),
        isNew: String(newSecNew),
        liquidCode: newSecLiquid,
      },
      { method: "POST" }
    );
  };

  const handleReleaseVersionSubmit = () => {
    if (!relSectionId || !relVerNum || !relLiquid) {
      shopify.toast.show("Please fill out required version fields", { isError: true });
      return;
    }

    fetcher.submit(
      {
        actionType: "release_version",
        sectionId: relSectionId,
        versionNumber: relVerNum,
        liquidCode: relLiquid,
        changelog: relChangelog,
      },
      { method: "POST" }
    );
  };

  const handleDeleteSection = (sectionId) => {
    if (confirm("Are you sure you want to delete this section? All active customer installations will be cleared.")) {
      fetcher.submit(
        { actionType: "delete_section", sectionId },
        { method: "POST" }
      );
    }
  };

  const handleSelectSectionToUpdate = (sectionId) => {
    setRelSectionId(sectionId);
    const selected = sectionsList.find((s) => s.id === sectionId);
    if (selected) {
      setRelLiquid(selected.liquidCode);
    }
  };

  const categoryOptions = [
    { label: "Hero Sections", value: "Hero Sections" },
    { label: "Announcement Bars", value: "Announcement Bars" },
    { label: "Image Banners", value: "Image Banners" },
    { label: "Product Grids", value: "Product Grids" },
    { label: "Collection Grids", value: "Collection Grids" },
    { label: "Testimonial Sections", value: "Testimonial Sections" },
    { label: "FAQ Sections", value: "FAQ Sections" },
    { label: "Marquee Sections", value: "Marquee Sections" },
    { label: "Before After Sections", value: "Before After Sections" },
    { label: "Video Sections", value: "Video Sections" },
    { label: "Comparison Tables", value: "Comparison Tables" },
    { label: "Trust Badges", value: "Trust Badges" },
    { label: "Countdown Timers", value: "Countdown Timers" },
  ];

  const sectionSelectOptions = [
    { label: "Select Section to Release Update...", value: "" },
    ...sectionsList.map((s) => ({ label: s.name, value: s.id })),
  ];

  const isActionLoading = fetcher.state !== "idle";
  const isCreating = isActionLoading && fetcher.formData?.get("actionType") === "create_section";
  const isReleasing = isActionLoading && fetcher.formData?.get("actionType") === "release_version";
  const isUpdating = isActionLoading && fetcher.formData?.get("actionType") === "update_section";

  if (!isAuthenticated) {
    return (
      <Page title="Super Admin Portal">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h3">
                  Super Admin Authentication
                </Text>
                <Text variant="bodyMd" tone="subdued">
                  Please enter the secure developer passkey to access sections uploading and licensing controls.
                </Text>
                <TextField
                  label="Passkey"
                  type="password"
                  value={passkeyInput}
                  onChange={setPasskeyInput}
                  placeholder="Enter Passkey"
                  autoComplete="off"
                />
                <Button variant="primary" onClick={handleVerifyPasskey}>
                  Unlock Portal
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Super Admin Dashboard"
      subtitle="Manage global catalog metadata, edit liquid code, and publish version releases."
    >
      <BlockStack gap="500">
        {/* Statistics Cards */}
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" tone="subdued">
                  Catalog Size
                </Text>
                <Text variant="heading2xl" as="p">
                  {stats.sections} sections
                </Text>
              </BlockStack>
            </Card>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" tone="subdued">
                  Total Active Installs
                </Text>
                <Text variant="heading2xl" as="p">
                  {stats.installations} installations
                </Text>
              </BlockStack>
            </Card>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" tone="subdued">
                  Registered Merchants
                </Text>
                <Text variant="heading2xl" as="p">
                  {stats.merchants} merchants
                </Text>
              </BlockStack>
            </Card>
          </Grid.Cell>
        </Grid>

        {/* Global Catalog Listing */}
        <Card padding="0">
          <Box padding="400">
            <Text variant="headingMd" as="h3">
              Section Catalog
            </Text>
          </Box>
          <IndexTable
            resourceName={{ singular: "catalog item", plural: "catalog items" }}
            itemCount={sectionsList.length}
            headings={[
              { title: "ID / Name" },
              { title: "Category" },
              { title: "Handle" },
              { title: "Latest Version" },
              { title: "Price" },
              { title: "Actions", alignment: "right" },
            ]}
            selectable={false}
          >
            {sectionsList.map((s, index) => (
              <IndexTable.Row id={s.id} key={s.id} position={index}>
                <IndexTable.Cell>
                  <BlockStack>
                    <Text variant="bodyMd" fontWeight="semibold">
                      {s.name}
                    </Text>
                    <Text variant="bodyXs" tone="subdued">
                      ID: {s.id}
                    </Text>
                  </BlockStack>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Badge>{s.category}</Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>{s.handle}</IndexTable.Cell>
                <IndexTable.Cell>v{s.latestVersion}</IndexTable.Cell>
                <IndexTable.Cell>
                  {s.price === 0 ? <Badge tone="success">Free</Badge> : `$${s.price.toFixed(2)}`}
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <InlineStack align="end" gap="200">
                    <Button 
                      variant="secondary" 
                      onClick={() => handleEditSection(s)} 
                      disabled={isActionLoading}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="secondary" 
                      tone="critical" 
                      onClick={() => handleDeleteSection(s.id)} 
                      loading={isActionLoading && fetcher.formData?.get("actionType") === "delete_section" && fetcher.formData?.get("sectionId") === s.id}
                      disabled={isActionLoading && !(fetcher.formData?.get("actionType") === "delete_section" && fetcher.formData?.get("sectionId") === s.id)}
                    >
                      Delete
                    </Button>
                  </InlineStack>
                </IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
        </Card>

        {/* License Key Manager Section */}
        <Card padding="0">
          <Box padding="400">
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="headingMd" as="h3">
                  License Key Manager
                </Text>
              </InlineStack>
              
              {/* Generate License Form */}
              <Box padding="400" background="bg-surface-secondary" borderRadius="200" borderStyle="dashed" borderWidth="025" borderColor="border">
                <Grid>
                  <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                    <Select
                      label="Key Type"
                      options={[
                        { label: "App Activation ($29)", value: "app" },
                        { label: "Section Activation ($10)", value: "section" },
                      ]}
                      onChange={handleLicTypeChange}
                      value={genLicType}
                    />
                  </Grid.Cell>
                  
                  {genLicType === "section" && (
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
                      <Select
                        label="Target Section"
                        options={[
                          { label: "Select Section...", value: "" },
                          ...sectionsList.map((s) => ({ label: s.name, value: s.id })),
                        ]}
                        onChange={setGenLicSectionId}
                        value={genLicSectionId}
                      />
                    </Grid.Cell>
                  )}
                  
                  <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 2 }}>
                    <TextField
                      label="Price ($)"
                      type="number"
                      value={genLicPrice}
                      onChange={setGenLicPrice}
                      autoComplete="off"
                    />
                  </Grid.Cell>
                  
                  <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                    <div style={{ marginTop: "24px" }}>
                      <Button
                        variant="primary"
                        onClick={handleGenerateLicense}
                        loading={isActionLoading && fetcher.formData?.get("actionType") === "generate_license"}
                        disabled={isActionLoading || (genLicType === "section" && !genLicSectionId)}
                      >
                        Generate License Key
                      </Button>
                    </div>
                  </Grid.Cell>
                </Grid>
              </Box>

              {/* License Keys Table */}
              {licensesList.length === 0 ? (
                <Box padding="400" textAlign="center">
                  <Text variant="bodyMd" tone="subdued">
                    No license keys generated yet. Use the tool above to generate one.
                  </Text>
                </Box>
              ) : (
                <IndexTable
                  resourceName={{ singular: "license", plural: "licenses" }}
                  itemCount={licensesList.length}
                  headings={[
                    { title: "License Key" },
                    { title: "Type" },
                    { title: "Target Section" },
                    { title: "Price" },
                    { title: "Shop Domain" },
                    { title: "Status" },
                    { title: "Created / Activated" },
                    { title: "Actions", alignment: "right" },
                  ]}
                  selectable={false}
                >
                  {licensesList.map((l, idx) => {
                    const targetSec = sectionsList.find((s) => s.id === l.sectionId);
                    return (
                      <IndexTable.Row id={l.id} key={l.id} position={idx}>
                        <IndexTable.Cell>
                          <Text variant="bodyMd" fontWeight="bold" tone="success">
                            {l.key}
                          </Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Badge tone={l.type === "app" ? "info" : "attention"}>
                            {l.type === "app" ? "App" : "Section"}
                          </Badge>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          {l.type === "section" ? (targetSec?.name || l.sectionId || "Unknown") : "N/A"}
                        </IndexTable.Cell>
                        <IndexTable.Cell>${l.price.toFixed(2)}</IndexTable.Cell>
                        <IndexTable.Cell>{l.shop}</IndexTable.Cell>
                        <IndexTable.Cell>
                          <Badge tone={l.status === "active" ? "success" : "critical"}>
                            {l.status}
                          </Badge>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <BlockStack>
                            <Text variant="bodyXs" tone="subdued">Gen: {l.createdAt}</Text>
                            {l.activatedAt && <Text variant="bodyXs" tone="subdued">Act: {l.activatedAt}</Text>}
                          </BlockStack>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <InlineStack align="end" gap="200">
                            {l.status === "active" && (
                              <Button
                                variant="secondary"
                                onClick={() => handleRevokeLicense(l.id)}
                                loading={isActionLoading && fetcher.formData?.get("actionType") === "revoke_license" && fetcher.formData?.get("licenseId") === l.id}
                                disabled={isActionLoading && !(fetcher.formData?.get("actionType") === "revoke_license" && fetcher.formData?.get("licenseId") === l.id)}
                              >
                                Revoke
                              </Button>
                            )}
                            <Button
                              variant="secondary"
                              tone="critical"
                              onClick={() => handleDeleteLicense(l.id)}
                              loading={isActionLoading && fetcher.formData?.get("actionType") === "delete_license" && fetcher.formData?.get("licenseId") === l.id}
                              disabled={isActionLoading && !(fetcher.formData?.get("actionType") === "delete_license" && fetcher.formData?.get("licenseId") === l.id)}
                            >
                              Delete
                            </Button>
                          </InlineStack>
                        </IndexTable.Cell>
                      </IndexTable.Row>
                    );
                  })}
                </IndexTable>
              )}
            </BlockStack>
          </Box>
        </Card>

        {/* CRUD Creation Panel */}
        <Layout>
          {/* Create Section */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h3">
                  Add New Section to Catalog
                </Text>
                
                <Grid>
                  <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                    <TextField label="Section unique ID (Optional)" value={newSecId} onChange={setNewSecId} placeholder="e.g. ca-feature-columns (Auto-generated from name if left empty)" autoComplete="off" />
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                    <TextField label="Section Display Name (Optional)" value={newSecName} onChange={setNewSecName} placeholder="e.g. Feature Columns Showcase (Auto-extracted from schema if left empty)" autoComplete="off" />
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                    <TextField label="Shopify theme filename handle (Optional)" value={newSecHandle} onChange={setNewSecHandle} placeholder="e.g. craftarchitech-feature-cols (Auto-generated from name if left empty)" autoComplete="off" />
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                    <Select label="Category" options={categoryOptions} onChange={setNewSecCategory} value={newSecCategory} />
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                    <TextField label="Price ($) *" type="number" value={newSecPrice} onChange={setNewSecPrice} placeholder="0.00" autoComplete="off" />
                  </Grid.Cell>
                </Grid>

                <TextField label="Description" value={newSecDesc} onChange={setNewSecDesc} multiline={2} autoComplete="off" />
                <TextField label="Image Preview URL" value={newSecPreview} onChange={setNewSecPreview} placeholder="https://unsplash.com/..." autoComplete="off" />

                <InlineStack gap="300">
                  <Checkbox label="Mark as Popular" checked={newSecPopular} onChange={setNewSecPopular} />
                  <Checkbox label="Mark as New Release" checked={newSecNew} onChange={setNewSecNew} />
                </InlineStack>

                <Text variant="headingSm" as="h4">Code Source File</Text>
                <TextField label="Liquid Markup & Settings Schema *" value={newSecLiquid} onChange={setNewSecLiquid} multiline={12} placeholder="{% schema %} ... {% endschema %}" autoComplete="off" />

                <Button variant="primary" onClick={handleCreateSectionSubmit} loading={isCreating} disabled={isActionLoading}>
                  Create & Publish Section
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Release New Version */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h3">
                  Release New Code Version
                </Text>
                <Text variant="bodyMd" tone="subdued">
                  Update existing Liquid, CSS, or JS templates. Merchants will instantly receive notification alerts on their dashboard.
                </Text>

                <Select label="Select Section *" options={sectionSelectOptions} onChange={handleSelectSectionToUpdate} value={relSectionId} />
                <TextField label="New Version Number *" value={relVerNum} onChange={setRelVerNum} placeholder="e.g. 1.0.1" autoComplete="off" />
                <TextField label="Changelog Summary" value={relChangelog} onChange={setRelChangelog} placeholder="Fix alignments, improve marquee speed" autoComplete="off" />

                <Text variant="headingSm" as="h4">Updated Source File</Text>
                <TextField label="Liquid Markup *" value={relLiquid} onChange={setRelLiquid} multiline={10} autoComplete="off" />

                <Button variant="primary" onClick={handleReleaseVersionSubmit} loading={isReleasing} disabled={isActionLoading}>
                  Publish New Version
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>

      {/* Edit Section Modal */}
      <Modal
        open={editingSection !== null}
        onClose={() => setEditingSection(null)}
        title="Edit Section Catalog Details & Code"
        primaryAction={{
          content: "Save Changes",
          onAction: handleUpdateSectionSubmit,
          loading: isUpdating,
          disabled: isActionLoading,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setEditingSection(null),
            disabled: isActionLoading,
          },
        ]}
        large
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Grid>
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                <TextField label="Section unique ID (Cannot be changed)" value={editingSection || ""} disabled autoComplete="off" />
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                <TextField label="Section Display Name *" value={editName} onChange={setEditName} placeholder="e.g. Feature Columns Showcase" autoComplete="off" />
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                <TextField label="Shopify theme filename handle *" value={editHandle} onChange={setEditHandle} placeholder="e.g. craftarchitech-feature-cols" autoComplete="off" />
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                <Select label="Category" options={categoryOptions} onChange={setEditCategory} value={editCategory} />
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                <TextField label="Price ($) *" type="number" value={editPrice} onChange={setEditPrice} placeholder="0.00" autoComplete="off" />
              </Grid.Cell>
            </Grid>

            <TextField label="Description" value={editDesc} onChange={setEditDesc} multiline={2} autoComplete="off" />
            <TextField label="Image Preview URL" value={editPreview} onChange={setEditPreview} placeholder="https://unsplash.com/..." autoComplete="off" />

            <InlineStack gap="300">
              <Checkbox label="Mark as Popular" checked={editPopular} onChange={setEditPopular} />
              <Checkbox label="Mark as New Release" checked={editNew} onChange={setEditNew} />
            </InlineStack>

            <Text variant="headingSm" as="h4">Code Source File (Latest Version)</Text>
            <TextField label="Liquid Markup & Settings Schema *" value={editLiquid} onChange={setEditLiquid} multiline={12} placeholder="{% schema %} ... {% endschema %}" autoComplete="off" />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
