import React, { useState } from "react";
import { Card, Text, Button, Badge, Box, BlockStack, InlineStack, TextField } from "@shopify/polaris";

/**
 * SectionCard Component
 * Renders a card for the Sections Library.
 * 
 * @param {Object} props
 * @param {Object} props.section - The section object from database
 * @param {boolean} props.isInstalled - Whether the section is installed
 * @param {boolean} props.hasUpdate - Whether a new version is available
 * @param {string} props.installedVersion - The version currently installed
 * @param {boolean} props.isUnlocked - Whether the section is unlocked/purchased
 * @param {Function} props.onInstall - Handler for installation
 * @param {Function} props.onActivate - Handler for section activation
 * @param {Function} props.onUpdate - Handler for updates
 * @param {Function} props.onUninstall - Handler for removal
 * @param {Function} props.onPreview - Handler for triggering live preview
 * @param {boolean} props.isActionLoading - Loading state for action buttons
 */
export default function SectionCard({
  section,
  isInstalled,
  hasUpdate,
  installedVersion,
  isUnlocked = true,
  onInstall,
  onActivate,
  onUpdate,
  onUninstall,
  onPreview,
  isActionLoading = false,
}) {
  const [activationKey, setActivationKey] = useState("");
  const [showActivationInput, setShowActivationInput] = useState(false);

  const handleActivateSubmit = () => {
    if (activationKey.trim()) {
      onActivate(activationKey.trim());
    }
  };

  return (
    <Card roundedAbove="sm">
      <BlockStack gap="400">
        {/* Section Preview Image */}
        <div
          style={{
            position: "relative",
            height: "180px",
            overflow: "hidden",
            borderRadius: "8px",
            backgroundColor: "#f4f6f8",
          }}
        >
          {section.previewUrl ? (
            <img
              src={section.previewUrl}
              alt={section.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            />
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              style={{ height: "100%" }}
            >
              <Text variant="bodyMd" tone="subdued">
                No Preview Available
              </Text>
            </Box>
          )}

          {/* Badges Overlay */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              display: "flex",
              gap: "6px",
              zIndex: 10,
            }}
          >
            {section.isPopular && <Badge tone="attention">Popular</Badge>}
            {section.isNew && <Badge tone="info">New</Badge>}
          </div>

          {/* Category Badge overlay bottom right */}
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              zIndex: 10,
            }}
          >
            <Badge size="small">{section.category}</Badge>
          </div>
        </div>

        {/* Section Details */}
        <BlockStack gap="200">
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="050">
              <Text variant="headingMd" as="h3">
                {section.name}
              </Text>
              <div style={{ marginTop: "2px" }}>
                {section.price === 0 ? (
                  <Badge tone="success">Free</Badge>
                ) : (
                  <Badge tone="attention">${section.price.toFixed(2)}</Badge>
                )}
              </div>
            </BlockStack>
          </InlineStack>

          <Box minHeight="60px">
            <Text variant="bodyMd" tone="subdued">
              {section.description}
            </Text>
          </Box>
        </BlockStack>

        {/* Installed Status Info */}
        {isInstalled && (
          <Box
            padding="200"
            background="bg-surface-secondary"
            borderRadius="200"
          >
            <InlineStack align="space-between">
              <Text variant="bodySm">
                Installed version: <span style={{ fontWeight: 600 }}>v{installedVersion}</span>
              </Text>
              {hasUpdate ? (
                <Badge tone="warning">Update Available (v{section.latestVersion})</Badge>
              ) : (
                <Badge tone="success">Up to Date</Badge>
              )}
            </InlineStack>
          </Box>
        )}

        {/* Action Buttons */}
        {showActivationInput && !isInstalled && !isUnlocked ? (
          <BlockStack gap="200">
            <TextField
              label="Enter Section License Key"
              value={activationKey}
              onChange={setActivationKey}
              placeholder="CRAFT-XXXX-XXXX-XXXX"
              autoComplete="off"
              disabled={isActionLoading}
            />
            <InlineStack gap="200">
              <Button
                variant="primary"
                onClick={handleActivateSubmit}
                loading={isActionLoading}
              >
                Activate Section
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowActivationInput(false)}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
            </InlineStack>
          </BlockStack>
        ) : (
          <InlineStack gap="200" align="space-between">
            <Button onClick={onPreview} variant="secondary">
              Live Preview
            </Button>

            <InlineStack gap="100">
              {isInstalled ? (
                <>
                  {hasUpdate && (
                    <Button
                      onClick={onUpdate}
                      variant="primary"
                      loading={isActionLoading}
                    >
                      Update
                    </Button>
                  )}
                  <Button
                    onClick={onUninstall}
                    tone="critical"
                    variant="secondary"
                    loading={isActionLoading}
                  >
                    Remove
                  </Button>
                </>
              ) : !isUnlocked ? (
                <Button
                  onClick={() => setShowActivationInput(true)}
                  variant="primary"
                >
                  Unlock Section
                </Button>
              ) : (
                <Button
                  onClick={onInstall}
                  variant="primary"
                  loading={isActionLoading}
                >
                  1-Click Install
                </Button>
              )}
            </InlineStack>
          </InlineStack>
        )}
      </BlockStack>
    </Card>
  );
}
