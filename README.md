# Compare Anything
> **Stop switching between tabs. Compare them.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-success.svg)](extension/public/manifest.json)
[![PHP 8.4](https://img.shields.io/badge/Backend-PHP_8.4_|_Laravel_13-red.svg)](composer.json)
[![Zero Hallucinations](https://img.shields.io/badge/Anti--Hallucination-Verified_Truth_Sheet-emerald.svg)](docs/TRUTH-SHEET.md)

**Compare Anything** is an AI-powered Google Chrome extension that allows users to queue **2 to 4 webpages** from anywhere across the web and receive an instant, evidence-based, side-by-side comparison table. 

Built in accordance with strict **Chrome Web Store Single-Purpose & Privacy Policies**: no tracking, no account required, no background scanning, and strictly zero hallucinations.

---

## 🎯 What It Solves

When researching products, SaaS subscriptions, courses, or job offers, users spend minutes jumping frantically between tabs:
```
Tab 1 (Read) → Tab 2 (Read) → Tab 3 (Read) → Re-check Tab 1 Price → Check Tab 3 Spec → Mental Fatigue
```

**Compare Anything simplifies decision-making into 3 simple steps:**
```
1. Open Page A  →  Click [+ ADD TO COMPARISON]
2. Open Page B  →  Click [+ ADD TO COMPARISON]
3. Click [COMPARE]  →  Full-tab side-by-side decision table with quick verdict & winners
```

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│  Chrome Extension (Manifest V3)                        │
│  - TypeScript + React + Vite                           │
│  - Minimal permissions: activeTab, scripting, storage  │
│  - PageExtractor (cleans noise, max 3,500 chars limit) │
│  - chrome.storage.local comparison workspace           │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS POST /api/v1/compare
                           ▼
┌────────────────────────────────────────────────────────┐
│  Laravel 13 Web API (PHP 8.4)                          │
│  - Keeps Groq / OpenRouter API keys server-side        │
│  - Rate Limiter (10 comparisons / installation / day)  │
│  - Prompt Injection Defense & Data Sanitization        │
│  - Strict JSON Schema & DTO Enforcement                │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  AI Engine (Groq: gpt-oss-20b / OpenRouter)            │
│  - Strict Ground-Truth Extraction                      │
│  - Anti-Hallucination Policy: Missing = "Not stated"   │
│  - Dynamic Criteria Discovery (5–10 attributes)        │
│  - Quick Verdict, Best-For, and Key Differences        │
└────────────────────────────────────────────────────────┘
```

---

## 🛡️ Anti-Hallucination Guarantee (Section 34)

Accuracy is prioritized above fancy design. The AI engine is strictly barred from using parametric memory to invent missing values.
- If a webpage specifies price, RAM, and processor, but omits weight:
  - **Correct Output:** `Weight: "Not stated"`
  - **Prohibited:** AI guessing `"1.7 kg"` or filling averages.
- When evidence is inadequate to pick a winner, `bestOverall.itemId` remains `null`.
- See the audited benchmark results in [`docs/TRUTH-SHEET.md`](docs/TRUTH-SHEET.md).

---

## 🚀 Quick Start & Installation

### 1. Backend Setup (Laravel 13 API)
```bash
# Clone the repository
git clone https://github.com/akashkumarkundu/comparing-site.git
cd comparing-site

# Install PHP dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Set your Groq API key in .env
# GROQ_API_KEY=your_groq_api_key_here
# AI_PROVIDER=Groq
# AI_MODEL=openai/gpt-oss-20b

# Run migrations & start server
php artisan migrate
php artisan serve --port=8000
```

### 2. Chrome Extension Setup
```bash
# Navigate to extension directory
cd extension

# Install dependencies
npm install

# Build the production bundle
npm run build
```

### 3. Load into Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the top-right corner to **ON**.
3. Click **Load unpacked** in the top-left corner.
4. Select the directory:
   ```
   comparing-site/extension/dist
   ```
5. Pin **Compare Anything** to your Chrome toolbar.

Or download the pre-packaged archive directly from `http://127.0.0.1:8000/download-extension`!

---

## 🧪 Comprehensive Verification Suite

Run automated verification checks matching each development milestone:

| Milestone | Command | What it Tests |
| :--- | :--- | :--- |
| **Day 1: Foundation** | `cd extension && node scripts/verify-day-1.js` | 50/50 tests: extraction, storage, 2–4 limits |
| **Day 2: AI Backend** | `vendor/bin/pest tests/Feature/Api/CompareEndpointTest.php` | API endpoint, rate limiting, JSON schema |
| **Day 3: Product** | `cd extension && node scripts/verify-day-3.js` | 14/14 tests: results UI, verdict, CSV export |
| **Day 4: Quality** | `php scripts/verify-day-4-quality.php` | 23/23 tests: 6 categories truth sheet audit |
| **Day 5: Release** | `php scripts/verify-day-5-release.php` | Store assets, ZIP packaging, permissions, docs |

Run all feature tests at once:
```bash
php artisan test --compact
```

---

## 🎨 Chrome Web Store Submission Assets

All assets compliant with Google's Developer Dashboard guidelines are ready in [`extension/store-assets/`](extension/store-assets/):
- `icon128.png` (128x128 PNG)
- `screenshot-1.png` (1280x800) — Step 1: 1-Click Page Snapshot
- `screenshot-2.png` (1280x800) — Step 2: 2–4 Pages Queue & Custom Goal
- `screenshot-3.png` (1280x800) — Step 3: Zero-Hallucination Side-by-Side Table
- `screenshot-4.png` (1280x800) — Step 4: Quick AI Verdict & Best-For Cards
- `screenshot-5.png` (1280x800) — Step 5: 1-Click Markdown Copy & CSV Export
- `promo-440x280.png` (440x280) — Small Promo Tile

Complete copy-paste metadata and permissions justifications are provided in [`docs/STORE-SUBMISSION.md`](docs/STORE-SUBMISSION.md).

---

## 🔒 Privacy & Permissions

Our `manifest.json` requests **only** three minimal permissions:
- `activeTab`: Grants temporary read access to the current webpage only when you click the extension popup.
- `scripting`: Executes the text and table extractor script on the active tab upon user click.
- `storage`: Saves your queued 2 to 4 pages and preferences locally in `chrome.storage.local`.

We explicitly **do not** request `<all_urls>`, browsing history, bookmarks, or background monitoring. Full details in [`docs/PRIVACY.md`](docs/PRIVACY.md).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.

Developed with ❤️ by **Akash Kumar Kundu** ([@akashkumarkundu](https://github.com/akashkumarkundu)).
