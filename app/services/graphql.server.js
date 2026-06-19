/**
 * GraphQL Utilities for Shopify Admin API
 */

/**
 * Fetch general shop details from Shopify GraphQL API
 * @param {Object} admin - The authenticated Shopify Admin GraphQL client
 * @returns {Promise<Object>} The shop metadata details
 */
export async function getShopInfo(admin) {
  const query = `#graphql
    query getShopDetails {
      shop {
        id
        name
        email
        myshopifyDomain
        plan {
          displayName
          partnerDevelopment
        }
        currencyCode
        timezone
      }
    }
  `;

  try {
    const response = await admin.graphql(query);
    const responseJson = await response.json();
    return responseJson.data?.shop || null;
  } catch (error) {
    console.error("Error executing getShopDetails GraphQL query:", error);
    throw new Error(`GraphQL query failed: ${error.message}`);
  }
}

/**
 * Fetch online store themes from Shopify GraphQL API (read-only list)
 * Note: Theme asset file creation is performed via the REST Asset API, 
 * but general theme metadata can be fetched using GraphQL.
 * @param {Object} admin - The authenticated Shopify Admin GraphQL client
 * @returns {Promise<Array>} List of themes
 */
export async function getThemesListGraphQL(admin) {
  const query = `#graphql
    query getThemes {
      themes(first: 10) {
        edges {
          node {
            id
            name
            role
            createdAt
          }
        }
      }
    }
  `;

  try {
    const response = await admin.graphql(query);
    const responseJson = await response.json();
    const edges = responseJson.data?.themes?.edges || [];
    return edges.map(edge => edge.node);
  } catch (error) {
    console.error("Error executing getThemes GraphQL query:", error);
    throw new Error(`GraphQL query failed: ${error.message}`);
  }
}
