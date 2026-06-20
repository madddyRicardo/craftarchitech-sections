import { useEffect } from "react";
import { useLoaderData, useFetcher, Link } from "react-router";
import {
  Page,
  Card,
  IndexTable,
  Text,
  Badge,
  Button,
  InlineStack,
  BlockStack,
  EmptyState,
  Banner,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { updateSection, uninstallSection } from "../services/installer.server";
import { isAppEmbedEnabled } from "../services/theme.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const appEmbedEnabled = await isAppEmbedEnabled(session);

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

  return {
    shop,
    appEmbedEnabled,
    installations: installations.map((inst) => {
      const latestVersion = inst.section.versions[0]?.versionNumber || "1.0.0";
      return {
        id: inst.id,
        name: inst.section.name,
        category: inst.section.category,
        installedVersion: inst.installedVersion,
        latestVersion,
        hasUpdate: inst.installedVersion !== latestVersion,
        themeId: inst.themeId,
        status: inst.status,
        installedAt: new Date(inst.installedAt).toLocaleDateString(),
      };
    }),
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const installationId = formData.get("installationId");

  try {
    if (actionType === "update") {
      await updateSection(session, installationId);
      return { success: true, message: "Section updated successfully!" };
    } else if (actionType === "uninstall") {
      await uninstallSection(session, installationId);
      return { success: true, message: "Section uninstalled successfully!" };
    }
    return { success: false, error: "Invalid action." };
  } catch (error) {
    console.error("Action error:", error);
    return { success: false, error: error.message };
  }
};

export default function InstalledSections() {
  const { shop, installations, appEmbedEnabled } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        shopify.toast.show(fetcher.data.message);
      } else if (fetcher.data.error) {
        shopify.toast.show(fetcher.data.error, { isError: true });
      }
    }
  }, [fetcher.data, shopify]);

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

  const resourceName = {
    singular: "installed section",
    plural: "installed sections",
  };

  const isLoading = fetcher.state !== "idle";

  return (
    <Page title="Installed Sections">
      <BlockStack gap="400">
        {!appEmbedEnabled && (
          <Banner
            title="Enable CraftArchitech Sections App Embed"
            action={{
              content: "Enable in Theme Editor",
              url: `https://${shop}/admin/themes/current/editor?context=apps`,
              external: true,
            }}
            tone="warning"
          >
            <p>
              To ensure all installed sections display and function correctly on your storefront, please verify that our App Embed is enabled in your active theme editor.
            </p>
          </Banner>
        )}

        {installations.length === 0 ? (
          <Card>
            <EmptyState
              heading="No custom sections installed yet"
              action={{
                content: "Browse Library",
                url: "/app/library",
              }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>
                Explore our collection of custom theme sections. You can install them into your online store theme with a single click.
              </p>
            </EmptyState>
          </Card>
      ) : (
        <Card padding="0">
          <IndexTable
            resourceName={resourceName}
            itemCount={installations.length}
            headings={[
              { title: "Section" },
              { title: "Category" },
              { title: "Active Theme" },
              { title: "Installed Version" },
              { title: "Status" },
              { title: "Installed Date" },
              { title: "Actions", alignment: "right" },
            ]}
            selectable={false}
          >
            {installations.map((inst, index) => (
              <IndexTable.Row
                id={inst.id}
                key={inst.id}
                position={index}
              >
                <IndexTable.Cell>
                  <Text variant="bodyMd" fontWeight="semibold">
                    {inst.name}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Badge>{inst.category}</Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text tone="subdued">ID: {inst.themeId}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <InlineStack gap="100" blockAlign="center">
                    <span>v{inst.installedVersion}</span>
                    {inst.hasUpdate && (
                      <Badge tone="warning">Update Available (v{inst.latestVersion})</Badge>
                    )}
                  </InlineStack>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Badge tone="success">{inst.status}</Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>{inst.installedAt}</IndexTable.Cell>
                <IndexTable.Cell>
                  <InlineStack align="end" gap="200">
                    {inst.hasUpdate && (
                      <Button
                        variant="primary"
                        onClick={() => handleUpdate(inst.id)}
                        loading={isLoading}
                      >
                        Update
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      tone="critical"
                      onClick={() => handleUninstall(inst.id)}
                      loading={isLoading}
                    >
                      Uninstall
                    </Button>
                  </InlineStack>
                </IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
        </Card>
      )}
      </BlockStack>
    </Page>
  );
}
