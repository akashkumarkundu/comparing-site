# Implementation Plan: Compare Anything

This document breaks down the full development of the **Compare Anything** AI Chrome Extension into testable, modular tasks across the 5-day roadmap, with detailed focus on **Day 1: Chrome Extension Foundation**.

---

## Roadmap Breakdown

### Day 1: Chrome Extension Foundation
- [x] Task 1.1: Extension project scaffolding (Vite + React + TypeScript + CSS)
- [x] Task 1.2: Manifest V3 configuration with minimal permissions (`activeTab`, `scripting`, `storage`)
- [x] Task 1.3: Data models & TypeScript interfaces (`PageSnapshot`, `StorageState`)
- [x] Task 1.4: `PageExtractor` engine (intelligent extraction of meta, JSON-LD, tables, specs, visible text; stripping clutter; truncation to ~3,500 chars)
- [x] Task 1.5: `StorageService` (`chrome.storage.local` abstraction for pages, goal, installId)
- [x] Task 1.6: Modern Popup UI:
  - Current Tab title & domain detector
  - `[+ ADD TO COMPARISON]` button with duplicate check
  - Selected-page cards with `[Remove]` button
  - Page counter (`0 / 4 pages added`, enforces 2–4 page limit)
  - `What matters to you? — Optional` input field
  - `[Clear Comparison]` button
  - `[COMPARE {n} PAGES]` action button
- [x] Task 1.7: Extension icons (16px, 48px, 128px)
- [x] Task 1.8: Verification test: Built extension & verified all 50/50 automated tests across 4 distinct sites.

---

### Day 2: AI Backend
- [x] Task 2.1: Web API project structure (`POST /api/v1/compare`)
- [x] Task 2.2: `IAIProvider` abstraction & `GroqProvider` (`openai/gpt-oss-20b` + `OpenRouterProvider` fallback)
- [x] Task 2.3: Anti-hallucination System Prompt & Strict JSON Schema
- [x] Task 2.4: Rate limiting (10 comparisons/install/day + IP limit)
- [x] Task 2.5: Error handling (AI timeout, 429 quota, bad payload)
- [x] Task 2.6: Verification: 9 Pest feature tests passed (91 assertions) & 20/20 end-to-end checks passed via `scripts/verify-day-2.php`.

---

### Day 3: Complete Product (Integration & Results Page)
- [x] Task 3.1: Extension backend communication service (`BackendService.ts`)
- [x] Task 3.2: Full-tab Results Page (`results.html` + `ResultsApp.tsx`)
- [x] Task 3.3: Visual Comparison Table (horizontal scannable, winner highlight, "Not stated" badge)
- [x] Task 3.4: Quick Verdict & Best-For cards
- [x] Task 3.5: Key Differences & Missing Info sections
- [x] Task 3.6: Action buttons: Copy comparison (Markdown), CSV export, Start new comparison, Source links
- [x] Task 3.7: Verification: Vite multi-page build succeeded; 14/14 tests passed in `verify-day-3.js`.

---

### Day 4: Quality & Testing
- [x] Task 4.1: Multi-category testing (Products, SaaS, Jobs, Courses, Services, Articles verified in `categories-truth-sheet.json`)
- [x] Task 4.2: Truth-sheet verification (strictly enforces "Not stated" instead of hallucinations; verified via Section 34 audit)
- [x] Task 4.3: Edge case handling (2, 3, and 4 pages scaling; missing data; injection defense; "No clear winner" fallback)
- [x] Task 4.4: Verification: 7 Pest Quality tests (118 assertions) passed; 17/17 checks passed in `verify-day-4-quality.php`; audit published to `docs/TRUTH-SHEET.md`.

---

### Day 5: Release & Store Assets
- [ ] Task 5.1: Production build & bundling (clean ZIP)
- [ ] Task 5.2: Privacy Policy & simple landing page
- [ ] Task 5.3: Chrome Web Store assets (128x128 icon, 5 screenshots, promo image)
- [ ] Task 5.4: Store listing documentation
