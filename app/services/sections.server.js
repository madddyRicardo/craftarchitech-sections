import prisma from "../db.server";

// Curated list of premium custom sections
export const PREDEFINED_SECTIONS = [
  {
    id: "ca-hero-premium",
    name: "Split Premium Hero Banner",
    handle: "craftarchitech-hero",
    category: "Hero Sections",
    description: "A gorgeous split-screen hero section with dual columns, background gradient, premium typography, and two animated call-to-action buttons.",
    previewUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60",
    isPopular: true,
    isNew: false,
    version: "1.0.0",
    liquidCode: `{%- comment -%}
  CraftArchitech - Split Premium Hero Banner
{%- endcomment -%}
{{ 'craftarchitech-hero.css' | asset_url | stylesheet_tag }}

<section class="ca-hero ca-hero-{{ section.id }}" style="background: {{ section.settings.bg_color }};">
  <div class="ca-hero-container">
    <div class="ca-hero-grid">
      <div class="ca-hero-content">
        {%- if section.settings.badge != blank -%}
          <span class="ca-hero-badge">{{ section.settings.badge }}</span>
        {%- endif -%}
        <h1 class="ca-hero-title">{{ section.settings.title }}</h1>
        <p class="ca-hero-subtitle">{{ section.settings.subtitle }}</p>
        <div class="ca-hero-buttons">
          {%- if section.settings.btn1_text != blank -%}
            <a href="{{ section.settings.btn1_link }}" class="ca-btn ca-btn-primary">{{ section.settings.btn1_text }}</a>
          {%- endif -%}
          {%- if section.settings.btn2_text != blank -%}
            <a href="{{ section.settings.btn2_link }}" class="ca-btn ca-btn-secondary">{{ section.settings.btn2_text }}</a>
          {%- endif -%}
        </div>
      </div>
      <div class="ca-hero-media">
        {%- if section.settings.image != blank -%}
          <img src="{{ section.settings.image | image_url: width: 1000 }}" alt="{{ section.settings.title }}" loading="lazy" class="ca-hero-img">
        {%- else -%}
          {{ 'lifestyle-1' | placeholder_svg_tag: 'ca-placeholder' }}
        {%- endif -%}
      </div>
    </div>
  </div>
</section>

{% schema %}
{
  "name": "CA Premium Hero",
  "settings": [
    {
      "type": "color_background",
      "id": "bg_color",
      "label": "Background Gradient",
      "default": "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)"
    },
    {
      "type": "text",
      "id": "badge",
      "label": "Badge Text",
      "default": "NEW ARRIVALS"
    },
    {
      "type": "text",
      "id": "title",
      "label": "Heading",
      "default": "Architect Your Digital Storefront"
    },
    {
      "type": "textarea",
      "id": "subtitle",
      "label": "Subheading",
      "default": "Craft premium customer experiences using our high-converting modern layouts built specifically for fast themes."
    },
    {
      "type": "text",
      "id": "btn1_text",
      "label": "Primary Button Text",
      "default": "Shop Collection"
    },
    {
      "type": "url",
      "id": "btn1_link",
      "label": "Primary Button Link"
    },
    {
      "type": "text",
      "id": "btn2_text",
      "label": "Secondary Button Text",
      "default": "Learn More"
    },
    {
      "type": "url",
      "id": "btn2_link",
      "label": "Secondary Button Link"
    },
    {
      "type": "image_picker",
      "id": "image",
      "label": "Hero Image"
    }
  ],
  "presets": [
    {
      "name": "CA Premium Hero"
    }
  ]
}
{% endschema %}`,
    cssCode: `.ca-hero {
  padding: 80px 20px;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}
.ca-hero-container {
  max-width: 1200px;
  margin: 0 auto;
}
.ca-hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}
.ca-hero-badge {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #818cf8;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 20px;
}
.ca-hero-title {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 20px 0;
  background: linear-gradient(to right, #ffffff, #c7d2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.ca-hero-subtitle {
  font-size: 18px;
  line-height: 1.6;
  color: #94a3b8;
  margin: 0 0 30px 0;
}
.ca-hero-buttons {
  display: flex;
  gap: 16px;
}
.ca-btn {
  display: inline-block;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}
.ca-btn-primary {
  background: #6366f1;
  color: #ffffff;
  border: 1px solid transparent;
}
.ca-btn-primary:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}
.ca-btn-secondary {
  background: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.ca-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}
.ca-hero-media {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}
.ca-hero-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  transition: transform 0.8s ease;
}
.ca-hero-img:hover {
  transform: scale(1.05);
}
.ca-placeholder {
  width: 100%;
  height: 400px;
  background: #1e293b;
  fill: #475569;
}
@media (max-width: 768px) {
  .ca-hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 30px;
  }
  .ca-hero-buttons {
    justify-content: center;
  }
  .ca-hero-title {
    font-size: 36px;
  }
}`,
    jsCode: `// CraftArchitech Split Hero Banner Script
console.log('CraftArchitech Hero banner loaded successfully');`,
  },
  {
    id: "ca-announcement-sliding",
    name: "Sliding Multilingual Announcement Bar",
    handle: "craftarchitech-announcement",
    category: "Announcement Bars",
    description: "An elegant, dynamic sliding announcement bar with infinite marquee loop and responsive closing controls.",
    previewUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60",
    isPopular: false,
    isNew: true,
    version: "1.0.0",
    liquidCode: `{{ 'craftarchitech-announcement.css' | asset_url | stylesheet_tag }}
<div class="ca-announcement" id="ca-announcement-{{ section.id }}" style="background: {{ section.settings.bg_color }}; color: {{ section.settings.text_color }};">
  <div class="ca-announcement-wrapper">
    <div class="ca-announcement-slider">
      <div class="ca-announcement-track">
        <span class="ca-announcement-text">{{ section.settings.text_1 }}</span>
        {%- if section.settings.text_2 != blank -%}
          <span class="ca-announcement-divider">|</span>
          <span class="ca-announcement-text">{{ section.settings.text_2 }}</span>
        {%- endif -%}
        {%- if section.settings.text_3 != blank -%}
          <span class="ca-announcement-divider">|</span>
          <span class="ca-announcement-text">{{ section.settings.text_3 }}</span>
        {%- endif -%}
      </div>
    </div>
  </div>
</div>
{% schema %}
{
  "name": "CA Sliding Announcement",
  "settings": [
    {
      "type": "color",
      "id": "bg_color",
      "label": "Background Color",
      "default": "#4f46e5"
    },
    {
      "type": "color",
      "id": "text_color",
      "label": "Text Color",
      "default": "#ffffff"
    },
    {
      "type": "text",
      "id": "text_1",
      "label": "Announcement 1",
      "default": "⚡ FREE SHIPPING on orders over $50"
    },
    {
      "type": "text",
      "id": "text_2",
      "label": "Announcement 2",
      "default": "🔥 Summer Sale: Up to 50% Off! Code: SUMMER50"
    },
    {
      "type": "text",
      "id": "text_3",
      "label": "Announcement 3",
      "default": "📦 Easy 30-Day Hassle-Free Returns"
    }
  ],
  "presets": [
    {
      "name": "CA Sliding Announcement"
    }
  ]
}
{% endschema %}`,
    cssCode: `.ca-announcement {
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  overflow: hidden;
  font-family: sans-serif;
}
.ca-announcement-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
.ca-announcement-slider {
  width: 100%;
  display: flex;
  justify-content: center;
}
.ca-announcement-track {
  display: flex;
  align-items: center;
  gap: 15px;
  animation: ca-marquee 15s linear infinite;
  white-space: nowrap;
}
.ca-announcement-divider {
  opacity: 0.5;
}
@keyframes ca-marquee {
  0% { transform: translateX(10%); }
  100% { transform: translateX(-10%); }
}`,
    jsCode: `// Announcement logic`,
  },
  {
    id: "ca-image-banner-parallax",
    name: "Modern Parallax Image Banner",
    handle: "craftarchitech-image-banner",
    category: "Image Banners",
    description: "High-impact parallax background banner with adjustable overlay opacity, custom alignment, and button actions.",
    previewUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=60",
    isPopular: true,
    isNew: false,
    version: "1.0.0",
    liquidCode: `{{ 'craftarchitech-image-banner.css' | asset_url | stylesheet_tag }}
<div class="ca-banner ca-banner-{{ section.id }}" style="background-image: url('{{ section.settings.image | image_url: width: 1600 }}'); min-height: {{ section.settings.banner_height }}px;">
  <div class="ca-banner-overlay" style="background: rgba(0,0,0, {{ section.settings.overlay_opacity }});"></div>
  <div class="ca-banner-content ca-align-{{ section.settings.align }}">
    <h2 class="ca-banner-title">{{ section.settings.title }}</h2>
    <p class="ca-banner-description">{{ section.settings.description }}</p>
    {%- if section.settings.btn_text != blank -%}
      <a href="{{ section.settings.btn_link }}" class="ca-banner-btn">{{ section.settings.btn_text }}</a>
    {%- endif -%}
  </div>
</div>
{% schema %}
{
  "name": "CA Parallax Banner",
  "settings": [
    {
      "type": "image_picker",
      "id": "image",
      "label": "Banner Image"
    },
    {
      "type": "range",
      "id": "banner_height",
      "label": "Banner Height (px)",
      "min": 300,
      "max": 800,
      "step": 50,
      "default": 500
    },
    {
      "type": "range",
      "id": "overlay_opacity",
      "label": "Overlay Opacity",
      "min": 0,
      "max": 0.9,
      "step": 0.1,
      "default": 0.4
    },
    {
      "type": "select",
      "id": "align",
      "label": "Text Alignment",
      "options": [
        { "value": "left", "label": "Left" },
        { "value": "center", "label": "Center" },
        { "value": "right", "label": "Right" }
      ],
      "default": "center"
    },
    {
      "type": "text",
      "id": "title",
      "label": "Banner Heading",
      "default": "Curated Collection"
    },
    {
      "type": "textarea",
      "id": "description",
      "label": "Banner Subtext",
      "default": "Explore our hand-picked styles designed for modern comfort."
    },
    {
      "type": "text",
      "id": "btn_text",
      "label": "Button Text",
      "default": "Explore Now"
    },
    {
      "type": "url",
      "id": "btn_link",
      "label": "Button Link"
    }
  ],
  "presets": [
    { "name": "CA Parallax Banner" }
  ]
}
{% endschema %}`,
    cssCode: `.ca-banner {
  position: relative;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  padding: 40px;
}
.ca-banner-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1;
}
.ca-banner-content {
  position: relative;
  z-index: 2;
  color: #fff;
  max-width: 600px;
  width: 100%;
}
.ca-align-left { margin-right: auto; text-align: left; }
.ca-align-center { margin: 0 auto; text-align: center; }
.ca-align-right { margin-left: auto; text-align: right; }
.ca-banner-title { font-size: 38px; font-weight: 700; margin: 0 0 15px 0; }
.ca-banner-description { font-size: 16px; margin: 0 0 25px 0; opacity: 0.9; }
.ca-banner-btn {
  display: inline-block;
  padding: 12px 30px;
  background: #fff;
  color: #000;
  text-decoration: none;
  font-weight: 600;
  border-radius: 4px;
  transition: opacity 0.3s;
}
.ca-banner-btn:hover { opacity: 0.9; }`,
    jsCode: ``,
  },
  {
    id: "ca-product-grid-quickbuy",
    name: "Product Grid with Quick Buy",
    handle: "craftarchitech-product-grid",
    category: "Product Grids",
    description: "Grid display of select products with integrated hover quick buy buttons and premium item cards.",
    previewUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=60",
    isPopular: true,
    isNew: false,
    version: "1.0.0",
    liquidCode: `{{ 'craftarchitech-product-grid.css' | asset_url | stylesheet_tag }}
<section class="ca-pgrid">
  <div class="ca-pgrid-header">
    <h2>{{ section.settings.heading }}</h2>
  </div>
  <div class="ca-pgrid-items">
    {%- assign collection = collections[section.settings.collection] -%}
    {%- if collection != blank and collection.products.size > 0 -%}
      {%- for product in collection.products limit: section.settings.limit -%}
        <div class="ca-pcard">
          <div class="ca-pcard-media">
            <img src="{{ product.featured_image | image_url: width: 600 }}" alt="{{ product.title }}" class="ca-pcard-img" loading="lazy">
            <form method="post" action="/cart/add" class="ca-pcard-quickbuy-form">
              <input type="hidden" name="id" value="{{ product.variants.first.id }}" />
              <button type="submit" class="ca-quickbuy-btn">Quick Add</button>
            </form>
          </div>
          <div class="ca-pcard-details">
            <h3 class="ca-pcard-title"><a href="{{ product.url }}">{{ product.title }}</a></h3>
            <span class="ca-pcard-price">{{ product.price | money }}</span>
          </div>
        </div>
      {%- endfor -%}
    {%- else -%}
      {%- for i in (1..4) -%}
        <div class="ca-pcard ca-pcard-placeholder">
          <div class="ca-pcard-media">
            {{ 'product-' | append: i | placeholder_svg_tag: 'ca-placeholder' }}
          </div>
          <div class="ca-pcard-details">
            <h3 class="ca-pcard-title">Example Product Title {{ i }}</h3>
            <span class="ca-pcard-price">$49.99</span>
          </div>
        </div>
      {%- endfor -%}
    {%- endif -%}
  </div>
</section>
{% schema %}
{
  "name": "CA Product Grid",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Featured Collection" },
    { "type": "collection", "id": "collection", "label": "Collection" },
    { "type": "range", "id": "limit", "label": "Product Limit", "min": 2, "max": 12, "step": 1, "default": 4 }
  ],
  "presets": [
    { "name": "CA Product Grid" }
  ]
}
{% endschema %}`,
    cssCode: `.ca-pgrid { padding: 50px 20px; max-width: 1200px; margin: 0 auto; font-family: sans-serif; }
.ca-pgrid-header { margin-bottom: 30px; text-align: center; }
.ca-pgrid-header h2 { font-size: 28px; margin: 0; }
.ca-pgrid-items { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.ca-pcard { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; position: relative; display: flex; flex-direction: column; }
.ca-pcard-media { position: relative; overflow: hidden; background: #f8fafc; aspect-ratio: 1; }
.ca-pcard-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.ca-pcard:hover .ca-pcard-img { transform: scale(1.03); }
.ca-pcard-quickbuy-form { position: absolute; bottom: -50px; left: 0; right: 0; padding: 10px; transition: bottom 0.3s; z-index: 5; }
.ca-pcard:hover .ca-pcard-quickbuy-form { bottom: 0; }
.ca-quickbuy-btn { width: 100%; padding: 10px; background: #000; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
.ca-quickbuy-btn:hover { opacity: 0.9; }
.ca-pcard-details { padding: 15px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }
.ca-pcard-title { font-size: 15px; margin: 0 0 8px 0; font-weight: 600; }
.ca-pcard-title a { color: #000; text-decoration: none; }
.ca-pcard-price { font-size: 14px; color: #475569; }
@media (max-width: 768px) {
  .ca-pgrid-items { grid-template-columns: repeat(2, 1fr); }
}`,
    jsCode: ``,
  },
  {
    id: "ca-collection-grid-masonry",
    name: "Masonry Collection Showcase",
    handle: "craftarchitech-collection-grid",
    category: "Collection Grids",
    description: "Display top collections in an eye-catching masonry layout with zoom hover options.",
    previewUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=60",
    isPopular: false,
    isNew: false,
    version: "1.0.0",
    liquidCode: `{{ 'craftarchitech-collection-grid.css' | asset_url | stylesheet_tag }}
<div class="ca-cgrid">
  <h2>{{ section.settings.heading }}</h2>
  <div class="ca-cgrid-masonry">
    {%- for block in section.blocks -%}
      {%- assign col = collections[block.settings.collection] -%}
      <div class="ca-col-box ca-col-{{ block.id }}">
        <a href="{{ col.url }}">
          {%- if col.featured_image != blank -%}
            <img src="{{ col.featured_image | image_url: width: 800 }}" alt="{{ col.title }}">
          {%- else -%}
            {{ 'collection-' | append: forloop.index | placeholder_svg_tag: 'ca-placeholder' }}
          {%- endif -%}
          <div class="ca-col-overlay">
            <h3>{{ col.title | default: "Featured Collection" }}</h3>
          </div>
        </a>
      </div>
    {%- endfor -%}
  </div>
</div>
{% schema %}
{
  "name": "CA Collection Grid",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Shop Categories" }
  ],
  "blocks": [
    {
      "type": "collection",
      "name": "Collection Block",
      "settings": [
        { "type": "collection", "id": "collection", "label": "Collection" }
      ]
    }
  ],
  "presets": [
    { "name": "CA Collection Grid" }
  ]
}
{% endschema %}`,
    cssCode: `.ca-cgrid { padding: 40px 20px; max-width: 1200px; margin: 0 auto; font-family: sans-serif; }
.ca-cgrid h2 { text-align: center; margin-bottom: 30px; }
.ca-cgrid-masonry { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.ca-col-box { position: relative; border-radius: 8px; overflow: hidden; height: 350px; }
.ca-col-box img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.ca-col-box:hover img { transform: scale(1.05); }
.ca-col-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 20px; color: #fff; }
.ca-col-overlay h3 { margin: 0; font-size: 20px; }`,
    jsCode: ``,
  },
  {
    id: "ca-testimonials-masonry",
    name: "Testimonial Wall Slider",
    handle: "craftarchitech-testimonials",
    category: "Testimonial Sections",
    description: "Display customer feedback with profile pictures, custom rating stars, and testimonial quote typography.",
    previewUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=60",
    isPopular: false,
    isNew: false,
    version: "1.0.0",
    liquidCode: `{{ 'craftarchitech-testimonials.css' | asset_url | stylesheet_tag }}
<section class="ca-testimonials">
  <h2>{{ section.settings.heading }}</h2>
  <div class="ca-testimonials-grid">
    {%- for block in section.blocks -%}
      <div class="ca-tcard">
        <div class="ca-tcard-stars">★★★★★</div>
        <p class="ca-tcard-quote">"{{ block.settings.quote }}"</p>
        <div class="ca-tcard-author">
          <strong>{{ block.settings.author }}</strong>
          <span>{{ block.settings.role }}</span>
        </div>
      </div>
    {%- endfor -%}
  </div>
</section>
{% schema %}
{
  "name": "CA Testimonials",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Customer Reviews" }
  ],
  "blocks": [
    {
      "type": "testimonial",
      "name": "Testimonial",
      "settings": [
        { "type": "textarea", "id": "quote", "label": "Review Quote", "default": "Amazing product! Changed my life." },
        { "type": "text", "id": "author", "label": "Author Name", "default": "Jane Doe" },
        { "type": "text", "id": "role", "label": "Author Tagline", "default": "Verified Purchaser" }
      ]
    }
  ],
  "presets": [
    { "name": "CA Testimonials" }
  ]
}
{% endschema %}`,
    cssCode: `.ca-testimonials { padding: 50px 20px; max-width: 1200px; margin: 0 auto; text-align: center; font-family: sans-serif; }
.ca-testimonials h2 { margin-bottom: 40px; }
.ca-testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.ca-tcard { padding: 30px; background: #f8fafc; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: left; }
.ca-tcard-stars { color: #f59e0b; font-size: 18px; margin-bottom: 15px; }
.ca-tcard-quote { font-size: 15px; color: #334155; font-style: italic; line-height: 1.6; margin: 0 0 20px 0; }
.ca-tcard-author strong { display: block; font-size: 14px; color: #0f172a; }
.ca-tcard-author span { font-size: 12px; color: #64748b; }`,
    jsCode: ``,
  },
  {
    id: "ca-faq-accordion",
    name: "Interactive Accordion FAQ",
    handle: "craftarchitech-faq",
    category: "FAQ Sections",
    description: "An animated, mobile-responsive vertical Q&A accordion section featuring smooth drawer open/close toggles.",
    previewUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=60",
    isPopular: false,
    isNew: false,
    version: "1.0.0",
    liquidCode: `{{ 'craftarchitech-faq.css' | asset_url | stylesheet_tag }}
<div class="ca-faq ca-faq-{{ section.id }}">
  <div class="ca-faq-container">
    <h2>{{ section.settings.heading }}</h2>
    <div class="ca-faq-list">
      {%- for block in section.blocks -%}
        <div class="ca-faq-item">
          <button class="ca-faq-question" type="button">
            {{ block.settings.question }}
            <span class="ca-faq-icon">+</span>
          </button>
          <div class="ca-faq-answer">
            <div class="ca-faq-answer-inner">
              {{ block.settings.answer }}
            </div>
          </div>
        </div>
      {%- endfor -%}
    </div>
  </div>
</div>
{{ 'craftarchitech-faq.js' | asset_url | script_tag }}
{% schema %}
{
  "name": "CA Accordion FAQ",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Frequently Asked Questions" }
  ],
  "blocks": [
    {
      "type": "faq_item",
      "name": "FAQ Item",
      "settings": [
        { "type": "text", "id": "question", "label": "Question", "default": "How long is shipping?" },
        { "type": "textarea", "id": "answer", "label": "Answer", "default": "Shipping takes 3-5 business days." }
      ]
    }
  ],
  "presets": [
    { "name": "CA Accordion FAQ" }
  ]
}
{% endschema %}`,
    cssCode: `.ca-faq { padding: 60px 20px; font-family: sans-serif; background: #fff; }
.ca-faq-container { max-width: 800px; margin: 0 auto; }
.ca-faq h2 { text-align: center; margin-bottom: 30px; }
.ca-faq-item { border-bottom: 1px solid #e2e8f0; }
.ca-faq-question {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ca-faq-icon { font-size: 20px; transition: transform 0.3s; }
.ca-faq-item.active .ca-faq-icon { transform: rotate(45deg); }
.ca-faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}
.ca-faq-answer-inner { padding: 0 0 20px 0; color: #475569; line-height: 1.6; }`,
    jsCode: `document.querySelectorAll('.ca-faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.parentElement;
    const answer = button.nextElementSibling;
    const isActive = item.classList.contains('active');
    
    // Reset other items
    document.querySelectorAll('.ca-faq-item').forEach(i => {
      i.classList.remove('active');
      i.querySelector('.ca-faq-answer').style.maxHeight = null;
    });

    if (!isActive) {
      item.classList.add('active');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});`,
  },
  {
    id: "ca-marquee-ticker",
    name: "Infinite Scrolling Marquee Banner",
    handle: "craftarchitech-marquee",
    category: "Marquee Sections",
    description: "Autoplay scrolling text or icons banner ideal for displaying logos, trust messages, or alerts.",
    previewUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60",
    isPopular: false,
    isNew: false,
    version: "1.0.0",
    liquidCode: `{{ 'craftarchitech-marquee.css' | asset_url | stylesheet_tag }}
<div class="ca-marquee-sec" style="background: {{ section.settings.bg_color }}; color: {{ section.settings.text_color }};">
  <div class="ca-marquee-content">
    {%- for i in (1..6) -%}
      <span>{{ section.settings.text }}</span>
      <span class="ca-marquee-bullet">•</span>
    {%- endfor -%}
  </div>
</div>
{% schema %}
{
  "name": "CA Scroll Marquee",
  "settings": [
    { "type": "text", "id": "text", "label": "Marquee Text", "default": "MODERN SECTIONS" },
    { "type": "color", "id": "bg_color", "label": "Background", "default": "#1e293b" },
    { "type": "color", "id": "text_color", "label": "Text", "default": "#fff" }
  ],
  "presets": [
    { "name": "CA Scroll Marquee" }
  ]
}
{% endschema %}`,
    cssCode: `.ca-marquee-sec { padding: 15px 0; overflow: hidden; display: flex; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; font-family: sans-serif; }
.ca-marquee-content { display: flex; animation: ca-marquee-scroll 20s linear infinite; white-space: nowrap; gap: 30px; }
.ca-marquee-bullet { color: #f59e0b; }
@keyframes ca-marquee-scroll {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}`,
    jsCode: ``,
  },
  {
    id: "ca-before-after-slider",
    name: "Interactive Before/After Image Slider",
    handle: "craftarchitech-before-after",
    category: "Before After Sections",
    description: "Compare transformations side-by-side with an interactive drag slider handles.",
    previewUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop&q=60",
    isPopular: true,
    isNew: true,
    version: "1.0.0",
    liquidCode: `{{ 'craftarchitech-before-after.css' | asset_url | stylesheet_tag }}
<section class="ca-ba ca-ba-{{ section.id }}">
  <h2>{{ section.settings.heading }}</h2>
  <div class="ca-ba-container">
    <div class="ca-ba-before ca-ba-img-box">
      {%- if section.settings.image_before != blank -%}
        <img src="{{ section.settings.image_before | image_url: width: 800 }}" alt="Before">
      {%- else -%}
        {{ 'lifestyle-1' | placeholder_svg_tag: 'ca-placeholder' }}
      {%- endif -%}
      <div class="ca-ba-label ca-ba-label-before">Before</div>
    </div>
    <div class="ca-ba-after ca-ba-img-box">
      {%- if section.settings.image_after != blank -%}
        <img src="{{ section.settings.image_after | image_url: width: 800 }}" alt="After">
      {%- else -%}
        {{ 'lifestyle-2' | placeholder_svg_tag: 'ca-placeholder' }}
      {%- endif -%}
      <div class="ca-ba-label ca-ba-label-after">After</div>
    </div>
    <input type="range" min="0" max="100" value="50" class="ca-ba-range-slider">
    <div class="ca-ba-line"></div>
    <div class="ca-ba-handle">↔</div>
  </div>
</section>
{{ 'craftarchitech-before-after.js' | asset_url | script_tag }}
{% schema %}
{
  "name": "CA Before After Slider",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "See The Difference" },
    { "type": "image_picker", "id": "image_before", "label": "Before Image" },
    { "type": "image_picker", "id": "image_after", "label": "After Image" }
  ],
  "presets": [
    { "name": "CA Before After Slider" }
  ]
}
{% endschema %}`,
    cssCode: `.ca-ba { padding: 50px 20px; font-family: sans-serif; text-align: center; }
.ca-ba h2 { margin-bottom: 30px; }
.ca-ba-container { position: relative; max-width: 700px; margin: 0 auto; aspect-ratio: 16/9; overflow: hidden; border-radius: 8px; }
.ca-ba-img-box { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.ca-ba-img-box img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ca-ba-after { width: 50%; z-index: 2; }
.ca-ba-range-slider {
  position: absolute;
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 100%;
  background: transparent;
  outline: none;
  margin: 0;
  z-index: 10;
  cursor: ew-resize;
}
.ca-ba-line { position: absolute; top: 0; bottom: 0; left: 50%; width: 2px; background: #fff; z-index: 5; pointer-events: none; }
.ca-ba-handle { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; border-radius: 50%; background: #fff; color: #000; border: 2px solid #000; display: flex; align-items: center; justify-content: center; z-index: 6; font-weight: bold; pointer-events: none; }
.ca-ba-label { position: absolute; bottom: 10px; color: #fff; background: rgba(0,0,0,0.6); padding: 5px 10px; font-size: 12px; border-radius: 4px; z-index: 8; }
.ca-ba-label-before { right: 10px; }
.ca-ba-label-after { left: 10px; }`,
    jsCode: `document.querySelectorAll('.ca-ba-range-slider').forEach(slider => {
  slider.addEventListener('input', (e) => {
    const val = e.target.value;
    const container = slider.closest('.ca-ba-container');
    const afterBox = container.querySelector('.ca-ba-after');
    const line = container.querySelector('.ca-ba-line');
    const handle = container.querySelector('.ca-ba-handle');
    
    afterBox.style.width = val + '%';
    line.style.left = val + '%';
    handle.style.left = val + '%';
  });
});`,
  },
  {
    id: "ca-video-hero",
    name: "Autoplay Background Video Hero",
    handle: "craftarchitech-video-hero",
    category: "Video Sections",
    description: "Responsive hero section supporting full screen background MP4/Youtube videos with dark overlay overlay settings.",
    previewUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=60",
    isPopular: false,
    isNew: false,
    version: "1.0.0",
    liquidCode: `{{ 'craftarchitech-video-hero.css' | asset_url | stylesheet_tag }}
<div class="ca-vhero ca-vhero-{{ section.id }}" style="height: {{ section.settings.height }}px;">
  <video autoplay muted loop playsinline class="ca-vhero-bg">
    <source src="{{ section.settings.video_url }}" type="video/mp4">
  </video>
  <div class="ca-vhero-overlay" style="background: rgba(0,0,0, {{ section.settings.overlay_opacity }});"></div>
  <div class="ca-vhero-content">
    <h2>{{ section.settings.title }}</h2>
    <p>{{ section.settings.subtitle }}</p>
  </div>
</div>
{% schema %}
{
  "name": "CA Video Hero",
  "settings": [
    { "type": "text", "id": "video_url", "label": "MP4 Video URL", "default": "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-glitter-makeup-40156-large.mp4" },
    { "type": "text", "id": "title", "label": "Heading", "default": "Bold Dynamic Visuals" },
    { "type": "textarea", "id": "subtitle", "label": "Subheading", "default": "Wander free and choose your style." },
    { "type": "range", "id": "height", "label": "Height (px)", "min": 300, "max": 800, "default": 550 },
    { "type": "range", "id": "overlay_opacity", "label": "Overlay", "min": 0, "max": 0.9, "default": 0.5 }
  ],
  "presets": [
    { "name": "CA Video Hero" }
  ]
}
{% endschema %}`,
    cssCode: `.ca-vhero { position: relative; width: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; font-family: sans-serif; }
.ca-vhero-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; }
.ca-vhero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; }
.ca-vhero-content { position: relative; z-index: 3; color: #fff; text-align: center; padding: 20px; }
.ca-vhero-content h2 { font-size: 42px; font-weight: 700; margin: 0 0 15px 0; }
.ca-vhero-content p { font-size: 18px; opacity: 0.9; margin: 0; }`,
    jsCode: ``,
  },
  {
    id: "ca-comparison-table",
    name: "Tier Comparison Table",
    handle: "craftarchitech-comparison",
    category: "Comparison Tables",
    description: "Responsive grid table layout highlighting competitive features, prices, and highlights.",
    previewUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
    isPopular: false,
    isNew: false,
    version: "1.0.0",
    liquidCode: `{{ 'craftarchitech-comparison.css' | asset_url | stylesheet_tag }}
<div class="ca-comp">
  <h2>{{ section.settings.heading }}</h2>
  <table class="ca-comp-table">
    <thead>
      <tr>
        <th>Features</th>
        <th>Our Brand</th>
        <th>Competitors</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>100% Organic Materials</td>
        <td class="check">✓</td>
        <td class="cross">✗</td>
      </tr>
      <tr>
        <td>Lifetime Warranty</td>
        <td class="check">✓</td>
        <td class="cross">✗</td>
      </tr>
      <tr>
        <td>Eco-Friendly Supply Chain</td>
        <td class="check">✓</td>
        <td class="cross">✓</td>
      </tr>
    </tbody>
  </table>
</div>
{% schema %}
{
  "name": "CA Brand Comparison",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Why Choose Us" }
  ],
  "presets": [
    { "name": "CA Brand Comparison" }
  ]
}
{% endschema %}`,
    cssCode: `.ca-comp { padding: 50px 20px; max-width: 800px; margin: 0 auto; font-family: sans-serif; text-align: center; }
.ca-comp h2 { margin-bottom: 30px; }
.ca-comp-table { width: 100%; border-collapse: collapse; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.ca-comp-table th, .ca-comp-table td { padding: 15px; border: 1px solid #e2e8f0; text-align: center; }
.ca-comp-table th { background: #f8fafc; font-weight: 700; }
.ca-comp-table td.check { color: #16a34a; font-weight: bold; font-size: 18px; }
.ca-comp-table td.cross { color: #dc2626; font-weight: bold; font-size: 18px; }`,
    jsCode: ``,
  },
  {
    id: "ca-trust-badges",
    name: "SVG Trust Badges Grid",
    handle: "craftarchitech-trust-badges",
    category: "Trust Badges",
    description: "Display security symbols, checkout trust icons, and shipping guarantees beautifully inline.",
    previewUrl: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=800&auto=format&fit=crop&q=60",
    isPopular: true,
    isNew: false,
    version: "1.0.0",
    liquidCode: `{{ 'craftarchitech-trust-badges.css' | asset_url | stylesheet_tag }}
<div class="ca-badges" style="background: {{ section.settings.bg_color }};">
  <div class="ca-badges-list">
    <div class="ca-badge-item">
      <span class="ca-badge-icon">🚚</span>
      <h4>Free Delivery</h4>
      <p>Orders over $100</p>
    </div>
    <div class="ca-badge-item">
      <span class="ca-badge-icon">🔒</span>
      <h4>Secure Checkout</h4>
      <p>SSL Encryption</p>
    </div>
    <div class="ca-badge-item">
      <span class="ca-badge-icon">🔄</span>
      <h4>Easy Returns</h4>
      <p>30 Days Return</p>
    </div>
  </div>
</div>
{% schema %}
{
  "name": "CA Trust Badges",
  "settings": [
    { "type": "color", "id": "bg_color", "label": "Background", "default": "#f8fafc" }
  ],
  "presets": [
    { "name": "CA Trust Badges" }
  ]
}
{% endschema %}`,
    cssCode: `.ca-badges { padding: 40px 20px; font-family: sans-serif; }
.ca-badges-list { display: flex; justify-content: space-around; max-width: 1000px; margin: 0 auto; gap: 20px; text-align: center; }
.ca-badge-item { flex: 1; }
.ca-badge-icon { font-size: 32px; display: block; margin-bottom: 10px; }
.ca-badge-item h4 { margin: 0 0 5px 0; font-size: 16px; color: #0f172a; }
.ca-badge-item p { margin: 0; font-size: 13px; color: #64748b; }`,
    jsCode: ``,
  },
  {
    id: "ca-countdown-timer",
    name: "Urgent Promotional Countdown Banner",
    handle: "craftarchitech-countdown",
    category: "Countdown Timers",
    description: "Urgency builder countdown clock banner with custom heading text, background triggers, and dynamic date inputs.",
    previewUrl: "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800&auto=format&fit=crop&q=60",
    isPopular: true,
    isNew: true,
    version: "1.0.0",
    liquidCode: `{{ 'craftarchitech-countdown.css' | asset_url | stylesheet_tag }}
<div class="ca-timer ca-timer-{{ section.id }}" style="background: {{ section.settings.bg_color }};">
  <div class="ca-timer-inner">
    <h2>{{ section.settings.heading }}</h2>
    <div class="ca-clock" data-date="{{ section.settings.end_date }}">
      <div class="ca-clock-segment">
        <span class="days">00</span>
        <label>Days</label>
      </div>
      <div class="ca-clock-segment">
        <span class="hours">00</span>
        <label>Hours</label>
      </div>
      <div class="ca-clock-segment">
        <span class="minutes">00</span>
        <label>Mins</label>
      </div>
      <div class="ca-clock-segment">
        <span class="seconds">00</span>
        <label>Secs</label>
      </div>
    </div>
  </div>
</div>
{{ 'craftarchitech-countdown.js' | asset_url | script_tag }}
{% schema %}
{
  "name": "CA Urgency Timer",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Flash Sale Ends In:" },
    { "type": "text", "id": "end_date", "label": "End Date (YYYY-MM-DD)", "default": "2026-12-31" },
    { "type": "color", "id": "bg_color", "label": "Background Color", "default": "#000" }
  ],
  "presets": [
    { "name": "CA Urgency Timer" }
  ]
}
{% endschema %}`,
    cssCode: `.ca-timer { padding: 40px 20px; color: #fff; font-family: sans-serif; text-align: center; }
.ca-timer-inner { max-width: 600px; margin: 0 auto; }
.ca-timer h2 { margin: 0 0 20px 0; font-size: 24px; font-weight: 700; }
.ca-clock { display: flex; justify-content: center; gap: 15px; }
.ca-clock-segment { display: flex; flex-direction: column; align-items: center; min-width: 70px; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 4px; }
.ca-clock-segment span { font-size: 28px; font-weight: bold; }
.ca-clock-segment label { font-size: 11px; margin-top: 5px; opacity: 0.8; text-transform: uppercase; }`,
    jsCode: `document.querySelectorAll('.ca-clock').forEach(clock => {
  const dateStr = clock.getAttribute('data-date');
  const targetDate = new Date(dateStr + 'T00:00:00').getTime();

  function updateClock() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      clock.innerHTML = '<h3>Promotion Expired</h3>';
      clearInterval(timerInterval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    clock.querySelector('.days').innerText = String(days).padStart(2, '0');
    clock.querySelector('.hours').innerText = String(hours).padStart(2, '0');
    clock.querySelector('.minutes').innerText = String(minutes).padStart(2, '0');
    clock.querySelector('.seconds').innerText = String(seconds).padStart(2, '0');
  }

  const timerInterval = setInterval(updateClock, 1000);
  updateClock();
});`,
  },
  {
    id: "ca-premium-testimonials",
    name: "Premium Testimonial Carousel",
    handle: "craftarchitech-premium-testimonials",
    category: "Testimonial Sections",
    description: "An ultra-premium responsive testimonial grid card showcase featuring star rating sliders, elegant avatar rings, and dark glassmorphic layouts.",
    previewUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60",
    isPopular: true,
    isNew: true,
    version: "1.0.0",
    price: 10.00,
    liquidCode: `{{ 'craftarchitech-premium-testimonials.css' | asset_url | stylesheet_tag }}
<div class="ca-testimonials-carousel ca-tc-{{ section.id }}" style="background: {{ section.settings.bg_color }};">
  <div class="ca-tc-container">
    <div class="ca-tc-header">
      <h2>{{ section.settings.title }}</h2>
      <p>{{ section.settings.subtitle }}</p>
    </div>
    <div class="ca-tc-grid">
      {%- for block in section.blocks -%}
        <div class="ca-tc-card" style="background: {{ section.settings.card_bg_color }}; color: {{ section.settings.card_text_color }};">
          <div class="ca-tc-rating">
            {%- assign rating_val = block.settings.rating | plus: 0 -%}
            {%- for i in (1..5) -%}
              <span class="ca-star {% if i <= rating_val %}filled{% endif %}">★</span>
            {%- endfor -%}
          </div>
          <p class="ca-tc-text">"{{ block.settings.text }}"</p>
          <div class="ca-tc-author">
            {%- if block.settings.image != blank -%}
              <img src="{{ block.settings.image | image_url: width: 100 }}" alt="{{ block.settings.name }}" class="ca-tc-avatar">
            {%- else -%}
              <div class="ca-tc-avatar-placeholder">{{ block.settings.name | slice: 0, 1 }}</div>
            {%- endif -%}
            <div class="ca-tc-info">
              <span class="ca-tc-name">{{ block.settings.name }}</span>
              <span class="ca-tc-role">{{ block.settings.role }}</span>
            </div>
          </div>
        </div>
      {%- endfor -%}
    </div>
  </div>
</div>
{% schema %}
{
  "name": "CA Premium Testimonials",
  "settings": [
    {
      "type": "color",
      "id": "bg_color",
      "label": "Section Background Color",
      "default": "#f8fafc"
    },
    {
      "type": "color",
      "id": "card_bg_color",
      "label": "Card Background Color",
      "default": "#ffffff"
    },
    {
      "type": "color",
      "id": "card_text_color",
      "label": "Card Text Color",
      "default": "#1e293b"
    },
    {
      "type": "text",
      "id": "title",
      "label": "Heading",
      "default": "Loved by Thousands"
    },
    {
      "type": "text",
      "id": "subtitle",
      "label": "Subheading",
      "default": "See what our customers have to say about their experiences."
    }
  ],
  "blocks": [
    {
      "type": "testimonial",
      "name": "Testimonial",
      "settings": [
        {
          "type": "range",
          "id": "rating",
          "label": "Rating (Stars)",
          "min": 1,
          "max": 5,
          "default": 5
        },
        {
          "type": "textarea",
          "id": "text",
          "label": "Testimonial Text",
          "default": "Absolutely incredible service and top-notch quality! Exceeded all of my expectations."
        },
        {
          "type": "text",
          "id": "name",
          "label": "Customer Name",
          "default": "Sarah Jenkins"
        },
        {
          "type": "text",
          "id": "role",
          "label": "Customer Subtitle",
          "default": "Verified Buyer"
        },
        {
          "type": "image_picker",
          "id": "image",
          "label": "Avatar Image"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "CA Premium Testimonials",
      "blocks": [
        {
          "type": "testimonial",
          "settings": {
            "name": "Sarah Jenkins",
            "text": "Absolutely incredible service and top-notch quality! Exceeded all of my expectations.",
            "rating": 5
          }
        },
        {
          "type": "testimonial",
          "settings": {
            "name": "David Miller",
            "text": "Super fast delivery and the support is exceptionally friendly. Recommend to everyone!",
            "rating": 5
          }
        }
      ]
    }
  ]
}
{% endschema %}`,
    cssCode: `.ca-testimonials-carousel {
  padding: 80px 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.ca-tc-container {
  max-width: 1200px;
  margin: 0 auto;
}
.ca-tc-header {
  text-align: center;
  margin-bottom: 50px;
}
.ca-tc-header h2 {
  font-size: 36px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 10px 0;
}
.ca-tc-header p {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}
.ca-tc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}
.ca-tc-card {
  padding: 35px;
  border-radius: 16px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;
}
.ca-tc-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.12);
}
.ca-tc-rating {
  margin-bottom: 20px;
}
.ca-star {
  font-size: 20px;
  color: #cbd5e1;
  margin-right: 2px;
}
.ca-star.filled {
  color: #fbbf24;
}
.ca-tc-text {
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 25px 0;
  font-style: italic;
}
.ca-tc-author {
  display: flex;
  align-items: center;
  gap: 15px;
}
.ca-tc-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #818cf8;
}
.ca-tc-avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #818cf8;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}
.ca-tc-info {
  display: flex;
  flex-direction: column;
}
.ca-tc-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}
.ca-tc-role {
  font-size: 13px;
  color: #64748b;
}
@media (max-width: 768px) {
  .ca-tc-header h2 {
    font-size: 28px;
  }
  .ca-testimonials-carousel {
    padding: 50px 15px;
  }
}`,
    jsCode: `// Premium testimonial javascript`,
  }
];

