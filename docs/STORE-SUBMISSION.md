# Chrome Web Store Submission Guide

Use this copy-paste ready documentation when submitting **Compare Anything** to the Google Chrome Web Store Developer Dashboard.

---

## 1. Store Metadata

### Extension Name (Section 36)
```text
Compare Anything – AI Web Comparison
```

### Store Summary (132 characters max - Section 37)
```text
Add 2–4 web pages and get one clear AI comparison table based only on the information on those pages.
```
*(Character count: exactly 101 characters, well within the 132-character limit)*

### Category
```text
Productivity / Workflow & Planning
```

---

## 2. Detailed Store Description (Section 38)

```text
Compare Anything helps you make decisions without constantly switching between browser tabs.

Add webpages you want to compare, optionally tell us what matters to you, and get one clean AI-generated comparison based on the information contained on those pages.

Use Compare Anything for products, software plans, jobs, courses, services, hotels and other online research.

Key features:
• Compare 2–4 webpages side-by-side
• Automatically discovers useful comparison criteria (5–10 attributes)
• Creates a structured side-by-side comparison table
• Highlights important differences and trade-offs
• Takes your personal priorities and goals into account
• Identifies missing information with "Not stated" instead of guessing
• Links every item back to its original web source
• One-click Copy Comparison (Markdown) and Download CSV
• No account or registration required

Compare Anything only accesses pages that you explicitly add to a comparison.
```

---

## 3. Single-Purpose Declaration (Section 39)

For the Chrome Web Store Developer Dashboard *Single Purpose* input:

```text
Compare Anything allows users to select webpages and generate an AI-assisted side-by-side comparison of the information contained on those selected pages.
```

---

## 4. Permissions Justification (For Review Team)

When prompted by Google review team to justify requested permissions:

| Permission | Justification for Reviewer |
| :--- | :--- |
| **`activeTab`** | Required to read the URL, title, and public specifications of the currently active webpage ONLY when the user explicitly clicks the extension popup. It does not provide persistent or background browsing history. |
| **`scripting`** | Required to execute our local extraction script on the active tab to extract visible table specifications, definition lists, and schema metadata upon user button click. |
| **`storage`** | Required to temporarily save the 2 to 4 selected comparison tabs and user priorities locally in the browser (`chrome.storage.local`). No data is permanently retained. |

---

## 5. Privacy & User Data Disclosures

- **Data Collection:** Yes, but strictly limited to user-selected webpage text snippets.
- **Personally Identifiable Information (PII):** None. No names, passwords, or emails collected.
- **Authentication:** No account required.
- **Privacy Policy URL:** `https://github.com/akashkumarkundu/comparing-site/blob/main/docs/PRIVACY.md`
- **Support URL:** `https://github.com/akashkumarkundu/comparing-site/blob/main/docs/SUPPORT.md`
