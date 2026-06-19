import React from "react";
import { Modal, Box, Text } from "@shopify/polaris";

/**
 * PreviewModal Component
 * Renders a sandboxed interactive live preview of the custom section.
 */
export default function PreviewModal({ open, onClose, section }) {
  if (!section) return null;

  // Function to convert Liquid code into plain mock HTML for the iframe preview
  const generatePreviewSrcDoc = () => {
    let htmlContent = section.liquidCode || "";

    // 1. Strip schema
    htmlContent = htmlContent.replace(/{%\s*schema\s*%}[\s\S]*?{%\s*endschema\s*%}/g, "");

    // 2. Strip comments
    htmlContent = htmlContent.replace(/{%-?\s*comment\s*-?%}[\s\S]*?{%-?\s*endcomment\s*-?%}/g, "");

    // 3. Replace Shopify filters and asset imports
    htmlContent = htmlContent.replace(/\{\{\s*'[^']+'\s*\|\s*asset_url\s*\|\s*stylesheet_tag\s*\}\}/g, "");
    htmlContent = htmlContent.replace(/\{\{\s*'[^']+'\s*\|\s*asset_url\s*\|\s*script_tag\s*\}\}/g, "");
    htmlContent = htmlContent.replace(/\{\{\s*'[^']+'\s*\|\s*asset_url\s*\|\s*script_tag\s*\}\}/g, "");
    htmlContent = htmlContent.replace(/\{\{\s*section\.id\s*\}\}/g, "preview-id");

    // 4. Mock settings parameters
    // Hero
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.bg_color\s*\}\}/g, "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)");
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.badge\s*\}\}/g, "NEW ARRIVALS");
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.title\s*\}\}/g, section.name);
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.subtitle\s*\}\}/g, section.description);
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.btn1_text\s*\}\}/g, "Shop Now");
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.btn2_text\s*\}\}/g, "Learn More");
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.image\s*\|\s*image_url:\s*width:\s*\d+\s*\}\}/g, "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800");

    // Announcement
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.text_color\s*\}\}/g, "#ffffff");
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.text_1\s*\}\}/g, "⚡ FREE SHIPPING on orders over $50");
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.text_2\s*\}\}/g, "🔥 Summer Sale: Up to 50% Off!");
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.text_3\s*\}\}/g, "📦 Easy 30-Day Returns");

    // Image Banner
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.banner_height\s*\}\}/g, "450");
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.overlay_opacity\s*\}\}/g, "0.4");
    htmlContent = htmlContent.replace(/ca-align-\{\{\s*section\.settings\.align\s*\}\}/g, "ca-align-center");
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.description\s*\}\}/g, "Explore our hand-picked styles designed for modern comfort.");
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.btn_text\s*\}\}/g, "Explore Now");

    // Product Grid
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.heading\s*\}\}/g, "Featured Collection");
    // Replace loops with mock html
    const mockProductGridHtml = `
      <div class="ca-pcard">
        <div class="ca-pcard-media">
          <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600" class="ca-pcard-img">
          <div class="ca-pcard-quickbuy-form"><button type="button" class="ca-quickbuy-btn">Quick Add</button></div>
        </div>
        <div class="ca-pcard-details">
          <h3 class="ca-pcard-title">Minimalist Canvas Pack</h3>
          <span class="ca-pcard-price">$89.00</span>
        </div>
      </div>
      <div class="ca-pcard">
        <div class="ca-pcard-media">
          <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600" class="ca-pcard-img">
          <div class="ca-pcard-quickbuy-form"><button type="button" class="ca-quickbuy-btn">Quick Add</button></div>
        </div>
        <div class="ca-pcard-details">
          <h3 class="ca-pcard-title">Classic Leather Trainer</h3>
          <span class="ca-pcard-price">$120.00</span>
        </div>
      </div>
      <div class="ca-pcard">
        <div class="ca-pcard-media">
          <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600" class="ca-pcard-img">
          <div class="ca-pcard-quickbuy-form"><button type="button" class="ca-quickbuy-btn">Quick Add</button></div>
        </div>
        <div class="ca-pcard-details">
          <h3 class="ca-pcard-title">Premium Wireless Headphone</h3>
          <span class="ca-pcard-price">$299.00</span>
        </div>
      </div>
      <div class="ca-pcard">
        <div class="ca-pcard-media">
          <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600" class="ca-pcard-img">
          <div class="ca-pcard-quickbuy-form"><button type="button" class="ca-quickbuy-btn">Quick Add</button></div>
        </div>
        <div class="ca-pcard-details">
          <h3 class="ca-pcard-title">Retro Polaroid Camera</h3>
          <span class="ca-pcard-price">$149.00</span>
        </div>
      </div>
    `;
    htmlContent = htmlContent.replace(/\{%-?\s*assign\s+collection[\s\S]*?\{%-?\s*endfor\s*-?%\}/g, mockProductGridHtml);

    // Collection Grid
    const mockCollectionGridHtml = `
      <div class="ca-col-box">
        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800">
        <div class="ca-col-overlay"><h3>Womens Collection</h3></div>
      </div>
      <div class="ca-col-box">
        <img src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800">
        <div class="ca-col-overlay"><h3>Mens Collection</h3></div>
      </div>
      <div class="ca-col-box">
        <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800">
        <div class="ca-col-overlay"><h3>Accessories</h3></div>
      </div>
    `;
    htmlContent = htmlContent.replace(/\{%-?\s*for\s+block\s+in\s+section\.blocks[\s\S]*?\{%-?\s*endfor\s*-?%\}/g, mockCollectionGridHtml);

    // Testimonial
    const mockTestimonialHtml = `
      <div class="ca-tcard">
        <div class="ca-tcard-stars">★★★★★</div>
        <p class="ca-tcard-quote">"The sections look absolutely fantastic. Setup was a breeze, took less than 10 seconds!"</p>
        <div class="ca-tcard-author"><strong>Sarah K.</strong><span>Verified Store Owner</span></div>
      </div>
      <div class="ca-tcard">
        <div class="ca-tcard-stars">★★★★★</div>
        <p class="ca-tcard-quote">"Increased our mobile conversion rate by 14% after switching our hero banner to this split design."</p>
        <div class="ca-tcard-author"><strong>David L.</strong><span>Digital Marketer</span></div>
      </div>
      <div class="ca-tcard">
        <div class="ca-tcard-stars">★★★★★</div>
        <p class="ca-tcard-quote">"Top tier support and beautiful templates. Definitely a must-have app for Shopify merchants."</p>
        <div class="ca-tcard-author"><strong>Elena R.</strong><span>Boutique Owner</span></div>
      </div>
    `;
    htmlContent = htmlContent.replace(/\{%-?\s*for\s+block\s+in\s+section\.blocks[\s\S]*?\{%-?\s*endfor\s*-?%\}/g, mockTestimonialHtml);

    // FAQ
    const mockFaqHtml = `
      <div class="ca-faq-item">
        <button class="ca-faq-question" type="button">Is a subscription required?<span class="ca-faq-icon">+</span></button>
        <div class="ca-faq-answer"><div class="ca-faq-answer-inner">No, our premium sections are a one-time purchase with lifetime free updates!</div></div>
      </div>
      <div class="ca-faq-item">
        <button class="ca-faq-question" type="button">Will it slow down my theme?<span class="ca-faq-icon">+</span></button>
        <div class="ca-faq-answer"><div class="ca-faq-answer-inner">Absolutely not. We write clean, lightweight vanilla CSS and JavaScript with zero external library dependencies.</div></div>
      </div>
      <div class="ca-faq-item">
        <button class="ca-faq-question" type="button">Can I customize the settings in Shopify?<span class="ca-faq-icon">+</span></button>
        <div class="ca-faq-answer"><div class="ca-faq-answer-inner">Yes! All layouts support full integration with the native Shopify theme customizer settings.</div></div>
      </div>
    `;
    htmlContent = htmlContent.replace(/\{%-?\s*for\s+block\s+in\s+section\.blocks[\s\S]*?\{%-?\s*endfor\s*-?%\}/g, mockFaqHtml);

    // Before After Images
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.image_before\s*\|\s*image_url[\s\S]*?\}\}/g, "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800");
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.image_after\s*\|\s*image_url[\s\S]*?\}\}/g, "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800");

    // Video Hero
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.video_url\s*\}\}/g, "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-glitter-makeup-40156-large.mp4");

    // Trust Badges
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.bg_color\s*\}\}/g, "#f8fafc");

    // Countdown Timer
    htmlContent = htmlContent.replace(/\{\{\s*section\.settings\.end_date\s*\}\}/g, new Date().getFullYear() + "-12-31");

    // Clean remaining tags/filters if any
    htmlContent = htmlContent.replace(/\{%[\s\S]*?%\}/g, "");
    htmlContent = htmlContent.replace(/\{\{[\s\S]*?\}\}/g, "");

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            color: #1a1a1a;
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
          }
          ${section.cssCode || ""}
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          ${section.jsCode || ""}
        </script>
      </body>
      </html>
    `;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Live Preview: ${section.name}`}
      large
    >
      <Modal.Section>
        <Box padding="200">
          <Text variant="bodyMd" tone="subdued">
            Below is a live interactive simulation of this section layout. You can interact with the elements (toggles, sliders, quick buy) as they will appear on your store.
          </Text>
        </Box>
        
        <Box
          style={{
            border: "1px solid #d2d5d8",
            borderRadius: "6px",
            overflow: "hidden",
            height: "450px",
            marginTop: "12px",
          }}
        >
          <iframe
            title={section.name}
            srcDoc={generatePreviewSrcDoc()}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            sandbox="allow-scripts"
          />
        </Box>
      </Modal.Section>
    </Modal>
  );
}
