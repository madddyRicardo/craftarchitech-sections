import { useState, useEffect } from "react";
import { useLoaderData, useFormAction, useSubmit, useActionData } from "react-router";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  TextField,
  Checkbox,
  Button,
  InlineStack,
  Link,
  Banner,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getOrCreateMerchant } from "../services/installer.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const merchant = await getOrCreateMerchant(shop);

  return {
    licenseKey: merchant.licenseKey || "",
    customAccessToken: merchant.customAccessToken || "",
    autoUpdate: merchant.autoUpdate,
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const licenseKey = formData.get("licenseKey");
  const customAccessToken = formData.get("customAccessToken");
  const autoUpdate = formData.get("autoUpdate") === "true";

  try {
    const updatedMerchant = await prisma.merchant.update({
      where: { shop },
      data: {
        licenseKey,
        customAccessToken,
        autoUpdate,
      },
    });

    return { success: true, message: "Settings saved successfully!", merchant: updatedMerchant };
  } catch (error) {
    console.error("Settings action error:", error);
    return { success: false, error: error.message };
  }
};

export default function Settings() {
  const initialSettings = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const shopify = useAppBridge();

  const [licenseKey, setLicenseKey] = useState(initialSettings.licenseKey);
  const [customAccessToken, setCustomAccessToken] = useState(initialSettings.customAccessToken);
  const [autoUpdate, setAutoUpdate] = useState(initialSettings.autoUpdate);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if state changed from loader data to enable Save button
    if (
      licenseKey !== initialSettings.licenseKey ||
      customAccessToken !== initialSettings.customAccessToken ||
      autoUpdate !== initialSettings.autoUpdate
    ) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [licenseKey, customAccessToken, autoUpdate, initialSettings]);

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        shopify.toast.show(actionData.message);
        setHasChanges(false);
      } else if (actionData.error) {
        shopify.toast.show(actionData.error, { isError: true });
      }
    }
  }, [actionData, shopify]);

  const handleSave = () => {
    submit(
      {
        licenseKey,
        customAccessToken,
        autoUpdate: String(autoUpdate),
      },
      { method: "POST" }
    );
  };

  return (
    <Page
      title="Settings"
      subtitle="Configure licensing, updates, and access support resources."
    >
      <Layout>
        {/* Settings Form Column */}
        <Layout.Section>
          <BlockStack gap="400">
            {/* Licensing Card */}
            <Card roundedAbove="sm">
              <BlockStack gap="300">
                <Text variant="headingMd" as="h3">
                  Licensing
                </Text>
                <Text variant="bodyMd" tone="subdued">
                  Enter your CraftArchitech license key to unlock advanced premium sections and get lifetime customer support.
                </Text>
                <TextField
                  label="License Key"
                  value={licenseKey}
                  onChange={setLicenseKey}
                  placeholder="CA-XXXXX-XXXXX-XXXXX"
                  autoComplete="off"
                />
              </BlockStack>
            </Card>

            {/* Custom App / Theme Access Credentials Card */}
            <Card roundedAbove="sm">
              <BlockStack gap="300">
                <Text variant="headingMd" as="h3">
                  Shopify API Theme Write Override
                </Text>
                <Text variant="bodyMd" tone="subdued">
                  Shopify restricts public Partner Apps from creating or modifying theme code files (Asset API) unless granted a manual App Store exemption.
                </Text>
                <Banner tone="info" title="Bypass theme file write restrictions">
                  To automatically install liquid sections directly into your theme, you can input a <strong>Custom App Admin API Access Token</strong> or <strong>Theme Access Password</strong>. Custom tokens have unrestricted access to write theme files.
                </Banner>
                <TextField
                  label="Theme Write Custom Access Token / Password"
                  value={customAccessToken}
                  onChange={setCustomAccessToken}
                  placeholder="shpat_xxx... or theme password"
                  autoComplete="off"
                  type="password"
                  helpText={
                    <span>
                      How to get this: Create a Custom App in your Shopify Admin (<em>Settings &gt; Develop Apps &gt; Create an app &gt; Configure Admin API Integration &gt; Select 'write_themes' and 'read_themes' &gt; Install app</em>) and copy the Admin API access token.
                    </span>
                  }
                />
              </BlockStack>
            </Card>

            {/* Updates Settings Card */}
            <Card roundedAbove="sm">
              <BlockStack gap="300">
                <Text variant="headingMd" as="h3">
                  Updates Preferences
                </Text>
                <Checkbox
                  label="Enable Auto Updates"
                  helpText="Automatically overwrite themes asset code files with newly released section updates. This ensures your theme always has the latest bug fixes, security patches, and performance optimizations."
                  checked={autoUpdate}
                  onChange={setAutoUpdate}
                />
              </BlockStack>
            </Card>

            {/* Save Buttons Panel */}
            <InlineStack align="end" gap="200">
              <Button
                variant="secondary"
                disabled={!hasChanges}
                onClick={() => {
                  setLicenseKey(initialSettings.licenseKey);
                  setCustomAccessToken(initialSettings.customAccessToken);
                  setAutoUpdate(initialSettings.autoUpdate);
                }}
              >
                Discard Changes
              </Button>
              <Button variant="primary" disabled={!hasChanges} onClick={handleSave}>
                Save Settings
              </Button>
            </InlineStack>
          </BlockStack>
        </Layout.Section>

        {/* Support & Docs Sidebar Column */}
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h3">
                  Quick Help Links
                </Text>
                <Text variant="bodyMd" tone="subdued">
                  Need documentation on custom section installation or theme layout settings?
                </Text>
                <BlockStack gap="100">
                  <Link url="https://github.com" target="_blank">
                    Read Shopify Theme Integration Guide
                  </Link>
                  <Link url="https://github.com" target="_blank">
                    Premium Sections Customizer Schema Documentation
                  </Link>
                </BlockStack>
              </BlockStack>
            </Card>

              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Contact Us
                  </Text>
                  <Text variant="bodyMd" tone="subdued">
                    Encountered an issue or have a feature request? Get in touch with our engineering team directly.
                  </Text>
                  <Button variant="plain" url="mailto:support@craftarchitech.com">
                    Email support@craftarchitech.com
                  </Button>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
      </Layout>
    </Page>
  );
}