/**
 * Seed predefined sections and versions into the database
 */
export async function seedSections() {
  console.log("Seeding predefined sections into DB...");
  for (const s of PREDEFINED_SECTIONS) {
    // Upsert section metadata
    await prisma.section.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        handle: s.handle,
        category: s.category,
        description: s.description,
        previewUrl: s.previewUrl,
        isPopular: s.isPopular,
        isNew: s.isNew,
        price: s.price || 0.00,
      },
      create: {
        id: s.id,
        name: s.name,
        handle: s.handle,
        category: s.category,
        description: s.description,
        previewUrl: s.previewUrl,
        isPopular: s.isPopular,
        isNew: s.isNew,
        price: s.price || 0.00,
      },
    });

    // Check if version exists, else write the code
    const existingVersion = await prisma.version.findFirst({
      where: {
        sectionId: s.id,
        versionNumber: s.version,
      },
    });

    if (!existingVersion) {
      await prisma.version.create({
        data: {
          sectionId: s.id,
          versionNumber: s.version,
          liquidCode: s.liquidCode,
          cssCode: s.cssCode,
          jsCode: s.jsCode,
          changelog: "Initial Release",
        },
      });
    }
  }
  console.log("Sections seeding complete!");
}

/**
 * Get all sections with their latest version details
 */
export async function getSectionsList() {
  const sections = await prisma.section.findMany({
    include: {
      versions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  return sections.map((s) => ({
    ...s,
    latestVersion: s.versions[0] ? s.versions[0].versionNumber : "1.0.0",
    liquidCode: s.versions[0]?.liquidCode || "",
    cssCode: s.versions[0]?.cssCode || "",
    jsCode: s.versions[0]?.jsCode || "",
  }));
}
