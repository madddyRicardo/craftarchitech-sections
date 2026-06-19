import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // Only display Super Admin option if it is our own admin/dev shop
  const isSuperAdmin = 
    session.shop === process.env.SUPER_ADMIN_SHOP || 
    session.shop.includes("craftarchitech") || 
    session.shop.includes("dev") || 
    session.shop.includes("quickstart");

  return { 
    apiKey: process.env.SHOPIFY_API_KEY || "",
    isSuperAdmin,
  };
};

export default function App() {
  const { apiKey, isSuperAdmin } = useLoaderData();

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
