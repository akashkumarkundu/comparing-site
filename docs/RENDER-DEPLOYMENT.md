# Render.com Deployment Guide (Free 24/7 Hosting)

This guide walks you through deploying the **Compare Anything** Laravel API on **Render.com** (100% Free, Permanent 24/7 HTTPS).

---

## Prerequisites
1. A free account on [Render.com](https://render.com/) (Sign in with your GitHub account: `akashkumarkundu`).
2. Your repository pushed to GitHub: `https://github.com/akashkumarkundu/comparing-site`.

---

## Method 1: 1-Click Blueprints (Recommended & Fastest)

1. Open [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** (top right) ➔ Select **Blueprint**.
3. Connect your GitHub repository: `akashkumarkundu/comparing-site`.
4. Render will automatically detect `render.yaml` and configure:
   * **Runtime:** Docker (using our optimized `Dockerfile`)
   * **Plan:** Free
   * **Health Check Path:** `/up`
5. It will prompt for `GROQ_API_KEY`:
   * Enter your live Groq API key: `gsk_...`
6. Click **Apply**.
7. Wait 2–3 minutes while Render builds the Docker container.
8. Once finished, Render will display your live URL:
   ```
   https://compare-anything-api.onrender.com
   ```

---

## Method 2: Manual Web Service Setup

If you prefer setting it up manually:

1. In Render Dashboard, click **New +** ➔ **Web Service**.
2. Connect `akashkumarkundu/comparing-site`.
3. Fill in the fields:
   * **Name:** `compare-anything-api`
   * **Region:** Oregon (US West) or Frankfurt (EU)
   * **Branch:** `main`
   * **Runtime:** **Docker**
   * **Instance Type:** **Free**
4. Under **Environment Variables**, add:
   * `APP_NAME` = `Compare Anything`
   * `APP_ENV` = `production`
   * `APP_DEBUG` = `false`
   * `APP_KEY` = `base64:309rL5q2e0N6O9d+vBqU0tXy9Jz1K2m3N4o5P6q7R8s=` *(or generate via `php artisan key:generate --show`)*
   * `DB_CONNECTION` = `sqlite`
   * `AI_PROVIDER` = `Groq`
   * `GROQ_API_KEY` = `your_actual_groq_api_key`
   * `AI_MODEL` = `openai/gpt-oss-20b`
   * `RATE_LIMIT_PER_DAY` = `10`
   * `RATE_LIMIT_PER_MINUTE` = `30`
   * `CORS_ALLOWED_ORIGINS` = `*`
5. Under **Health Check Path**, enter:
   `/up`
6. Click **Deploy Web Service**.

---

## Once Deployed on Render:

1. Test your live URL in a browser:
   `https://compare-anything-api.onrender.com/up` ➔ Should display "Application up".

2. Update extension to connect to your live Render URL:
   * In `extension/src/storage/StorageService.ts`, set:
     ```typescript
     export const DEFAULT_API_BASE_URL = 'https://compare-anything-api.onrender.com';
     ```
   * Rebuild and package:
     ```bash
     cd extension && npm run build
     php scripts/package-extension.php
     ```
3. Push to GitHub!
   Now the extension connects to your live Render server 24/7 with zero dependence on your local laptop!
