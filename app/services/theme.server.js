/**
 * Theme Service for communicating with Shopify Theme Files API (Asset API)
 */

const API_VERSION = "2026-04";

/**
 * Get the active theme ID for a shop
 * @param {Object} session - The authenticated Shopify session
 * @returns {Promise<string>} - The active theme ID
 */
export async function getActiveThemeId(session) {
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
  console.log(`[Theme API] Loaded ${data.themes?.length} themes:`, JSON.stringify(data.themes));
  
  const activeTheme = data.themes.find((theme) => theme.role === "main");

  if (!activeTheme) {
    throw new Error("No active theme found for this shop.");
  }

  console.log(`[Theme API] Found active theme ID: ${activeTheme.id} (${activeTheme.name})`);
  return activeTheme.id.toString();
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
