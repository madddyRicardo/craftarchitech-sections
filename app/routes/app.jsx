import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisProvider, Banner } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import { authenticate } from "../shopify.server";
import { isAppEmbedEnabled } from "../services/theme.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // Check and generate license key for the merchant if missing
  let merchant = await prisma.merchant.findUnique({
    where: { shop },
  });

  const generateRandomLicenseKey = () => {
    return `CRAFT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: {
        shop,
        licenseKey: generateRandomLicenseKey(),
        autoUpdate: false,
      },
    });
  } else if (!merchant.licenseKey) {
    merchant = await prisma.merchant.update({
      where: { id: merchant.id },
      data: {
        licenseKey: generateRandomLicenseKey(),
      },
    });
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
  };
};

export default function App() {
  const { apiKey, isSuperAdmin, shop, appEmbedEnabled } = useLoaderData();

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
