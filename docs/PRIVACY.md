# Privacy Policy for Compare Anything

**Effective Date:** September 9, 2026  
**Last Updated:** September 9, 2026

At **Compare Anything**, we value your privacy. This Privacy Policy explains what information our Google Chrome extension collects, how it is handled, and how your data is protected in full compliance with the **Google Chrome Web Store User Data Policy**.

---

## 1. Single Purpose Declaration
**Compare Anything** has a single, well-defined purpose:  
> *To compare information from webpages explicitly selected by the user and generate a structured, side-by-side comparison.*

We do not collect background browsing history, we do not scan all open tabs, and we do not track your internet usage.

---

## 2. When and How Data is Collected
- **User-Initiated Action Only:** The extension accesses webpage content **only when you explicitly click** `[+ ADD TO COMPARISON]` on an active tab.
- **Active Tab Permission:** We use the `activeTab` permission. This provides temporary, one-time read access to the current page. The extension has no background access to other tabs or closed browsing sessions.

---

## 3. What Information is Extracted
When you add a page to a comparison, our open-source `PageExtractor` extracts only non-sensitive, relevant product or page data:
- Webpage URL and Domain Name
- Page Title and Meta Description
- Public Schema.org / JSON-LD structured product specifications
- Visible specification tables, definition lists (`dl/dt/dd`), and text content (intelligently limited to ~3,500 characters).

### What We NEVER Collect or Extract:
- No passwords, credentials, form input fields, or credit card details
- No cookies, session tokens, or local storage authentication data
- No private account or banking information
- No personal user browsing history or bookmarks

---

## 4. How Information is Transmitted and Processed
- **Encrypted Transmission:** When you click `[ COMPARE ]`, the extracted text snapshots and your optional goal are securely transmitted to our backend API over **HTTPS**.
- **AI Processing:** The backend forwards the extracted page snapshots to our AI provider (**Groq** / **OpenRouter**) solely to parse and organize the text into a structured comparison table.
- **Strict Processing Scope:** The transmitted content is used **only** to generate your requested comparison table and recommendations.

---

## 5. Data Storage and Retention
- **Zero Permanent Storage:** We do **not** permanently store your webpage content or your personal comparison queries on our servers.
- **Temporary Browser Storage:** Your selected comparison tabs and priorities are stored locally in your own browser using `chrome.storage.local`. When you click `[ Clear Comparison ]` or remove a page, the data is completely deleted from your browser.
- **No Human Review:** Human operators do not routinely review or read your extracted page content or comparisons.

---

## 6. What We Do NOT Do With Your Data
- **We NEVER sell your data** to data brokers or third parties.
- **We NEVER use your data for advertising**, profiling, or retargeting.
- **We NEVER use your data for credit-worthiness or surveillance**.

---

## 7. Minimal Chrome Permissions Explained
Our `manifest.json` requests only the minimal permissions required:
- `activeTab`: Grants temporary access to the webpage you are currently viewing only when you click the extension icon.
- `scripting`: Allows the extension to extract visible text and tables from the current webpage upon user click.
- `storage`: Allows the extension to remember your selected 2–4 pages and comparison preferences locally in your browser.

We explicitly do **not** request `<all_urls>`, `history`, `bookmarks`, `downloads`, or `clipboardRead`.

---

## 8. Contact & Support
If you have questions about this privacy policy or our extension, please contact us:
- **Email:** support@compareanything.app (or akashkumarkundu2102121@gmail.com)
- **Repository:** https://github.com/akashkumarkundu/comparing-site
- **Issues:** https://github.com/akashkumarkundu/comparing-site/issues
