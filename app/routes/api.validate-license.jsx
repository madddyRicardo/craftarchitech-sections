import prisma from "../db.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const key = url.searchParams.get("key");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (!shop || !key) {
    return Response.json({ valid: false, reason: "Missing parameters" }, {
      headers: corsHeaders
    });
  }

  try {
    // Find the merchant record matching the shop name or domain
    const cleanShop = shop.replace("https://", "").replace("http://", "").split("/")[0];
    
    const merchant = await prisma.merchant.findFirst({
      where: {
        OR: [
          { shop: cleanShop },
          { shop: cleanShop.replace(".myshopify.com", "") },
          { shop: { contains: cleanShop } }
        ]
      }
    });

    if (merchant && merchant.licenseKey && merchant.licenseKey.trim() === key.trim()) {
      return Response.json({ valid: true }, {
        headers: corsHeaders
      });
    }

    return Response.json({ valid: false, reason: "Invalid license key or unregistered store" }, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error("License validation error:", error);
    return Response.json({ valid: false, error: error.message }, {
      headers: corsHeaders
    });
  }
};

export const action = async () => {
  return Response.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
};
