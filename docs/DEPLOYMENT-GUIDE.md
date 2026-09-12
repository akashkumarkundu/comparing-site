# Compare Anything — Production Deployment & Release Guide

This guide outlines the exact, battle-tested steps to deploy the Compare Anything backend, push to GitHub, and release the Chrome Extension to the Google Chrome Web Store.

---

## Step 1: Push Code to GitHub

Your remote repository is configured at: `https://github.com/akashkumarkundu/comparing-site.git`.

1. Check your status and stage the verified changes:
   ```bash
   git status
   git add .
   ```
2. Commit with a clean, descriptive message:
   ```bash
   git commit -m "feat: anti-hallucination sanitization, production api config, and store readiness"
   ```
3. Push to GitHub:
   ```bash
   git push origin main
   ```

> [!NOTE]
> All secret environment files (`.env`, `extension/.env`) are strictly protected by `.gitignore` and will never be pushed.

---

## Step 2: Deploy Backend to Live Server (HTTPS Required)

Chrome extensions in production require an active backend communicating over **HTTPS** (PDF Section 30).

### Recommended Hosting Options:
1. **Laravel Cloud** (https://cloud.laravel.com/) — Fastest native Laravel deployment with automatic HTTPS & domain SSL.
2. **Laravel Forge / VPS (DigitalOcean / Linode / Hetzner)** — Full server control via Nginx/Caddy with Let's Encrypt SSL.
3. **Railway / Render / Fly.io** — Containerized or Git-push based PaaS.

### Production Setup on Server:
1. Clone or pull your repo:
   ```bash
   git clone https://github.com/akashkumarkundu/comparing-site.git
   cd comparing-site
   composer install --no-dev --optimize-autoloader
   ```
2. Configure `.env` on your live server:
   ```env
   APP_NAME="Compare Anything"
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://your-production-domain.com

   AI_PROVIDER=Groq
   GROQ_API_KEY=gsk_your_live_groq_key_here
   AI_MODEL=openai/gpt-oss-20b

   RATE_LIMIT_PER_DAY=10
   RATE_LIMIT_PER_MINUTE=30
   CORS_ALLOWED_ORIGINS=*
   ```
3. Run key generation, migrations, and cache optimization:
   ```bash
   php artisan key:generate --force
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
4. Verify deployment readiness in 1 click:
   ```bash
   php scripts/verify-production-deploy.php
   ```

---

## Step 3: Configure Extension for Production & Package ZIP

1. In `extension/`, create `.env` or set `VITE_API_BASE_URL`:
   ```env
   VITE_API_BASE_URL=https://your-production-domain.com
   ```
2. Build the extension:
   ```bash
   cd extension
   npm run build
   ```
3. Run the automated packager from project root:
   ```bash
   php scripts/package-extension.php
   ```
   This generates `extension/compare-anything-extension.zip` verified against Chrome Web Store rules:
   * Root-level `manifest.json`
   * Minimal permissions: `activeTab`, `scripting`, `storage`
   * Zero leaked API keys

---

## Step 4: Chrome Web Store Submission

1. Go to **[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)**.
2. Sign in with your Google account (ensure 2-Step Verification is active) and pay the one-time $5 fee if not done previously.
3. Click **Add new item** and upload:
   ```
   extension/compare-anything-extension.zip
   ```
4. Fill in the store metadata directly from [`docs/STORE-SUBMISSION.md`](file:///c:/Users/LENOVO/Herd/comparing-site/docs/STORE-SUBMISSION.md):
   * **Name:** `Compare Anything – AI Web Comparison`
   * **Summary (103/132 chars):** `Add 2–4 web pages and get one clear AI comparison table based only on the information on those pages.`
   * **Description:** Copy from Section 2 in `docs/STORE-SUBMISSION.md`
   * **Single-Purpose:** `Compare Anything allows users to select webpages and generate an AI-assisted side-by-side comparison of the information contained on those selected pages.`
   * **Privacy Policy URL:** `https://your-production-domain.com/privacy`
   * **Support URL:** `https://your-production-domain.com/support`
5. Upload Graphic Assets from `extension/store-assets/`:
   * **Store Icon:** `icon128.png` (128x128)
   * **Small Promo Tile:** `promo-440x280.png` (440x280)
   * **Screenshots 1 to 5:** `screenshot-1.png` through `screenshot-5.png` (1280x800)
6. Click **Submit for Review**.
