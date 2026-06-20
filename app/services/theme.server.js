/**
 * Theme Service for communicating with Shopify Theme Files API (Asset API)
 */

const API_VERSION = "2026-04";

// In-memory cache for active theme ID and app embed status to optimize performance
const themeIdCache = new Map(); // key: shop, value: { id: string, expiresAt: number }
const embedStatusCache = new Map(); // key: shop, value: { enabled: boolean, expiresAt: number }

const THEME_ID_TTL = 5 * 60 * 1000; // 5 minutes
const EMBED_STATUS_TTL = 15 * 1000; // 15 seconds

/**
 * Get the active theme ID for a shop
 * @param {Object} session - The authenticated Shopify session
 * @returns {Promise<string>} - The active theme ID
 */
export async function getActiveThemeId(session) {
  const shop = session.shop;
  const cached = themeIdCache.get(shop);
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`[Theme API] Using cached theme ID for ${shop}: ${cached.id}`);
    return cached.id;
  }

  const url = `https://${session.shop}/admin/api/${API_VERSION}/themes.json`;
  
  console.log(`[Theme API] Fetching themes for shop: ${session.shop} using scopes: ${session.scope}`);
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": session.accessToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Theme API] Failed to fetch themes: status=${response.status}`, errorText);
    throw new Error(`Failed to fetch themes: ${response.statusText}. Details: ${errorText}`);
  }

  const data = await response.json();
  const activeTheme = data.themes.find((theme) => theme.role === "main");

  if (!activeTheme) {
    throw new Error("No active theme found for this shop.");
  }

  const themeId = activeTheme.id.toString();
  console.log(`[Theme API] Found active theme ID: ${themeId} (${activeTheme.name})`);
  
  themeIdCache.set(shop, {
    id: themeId,
    expiresAt: Date.now() + THEME_ID_TTL,
  });

  return themeId;
}

/**
 * Write a theme asset (liquid section, css, or js file) to the specified theme
 * @param {Object} session - The authenticated Shopify session
 * @param {string} themeId - The target theme ID
 * @param {string} key - The asset key (e.g., 'sections/my-section.liquid' or 'assets/my-section.css')
 * @param {string} value - The content to write
 * @returns {Promise<Object>} - The Shopify API response
 */
export async function createThemeAsset(session, themeId, key, value) {
  const url = `https://${session.shop}/admin/api/${API_VERSION}/themes/${themeId}/assets.json`;
  
  console.log(`[Theme API] Writing asset to: ${url} with key: ${key}`);
  
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "X-Shopify-Access-Token": session.accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      asset: {
        key,
        value,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Theme API] Failed to write asset: status=${response.status} key=${key}`, errorText);
    throw new Error(`Failed to create theme asset ${key}: ${response.statusText}. Details: ${errorText}`);
  }

  console.log(`[Theme API] Successfully wrote asset: ${key}`);
  return await response.json();
}

/**
 * Delete a theme asset from the specified theme
 * @param {Object} session - The authenticated Shopify session
 * @param {string} themeId - The target theme ID
 * @param {string} key - The asset key to delete (e.g., 'sections/my-section.liquid')
 * @returns {Promise<Object>} - The Shopify API response
 */
export async function deleteThemeAsset(session, themeId, key) {
  const url = `https://${session.shop}/admin/api/${API_VERSION}/themes/${themeId}/assets.json?asset[key]=${key}`;
  
  console.log(`[Theme API] Deleting asset at: ${url}`);
  
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "X-Shopify-Access-Token": session.accessToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Theme API] Failed to delete asset: status=${response.status} key=${key}`, errorText);
    throw new Error(`Failed to delete theme asset ${key}: ${response.statusText}. Details: ${errorText}`);
  }

  console.log(`[Theme API] Successfully deleted asset: ${key}`);
  return await response.json();
}

/**
 * Check if the theme app embed is active in the current main theme
 * @param {Object} session - The authenticated Shopify session
 * @returns {Promise<boolean>} - True if enabled, false if disabled or not found
 */
export async function isAppEmbedEnabled(session) {
  const shop = session.shop;
  const cached = embedStatusCache.get(shop);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.enabled;
  }

  try {
    const themeId = await getActiveThemeId(session);
    const url = `https://${session.shop}/admin/api/${API_VERSION}/themes/${themeId}/assets.json?asset[key]=config/settings_data.json`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": session.accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`[Theme API] Failed to fetch settings_data.json: status=${response.status}`);
      return false;
    }

    const data = await response.json();
    if (!data.asset || !data.asset.value) {
      return false;
    }

    const settings = JSON.parse(data.asset.value);
    const blocks = settings.current?.blocks || {};
    
    let enabled = false;
    // Look for a block with our app embed type and check if it is NOT disabled
    for (const block of Object.values(blocks)) {
      if (block.type && block.type.includes("shopify://apps/") && block.type.includes("/blocks/app-embed")) {
        enabled = block.disabled !== true;
        break;
      }
    }
    
    embedStatusCache.set(shop, {
      enabled,
      expiresAt: Date.now() + EMBED_STATUS_TTL,
    });

    return enabled;
  } catch (error) {
    console.error("[Theme API] Error checking app embed status:", error);
    return false;
  }
}
