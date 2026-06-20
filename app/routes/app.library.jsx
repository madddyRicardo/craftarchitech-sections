import { useState, useEffect } from "react";
import { useLoaderData, useFetcher, redirect } from "react-router";
import {
  Page,
  Layout,
  Grid,
  Text,
  BlockStack,
  InlineStack,
  TextField,
  Select,
  Box,
  EmptyState,
  Banner,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { getSectionsList } from "../services/sections.server";
import { installSection, updateSection, uninstallSection } from "../services/installer.server";
import SectionCard from "../components/SectionCard";
import PreviewModal from "../components/PreviewModal";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // Retrieve the library sections and installed logs
  const librarySections = await getSectionsList();
  const installations = await prisma.installation.findMany({
    where: { shop },
  });

  // Get active section license keys for this shop domain
  const shopLicenses = await prisma.license.findMany({
    where: {
      shop,
      status: "active",
    },
  });

  const unlockedSectionIds = new Set(
    shopLicenses
      .filter((l) => l.type === "section" && l.sectionId)
      .map((l) => l.sectionId)
  );

  const mappedLibrarySections = librarySections.map((s) => ({
    ...s,
    isUnlocked: s.price === 0 || unlockedSectionIds.has(s.id),
  }));

  const url = new URL(request.url);
  const installedSuccess = url.searchParams.get("installed_success") === "true";

  return {
    shop,
    librarySections: mappedLibrarySections,
    installations: installations.map((inst) => ({
      id: inst.id,
      sectionId: inst.sectionId,
      installedVersion: inst.installedVersion,
      themeId: inst.themeId,
    })),
    installedSuccess,
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const sectionId = formData.get("sectionId");
  const installationId = formData.get("installationId");

  try {
    if (actionType === "install") {
      const section = await prisma.section.findUnique({
        where: { id: sectionId },
      });

      if (section && section.price > 0) {
        // Verify they have unlocked this section
        const hasLicense = await prisma.license.findFirst({
          where: {
            shop,
            type: "section",
            sectionId: section.id,
            status: "active",
          },
        });

        if (!hasLicense) {
          return Response.json({ success: false, error: "Please activate this premium section with a valid license key first." });
        }
      }

      await installSection(session, sectionId);
      return Response.json({ success: true, message: "Section installed successfully!" });
    }

    if (actionType === "activate_section") {
      const licenseKey = formData.get("licenseKey")?.trim();
      if (!licenseKey) {
        return Response.json({ success: false, error: "Please enter a section activation key." });
      }

      const license = await prisma.license.findUnique({
        where: { key: licenseKey },
      });

      if (!license || license.type !== "section" || license.sectionId !== sectionId || license.status !== "active") {
        return Response.json({ success: false, error: "Invalid license key for this premium section." });
      }

      if (license.shop && license.shop !== shop) {
        return Response.json({ success: false, error: "This license key is already used by another store." });
      }

      // Activate the key
      await prisma.license.update({
        where: { id: license.id },
        data: {
          shop,
          activatedAt: new Date(),
        },
      });

      return Response.json({ success: true, message: "Section unlocked successfully! You can now install it." });
    }

    if (actionType === "update") {
      await updateSection(session, installationId);
      return Response.json({ success: true, message: "Section updated to latest version!" });
    }

    if (actionType === "uninstall") {
      await uninstallSection(session, installationId);
      return Response.json({ success: true, message: "Section removed from theme." });
    }

    return Response.json({ success: false, error: "Invalid action." });
  } catch (error) {
    console.error("Action error:", error);
    return Response.json({ success: false, error: error.message });
  }
};

export default function SectionsLibrary() {
  const { shop, librarySections, installations, installedSuccess } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Live Preview Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSection, setPreviewSection] = useState(null);

  // Sync action feedback toasts
  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        shopify.toast.show(fetcher.data.message);
      } else if (fetcher.data.error) {
        shopify.toast.show(fetcher.data.error, { isError: true });
      }
    }
  }, [fetcher.data, shopify]);

  // Show success toast on redirect back from checkout
  useEffect(() => {
    if (installedSuccess) {
      shopify.toast.show("Premium section installed successfully!");
      // Clean query parameter from address bar
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [installedSuccess, shopify]);

  const handleInstall = (sectionId) => {
    fetcher.submit(
      { actionType: "install", sectionId },
      { method: "POST" }
    );
  };

  const handleActivate = (sectionId, licenseKey) => {
    fetcher.submit(
      { actionType: "activate_section", sectionId, licenseKey },
      { method: "POST" }
    );
  };

  const handleUpdate = (installationId) => {
    fetcher.submit(
      { actionType: "update", installationId },
      { method: "POST" }
    );
  };

  const handleUninstall = (installationId) => {
    fetcher.submit(
      { actionType: "uninstall", installationId },
      { method: "POST" }
    );
  };

  const handlePreview = (section) => {
    setPreviewSection(section);
    setIsPreviewOpen(true);
  };

  // Predefined Categories
  const categoryOptions = [
    { label: "All Categories", value: "All" },
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

  // Status Filter Options
  const statusOptions = [
    { label: "All Statuses", value: "All" },
    { label: "Popular", value: "Popular" },
    { label: "New Releases", value: "New" },
    { label: "Installed", value: "Installed" },
    { label: "Not Installed", value: "NotInstalled" },
  ];

  // Filter sections list
  const filteredSections = librarySections.filter((section) => {
    // 1. Search Query filter
    const matchesSearch =
      section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category filter
    const matchesCategory =
      selectedCategory === "All" || section.category === selectedCategory;

    // 3. Status filter
    const inst = installations.find((i) => i.sectionId === section.id);
    const isInstalled = !!inst;

    let matchesStatus = true;
    if (selectedStatus === "Popular") matchesStatus = section.isPopular;
    if (selectedStatus === "New") matchesStatus = section.isNew;
    if (selectedStatus === "Installed") matchesStatus = isInstalled;
    if (selectedStatus === "NotInstalled") matchesStatus = !isInstalled;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const isLoading = fetcher.state !== "idle";

  return (
    <Page title="Sections Library">
      <BlockStack gap="400">
        {/* Filters Card */}
        <Box padding="400" background="bg-surface" borderRadius="200" borderStyle="solid" borderWidth="025" borderColor="border">
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
              <TextField
                label="Search sections"
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name, description..."
                clearButton
                onClearButtonClick={() => setSearchQuery("")}
                autoComplete="off"
              />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <Select
                label="Category"
                options={categoryOptions}
                onChange={setSelectedCategory}
                value={selectedCategory}
              />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <Select
                label="Filter by Status"
                options={statusOptions}
                onChange={setSelectedStatus}
                value={selectedStatus}
              />
            </Grid.Cell>
          </Grid>
        </Box>

        {/* Sections Grid */}
        {filteredSections.length === 0 ? (
          <Box padding="1200" background="bg-surface" borderRadius="200" textAlign="center">
            <EmptyState
              heading="No matching sections found"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>Try adjustments to your search queries or category filters.</p>
            </EmptyState>
          </Box>
        ) : (
          <Grid>
            {filteredSections.map((section) => {
              const inst = installations.find((i) => i.sectionId === section.id);
              const isInstalled = !!inst;
              const hasUpdate = isInstalled && inst.installedVersion !== section.latestVersion;

              return (
                <Grid.Cell
                  key={section.id}
                  columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}
                >
                  <SectionCard
                    section={section}
                    isInstalled={isInstalled}
                    hasUpdate={hasUpdate}
                    installedVersion={inst?.installedVersion}
                    isUnlocked={section.isUnlocked}
                    onInstall={() => handleInstall(section.id)}
                    onActivate={(licenseKey) => handleActivate(section.id, licenseKey)}
                    onUpdate={() => handleUpdate(inst.id)}
                    onUninstall={() => handleUninstall(inst.id)}
                    onPreview={() => handlePreview(section)}
                    isActionLoading={isLoading}
                  />
                </Grid.Cell>
              );
            })}
          </Grid>
        )}
      </BlockStack>

      {/* Live Preview Modal */}
      <PreviewModal
        open={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewSection(null);
        }}
        section={previewSection}
      />
    </Page>
  );
}
