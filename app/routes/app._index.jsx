import { useLoaderData, Link } from "react-router";
import {
  Page,
  Layout,
  Grid,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Icon,
  EmptyState,
  Box,
  IndexTable,
  Badge,
} from "@shopify/polaris";
import {
  StoreIcon,
  AppsIcon,
  AlertBubbleIcon,
  SettingsIcon,
  ChevronRightIcon,
  TextIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { seedSections } from "../services/sections.server";
import { useAppBridge } from "@shopify/app-bridge-react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // Auto-seed the library sections on load to guarantee library data exists
  await seedSections();

  const merchant = await prisma.merchant.findUnique({
    where: { shop },
  });
  const licenseKey = merchant?.licenseKey || "Not Activated";

  // Aggregate stats
  const totalInstalled = await prisma.installation.count({
    where: { shop },
  });

  const activeInstalled = await prisma.installation.count({
    where: { shop, status: "active" },
  });

  const totalLibrary = await prisma.section.count();

  // Find recent installations
  const recentInstalls = await prisma.installation.findMany({
    where: { shop },
    orderBy: { installedAt: "desc" },
    take: 5,
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

  // Calculate pending updates
  let updatesAvailable = 0;
  const installations = await prisma.installation.findMany({
    where: { shop },
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

  for (const inst of installations) {
    const latestVersion = inst.section.versions[0]?.versionNumber;
    if (latestVersion && inst.installedVersion !== latestVersion) {
      updatesAvailable++;
    }
  }

  return {
    shop,
    licenseKey,
    totalInstalled,
    activeInstalled,
    totalLibrary,
    updatesAvailable,
    recentInstalls: recentInstalls.map((inst) => ({
      id: inst.id,
      name: inst.section.name,
      category: inst.section.category,
      installedVersion: inst.installedVersion,
      latestVersion: inst.section.versions[0]?.versionNumber || "1.0.0",
      installedAt: new Date(inst.installedAt).toLocaleDateString(),
    })),
  };
};

export default function Dashboard() {
  const {
    licenseKey,
    totalInstalled,
    activeInstalled,
    totalLibrary,
    updatesAvailable,
    recentInstalls,
  } = useLoaderData();
  const shopify = useAppBridge();

  return (
    <Page title="CraftArchitech Dashboard">
      <BlockStack gap="500">
        {/* License Key Info */}
        <Card>
          <BlockStack gap="300">
            <BlockStack gap="100">
              <Text variant="headingMd" as="h3">
                Your Active License Key
              </Text>
              <Text variant="bodyMd" tone="subdued">
                Copy this key and paste it into the "CraftArchitech License Key" setting in your Theme Customizer to activate your premium sections.
              </Text>
            </BlockStack>
            <Box padding="300" background="bg-surface-secondary" borderRadius="200" borderStyle="dashed" borderWidth="025" borderColor="border">
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="bodyLg" fontWeight="bold" tone="success">
                  {licenseKey}
                </Text>
                <Button onClick={() => {
                  navigator.clipboard.writeText(licenseKey);
                  shopify.toast.show("License key copied to clipboard!");
                }}>
                  Copy Key
                </Button>
              </InlineStack>
            </Box>
          </BlockStack>
        </Card>

        {/* Metric Cards Grid */}
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
            <Card>
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text variant="headingSm" tone="subdued">
                    Total Installed
                  </Text>
                  <Icon source={AppsIcon} tone="base" />
                </InlineStack>
                <Text variant="heading3xl" as="p">
                  {totalInstalled}
                </Text>
              </BlockStack>
            </Card>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
            <Card>
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text variant="headingSm" tone="subdued">
                    Active Sections
                  </Text>
                  <Icon source={StoreIcon} tone="success" />
                </InlineStack>
                <Text variant="heading3xl" as="p">
                  {activeInstalled}
                </Text>
              </BlockStack>
            </Card>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
            <Card>
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text variant="headingSm" tone="subdued">
                    Updates Pending
                  </Text>
                  <Icon
                    source={AlertBubbleIcon}
                    tone={updatesAvailable > 0 ? "warning" : "base"}
                  />
                </InlineStack>
                <InlineStack gap="200" blockAlign="center">
                  <Text variant="heading3xl" as="p">
                    {updatesAvailable}
                  </Text>
                  {updatesAvailable > 0 && (
                    <Badge tone="warning">New Releases</Badge>
                  )}
                </InlineStack>
              </BlockStack>
            </Card>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
            <Card>
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text variant="headingSm" tone="subdued">
                    Library Catalog
                  </Text>
                  <Icon source={TextIcon} tone="info" />
                </InlineStack>
                <Text variant="heading3xl" as="p">
                  {totalLibrary}
                </Text>
              </BlockStack>
            </Card>
          </Grid.Cell>
        </Grid>

        {/* Dashboard Content */}
        <Layout>
          {/* Main Layout Area - Recent installations list */}
          <Layout.Section>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h2">
                    Recently Installed Sections
                  </Text>
                  {recentInstalls.length > 0 && (
                    <Button variant="plain" icon={ChevronRightIcon} as={Link} to="/app/installed">
                      View all
                    </Button>
                  )}
                </InlineStack>

                {recentInstalls.length === 0 ? (
                  <EmptyState
                    heading="No sections installed yet"
                    action={{
                      content: "Explore Sections Library",
                      url: "/app/library",
                    }}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>
                      Browse our library of premium, high-converting Liquid sections and install them into your active theme with a single click.
                    </p>
                  </EmptyState>
                ) : (
                  <IndexTable
                    resourceName={{
                      singular: "section",
                      plural: "sections",
                    }}
                    itemCount={recentInstalls.length}
                    headings={[
                      { title: "Section Name" },
                      { title: "Category" },
                      { title: "Version" },
                      { title: "Installed Date" },
                    ]}
                    selectable={false}
                  >
                    {recentInstalls.map((inst, index) => (
                      <IndexTable.Row id={inst.id} key={inst.id} position={index}>
                        <IndexTable.Cell>
                          <Text variant="bodyMd" fontWeight="semibold">
                            {inst.name}
                          </Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Badge>{inst.category}</Badge>
                        </IndexTable.Cell>
                        <IndexTable.Cell>v{inst.installedVersion}</IndexTable.Cell>
                        <IndexTable.Cell>{inst.installedAt}</IndexTable.Cell>
                      </IndexTable.Row>
                    ))}
                  </IndexTable>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Sidebar Area - Quick Actions */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Quick Actions
                  </Text>
                  <BlockStack gap="200">
                    <Button
                      fullWidth
                      textAlign="left"
                      icon={AppsIcon}
                      as={Link}
                      to="/app/library"
                    >
                      Browse Library
                    </Button>
                    <Button
                      fullWidth
                      textAlign="left"
                      icon={SettingsIcon}
                      as={Link}
                      to="/app/settings"
                    >
                      Configure Settings
                    </Button>
                  </BlockStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Resources & Help
                  </Text>
                  <Text variant="bodyMd" tone="subdued">
                    Need help customizing a section or setting up your licenses? Review our guides or contact support.
                  </Text>
                  <BlockStack gap="100">
                    <Button
                      variant="plain"
                      textAlign="left"
                      url="https://github.com"
                      target="_blank"
                    >
                      Documentation Portal
                    </Button>
                    <Button
                      variant="plain"
                      textAlign="left"
                      url="mailto:support@craftarchitech.com"
                    >
                      Email Customer Support
                    </Button>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
