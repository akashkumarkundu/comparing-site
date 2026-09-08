# Compare Anything
> **Stop switching between tabs. Compare them.**

Compare Anything is an AI-powered Chrome extension that allows users to add 2–4 webpages from anywhere on the web and receive one clean, structured, evidence-based AI comparison.

---

## 🎯 What It Does

When researching products, plans, jobs, courses, or hotels, users typically switch endlessly between tabs:
```
Tab 1 → Tab 2 → Tab 3 → Recheck Tab 1 price → Check Tab 3 spec → Mental comparison
```

**Compare Anything streamlines this into 3 simple steps:**
1. **Open page** → Click **[+ Add to Comparison]**
2. **Open another page** → Click **[+ Add to Comparison]**
3. **Compare** → Immediately receive a structured decision table with quick verdict, winner highlights, and personalized recommendations.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│  Chrome Extension (Manifest V3)                       │
│  - TypeScript + React + Vite                           │
│  - PageExtractor (cleans clutter, <3,500 chars limit)  │
│  - chrome.storage.local workspace                      │
└──────────────────────────┬─────────────────────────────┘
                           │ POST /api/v1/compare
                           ▼
┌────────────────────────────────────────────────────────┐
│  Backend API (ASP.NET Core / Laravel)                  │
│  - Keeps Groq / OpenRouter API keys secure             │
│  - Rate limiting (10 comp/install/day + IP)            │
│  - Strict JSON schema enforcement                      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  AI Engine (Groq: gpt-oss-20b / OpenRouter)            │
│  - Zero hallucinations ("Not stated" rule)             │
│  - Structured decision & table generation              │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation & Local Development

### 1. Extension Setup
```bash
# Navigate to the extension folder
cd extension

# Install dependencies
npm install

# Build the Chrome extension bundle
npm run build
```

### 2. Loading into Google Chrome
1. Open Google Chrome and go to `chrome://extensions/`.
2. Toggle **Developer mode** (top right) to **ON**.
3. Click **Load unpacked** (top left).
4. Select the directory:
   ```
   comparing-site/extension/dist
   ```
5. Pin **Compare Anything** to your Chrome toolbar.

### 3. Run Automated Tests
```bash
cd extension
node scripts/verify-day-1.js
```

---

## ⚙️ Environment Variables
Backend API keys are kept server-side and never exposed inside the Chrome extension bundle:
```env
# Backend .env / appsettings.json
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
AI_PROVIDER=Groq
AI_MODEL=openai/gpt-oss-20b
RATE_LIMIT_DAILY=10
```

---

## 🔒 Privacy & Security Approach
- **Minimal Permissions**: Requests only `activeTab`, `scripting`, and `storage`. Does **not** request `<all_urls>`, history, bookmarks, or webRequest.
- **On-Demand Access**: Pages are only accessed when the user explicitly clicks `[+ Add to Comparison]`.
- **Ephemeral Storage**: Raw page content is held only in temporary local storage (`chrome.storage.local`) and completely wiped when the user clicks `Clear Comparison`.
- **No Permanent Server Storage**: Comparison data is not stored or logged permanently on servers.
- **Zero Hallucination Guarantee**: If an attribute is missing from the page, the AI returns `"Not stated"` rather than inventing facts.

---

## 👥 Contributors
- Akash Kumar Kundu ([@akashkumarkundu](https://github.com/akashkumarkundu))

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
