import { useState, useEffect } from "react";
import { Outlet, useLoaderData, useRouteError, useLocation, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisProvider, Banner, Card, Text, TextField, Button, BlockStack, Box, Page, Layout } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import "@shopify/polaris/build/esm/styles.css";
import { authenticate } from "../shopify.server";
import { isAppEmbedEnabled } from "../services/theme.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // Find or initialize merchant record (starts with null/not activated)
  let merchant = await prisma.merchant.findUnique({
    where: { shop },
  });

  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: {
        shop,
        licenseKey: null,
        autoUpdate: false,
      },
    });
  }

  // Validate active license key in DB
  let isActivated = false;
  if (merchant && merchant.licenseKey) {
    const activeLicense = await prisma.license.findFirst({
      where: {
        key: merchant.licenseKey,
        type: "app",
        status: "active",
        shop,
      },
    });
    isActivated = !!activeLicense;
  }

  const appEmbedEnabled = await isAppEmbedEnabled(session);
  
  // Only display Super Admin option if it is our own admin/dev shop
  const isSuperAdmin = 
    session.shop === process.env.SUPER_ADMIN_SHOP || 
    session.shop.includes("craftarchitech") || 
    session.shop.includes("dev") || 
    session.shop.includes("quickstart");

  return { 
    apiKey: process.env.SHOPIFY_API_KEY || "",
    isSuperAdmin,
    shop,
    appEmbedEnabled,
    isActivated,
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "activate_app") {
    const key = formData.get("licenseKey")?.trim();
    if (!key) {
      return Response.json({ success: false, error: "Please enter a license key." });
    }

    const license = await prisma.license.findUnique({
      where: { key },
    });

    if (!license || license.type !== "app" || license.status !== "active") {
      return Response.json({ success: false, error: "Invalid license key. Please check and try again." });
    }

    if (license.shop && license.shop !== shop) {
      return Response.json({ success: false, error: "This license key is already activated on another store." });
    }

    // Activate the license key
    await prisma.license.update({
      where: { id: license.id },
      data: {
        shop,
        activatedAt: new Date(),
      },
    });

    // Update merchant's active licenseKey
    await prisma.merchant.upsert({
      where: { shop },
      update: { licenseKey: key },
      create: { shop, licenseKey: key },
    });

    return Response.json({ success: true, message: "App activated successfully!" });
  }

  return Response.json({ success: false, error: "Invalid action." });
};

export default function App() {
  const { apiKey, isSuperAdmin, shop, appEmbedEnabled, isActivated } = useLoaderData();
  const location = useLocation();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const [licenseKeyInput, setLicenseKeyInput] = useState("");
  const isActivating = fetcher.state !== "idle";

  // Handle toast warnings and messages
  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        shopify.toast.show(fetcher.data.message);
      } else if (fetcher.data.error) {
        shopify.toast.show(fetcher.data.error, { isError: true });
      }
    }
  }, [fetcher.data, shopify]);

  const isSuperAdminRoute = location.pathname.includes("/super-admin");

  // Enforce Activation Form unless they are on the Super Admin path
  if (!isActivated && !isSuperAdminRoute) {
    return (
      <AppProvider embedded apiKey={apiKey}>
        <PolarisProvider i18n={{}}>
          <Page title="Activate CraftArchitech Sections">
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h3">
                      Enter Application License Key
                    </Text>
                    <Text variant="bodyMd" tone="subdued">
                      Please enter your 16-character license key to activate the CraftArchitech Sections application on your store.
                    </Text>
                    <fetcher.Form method="post">
                      <input type="hidden" name="actionType" value="activate_app" />
                      <BlockStack gap="300">
                        <TextField
                          label="License Key"
                          name="licenseKey"
                          value={licenseKeyInput}
                          onChange={setLicenseKeyInput}
                          placeholder="CRAFT-XXXX-XXXX-XXXX"
                          autoComplete="off"
                          disabled={isActivating}
                        />
                        <Button variant="primary" submit loading={isActivating}>
                          Activate App
                        </Button>
                      </BlockStack>
                    </fetcher.Form>
                    <Box padding="200" background="bg-surface-secondary" borderRadius="100">
                      <Text variant="bodySm" tone="subdued">
                        Need an activation license key? Buy one for $29.00 USD on our licensing portal or request one from admin support.
                      </Text>
                    </Box>
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>
          </Page>
        </PolarisProvider>
      </AppProvider>
    );
  }

  return (
    <AppProvider embedded apiKey={apiKey}>
      <PolarisProvider i18n={{}}>
        <s-app-nav>
          <s-link href="/app">Dashboard</s-link>
          <s-link href="/app/library">Sections Library</s-link>
          <s-link href="/app/installed">Installed Sections</s-link>
          <s-link href="/app/settings">Settings</s-link>
          {isSuperAdmin && <s-link href="/app/super-admin">Super Admin</s-link>}
        </s-app-nav>
        {!appEmbedEnabled && (
          <div style={{ padding: "16px 20px 0" }}>
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
          </div>
        )}
        <Outlet />
      </PolarisProvider>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
