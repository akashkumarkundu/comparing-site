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
- [ ] Task 2.1: Web API project structure (`POST /api/v1/compare`)
- [ ] Task 2.2: `IAIProvider` abstraction & `GroqProvider` (`openai/gpt-oss-20b`)
- [ ] Task 2.3: Anti-hallucination System Prompt & Strict JSON Schema
- [ ] Task 2.4: Rate limiting (10 comparisons/install/day + IP limit)
- [ ] Task 2.5: Error handling (AI timeout, 429 quota, bad payload)

---

### Day 3: Complete Product (Integration & Results Page)
- [ ] Task 3.1: Extension backend communication service
- [ ] Task 3.2: Full-tab Results Page (`results.html`)
- [ ] Task 3.3: Visual Comparison Table (horizontal scannable, winner highlight)
- [ ] Task 3.4: Quick Verdict & Best-For cards
- [ ] Task 3.5: Key Differences & Missing Info sections
- [ ] Task 3.6: Action buttons: Copy comparison, CSV export, Open source links

---

### Day 4: Quality & Testing
- [ ] Task 4.1: Multi-category testing (Laptops, SaaS, Jobs, Courses, Hotels)
- [ ] Task 4.2: Truth-sheet verification (confirm "Not stated" instead of hallucinations)
- [ ] Task 4.3: Edge case handling (single page, duplicate URLs, dynamic JS sites)

---

### Day 5: Release & Store Assets
- [ ] Task 5.1: Production build & bundling (clean ZIP)
- [ ] Task 5.2: Privacy Policy & simple landing page
- [ ] Task 5.3: Chrome Web Store assets (128x128 icon, 5 screenshots, promo image)
- [ ] Task 5.4: Store listing documentation
