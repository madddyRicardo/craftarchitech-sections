# Render Deployment Guide: CraftArchitech Sections App

This guide walks you through deploying your Shopify Embedded App to [Render.com](https://render.com) using Docker and a Persistent Disk for SQLite storage.

---

## 1. Prerequisites
1. A **Render.com** account.
2. A **GitHub** repository containing your app's source code.
3. Access to your **Shopify Partners Dashboard** (to retrieve credentials and update URLs).

---

## 2. Step-by-Step Render Setup

### Step A: Create a New Web Service
1. Log in to your Render Dashboard and click **New +** > **Web Service**.
2. Connect your GitHub repository containing the app's code.
3. Configure the following basic details:
   - **Name**: `craftarchitech-sections` (or any custom name)
   - **Language**: `Docker` (Render will automatically detect the root `Dockerfile` and package Node & dependencies cleanly).
   - **Region**: Select the region closest to your merchants (e.g., Oregon, USA, or Frankfurt, Germany).
   - **Instance Type**: Select **Free** (or a paid tier if you expect heavier traffic).

---

### Step B: Attach a Persistent Disk (CRITICAL)
Since the app uses SQLite (`dev.sqlite`), any data (installed sections, merchants, auth sessions) will be erased every time Render redeploys the code. To prevent this, attach a persistent volume:
1. In the Web Service configuration menu, scroll down to the **Disks** section.
2. Click **Add Disk**.
3. Set the following values:
   - **Name**: `sqlite-volume`
   - **Mount Path**: `/var/data`
   - **Size**: `1 GB` (Plenty of space for SQLite databases).

---

### Step C: Configure Environment Variables
Navigate to the **Environment** tab of your Render Web Service and add the following variables:

| Variable Name | Value / Description | Example Value |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | `production` |
| `PORT` | `3000` | `3000` |
| `DATABASE_URL` | `file:/var/data/dev.sqlite` *(Points to the persistent disk)* | `file:/var/data/dev.sqlite` |
| `SHOPIFY_API_KEY` | Your Shopify App's Client ID (from Partner Dashboard) | `4f8b3ede16a104...` |
| `SHOPIFY_API_SECRET` | Your Shopify App's Client Secret | `secret_goes_here...` |
| `SCOPES` | `write_products,write_metaobjects,write_metaobject_definitions,write_themes` | Same |
| `HOST` | Your live Render App URL | `https://craftarchitech-sections.onrender.com` |
| `SHOPIFY_APP_URL` | Your live Render App URL (same as `HOST`) | `https://craftarchitech-sections.onrender.com` |
| `SUPER_ADMIN_SHOP` | Your developer store URL | `craftarchitech-fcl9h4ur.myshopify.com` |
| `SUPER_ADMIN_PASSKEY` | Passkey to access `/app/super-admin` | `craftarchitech-admin-key` |

*Note: Render will automatically trigger a build and deployment when you save these environment variables.*

---

## 3. Shopify App Config Updates (Shopify Partner Dashboard)

Once Render finishes deploying and generates your live app URL (e.g., `https://craftarchitech-sections.onrender.com`), you must update the URLs in your Shopify App setup:

1. Log in to the **Shopify Partners Dashboard** > **Apps** > Select **craftarchitech sections**.
2. Click on **Configuration** (in the sidebar).
3. Update the following fields:
   - **App URL**: `https://craftarchitech-sections.onrender.com`
   - **Allowed redirection URL(s)**:
     - `https://craftarchitech-sections.onrender.com/api/auth`
     - `https://craftarchitech-sections.onrender.com/api/auth/callback`
4. Click **Save**.

Your app is now fully live and ready to be installed on live merchant stores!
