import type { PageSnapshot } from '../models/types';

/**
 * In-tab extraction function executed via chrome.scripting.executeScript.
 * Must be self-contained and run inside the target page's DOM context.
 */
export function extractPageInTabDOM(): {
  url: string;
  domain: string;
  title: string;
  description: string;
  structuredData: string;
  importantText: string;
} {
  const url = window.location.href;
  const domain = window.location.hostname.replace(/^www\./, '');

  // 1. Title
  let title = document.title || '';
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const h1Text = document.querySelector('h1')?.textContent?.trim();
  if (h1Text && (!title || h1Text.length < title.length)) {
    title = h1Text;
  } else if (ogTitle) {
    title = ogTitle;
  }
  title = title.replace(/\s+/g, ' ').trim();

  // 2. Meta description
  const description = (
    document.querySelector('meta[name="description"]')?.getAttribute('content') ||
    document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
    ''
  ).replace(/\s+/g, ' ').trim();

  // 3. Relevant JSON-LD / schema.org
  let structuredData = '';
  try {
    const jsonLdElements = document.querySelectorAll('script[type="application/ld+json"]');
    const relevantItems: any[] = [];

    jsonLdElements.forEach((el) => {
      try {
        const parsed = JSON.parse(el.textContent || '{}');
        const items = Array.isArray(parsed) ? parsed : parsed['@graph'] ? parsed['@graph'] : [parsed];

        items.forEach((item: any) => {
          if (!item || typeof item !== 'object') return;
          const type = (item['@type'] || '').toString().toLowerCase();
          if (
            type.includes('product') ||
            type.includes('offer') ||
            type.includes('jobposting') ||
            type.includes('course') ||
            type.includes('hotel') ||
            type.includes('service') ||
            type.includes('itemlist')
          ) {
            relevantItems.push({
              type: item['@type'],
              name: item.name,
              brand: item.brand?.name || item.brand,
              price: item.offers?.price || item.offers?.lowPrice || item.price,
              currency: item.offers?.priceCurrency || item.priceCurrency,
              description: item.description,
              specs: item.additionalProperty,
            });
          }
        });
      } catch {
        // Skip invalid JSON-LD
      }
    });

    if (relevantItems.length > 0) {
      structuredData = JSON.stringify(relevantItems.slice(0, 2), null, 2).slice(0, 1000);
    }
  } catch {
    structuredData = '';
  }

  // 4. Clutter Removal Clone (Carefully targeted to preserve modern SPA content)
  const clone = document.body
    ? (document.body.cloneNode(true) as HTMLElement)
    : document.documentElement
    ? (document.documentElement.cloneNode(true) as HTMLElement)
    : document.createElement('div');

  const junkSelectors = [
    'script',
    'style',
    'noscript',
    'iframe',
    'svg',
    'nav',
    'footer',
    '[role="navigation"]',
    '[role="banner"]',
    '.cookie',
    '#cookie',
    '.consent',
    '.ad',
    '.ads',
    '.advertisement',
  ];

  junkSelectors.forEach((sel) => {
    clone.querySelectorAll(sel).forEach((el) => el.remove());
  });

  // 5. Structured Data Collection
  const structuredSections: string[] = [];

  // 5a. Tables (e.g. specification tables) - extract up to 60 rows
  const tables = clone.querySelectorAll('table');
  tables.forEach((table) => {
    const rows = Array.from(table.querySelectorAll('tr')).slice(0, 60);
    const tableLines: string[] = [];
    rows.forEach((tr) => {
      const cells = Array.from(tr.querySelectorAll('th, td'))
        .map((td) => td.textContent?.replace(/\s+/g, ' ').trim() || '')
        .filter(Boolean);
      if (cells.length >= 2) {
        tableLines.push(`${cells[0]}: ${cells.slice(1).join(' | ')}`);
      }
    });
    if (tableLines.length > 0) {
      structuredSections.push(tableLines.join('\n'));
    }
  });

  // 5b. Modern eCommerce Key-Value Attribute Pairs
  const titleElements = clone.querySelectorAll(
    '[class*="att-title"], [class*="attr-title"], [class*="spec-title"], [class*="spec-name"], [class*="prop-name"], [class*="property-name"], [class*="label-title"]'
  );
  const customAttrLines: string[] = [];
  titleElements.forEach((titleEl) => {
    const key = titleEl.textContent?.replace(/\s+/g, ' ').trim() || '';
    if (!key) return;

    let val = '';
    let curr: HTMLElement | null = titleEl.parentElement;
    let depth = 0;
    while (curr && depth < 4 && curr !== clone) {
      const valEl = curr.querySelector(
        '[class*="att-value"], [class*="attr-value"], [class*="spec-value"], [class*="prop-val"], [class*="property-value"]'
      );
      if (valEl && valEl !== titleEl) {
        val = valEl.textContent?.replace(/\s+/g, ' ').trim() || '';
        break;
      }
      curr = curr.parentElement;
      depth++;
    }

    if (key && val && key !== val && key.length < 80 && val.length < 200) {
      customAttrLines.push(`${key}: ${val}`);
    }
  });

  if (customAttrLines.length > 0) {
    const uniqueAttrs = Array.from(new Set(customAttrLines));
    structuredSections.push(uniqueAttrs.slice(0, 60).join('\n'));
  }

  // 5c. Definition lists (<dl>, <dt>, <dd>)
  const dls = clone.querySelectorAll('dl');
  dls.forEach((dl) => {
    const dts = dl.querySelectorAll('dt');
    const dlLines: string[] = [];
    dts.forEach((dt) => {
      const dd = dt.nextElementSibling;
      const key = dt.textContent?.replace(/\s+/g, ' ').trim() || '';
      const val = dd?.textContent?.replace(/\s+/g, ' ').trim() || '';
      if (key && val) {
        dlLines.push(`${key}: ${val}`);
      }
    });
    if (dlLines.length > 0) {
      structuredSections.push(dlLines.join('\n'));
    }
  });

  // 5d. Spec-like lists (elements with spec, attribute, detail classes)
  const specContainers = clone.querySelectorAll(
    '[class*="spec"], [class*="feature"], [class*="attribute"], [class*="detail"], [id*="spec"]'
  );
  specContainers.forEach((container) => {
    const items = container.querySelectorAll('li, tr, .item, .row');
    const specLines: string[] = [];
    items.forEach((item) => {
      const text = item.textContent?.replace(/\s+/g, ' ').trim();
      if (text && text.length > 3 && text.length < 150) {
        specLines.push(text);
      }
    });
    if (specLines.length > 0) {
      structuredSections.push(specLines.slice(0, 20).join('\n'));
    }
  });

  // 5e. Dedicated Wealth, Valuation, Pricing & Financial Figures Extractor
  const financialMatches: string[] = [];
  const priceElements = clone.querySelectorAll(
    '[class*="price"], [class*="fee"], [class*="cost"], [class*="amount"], [class*="discount"], [class*="wealth"], [class*="worth"], [id*="price"], [id*="fee"], [id*="cost"], [id*="worth"]'
  );
  priceElements.forEach((el) => {
    const text = el.textContent?.replace(/\s+/g, ' ').trim();
    if (text && text.length > 1 && text.length < 100 && (
      text.includes('৳') || text.includes('Tk') || text.includes('BDT') ||
      text.includes('$') || text.includes('€') || text.includes('£') ||
      text.includes('টাকা') || text.toLowerCase().includes('fee') ||
      text.toLowerCase().includes('worth') || text.toLowerCase().includes('price') || /\d+/.test(text)
    )) {
      financialMatches.push(text);
    }
  });

  // Body text scan for Net Worth, Wealth, Valuation, and Multi-unit Currency figures
  const rawBodyText = clone.textContent || '';

  // Specific Net Worth / Wealth sentence matches
  const netWorthRegex = /[^.\n;]{0,50}\b(?:net\s*worth|wealth|estimated\s*worth|valuation|market\s*cap(?:italization)?)\b[^.\n;]{0,90}/gi;
  const netWorthMatches = rawBodyText.match(netWorthRegex) || [];
  netWorthMatches.forEach((m) => {
    const clean = m.replace(/\s+/g, ' ').trim();
    if (clean.length > 5 && clean.length < 150 && /\d/.test(clean)) {
      financialMatches.push(clean);
    }
  });

  // Currency figures with scale words (e.g. US$908 billion, $106.5 billion, 50,000 BDT)
  const currencyRegex = /(?:US\$|\$|€|£|৳|Tk\.?|BDT|টাকা)\s*[\d,]+(?:\.\d+)?\s*(?:trillion|billion|million|thousand|k|m|b|crore|lakh)?\b|\b[\d,]+(?:\.\d+)?\s*(?:trillion|billion|million|crore|lakh)\s*(?:USD|dollars?|BDT|টাকা|৳|Tk\.?)\b/gi;
  const rawCurrencyMatches = rawBodyText.match(currencyRegex) || [];
  rawCurrencyMatches.forEach((m) => {
    const clean = m.replace(/\s+/g, ' ').trim();
    if (clean.length > 1 && clean.length < 40) {
      financialMatches.push(clean);
    }
  });

  // 5f. Bullet Points, Highlights & Key Features
  const featureList: string[] = [];
  clone.querySelectorAll('li, [class*="highlight"], [class*="bullet"], [class*="benefit"], [class*="course"], [class*="routine"], [class*="curriculum"], [class*="exam"], [class*="class-count"]').forEach((el) => {
    const text = el.textContent?.replace(/\s+/g, ' ').trim();
    if (text && text.length > 4 && text.length < 250 && !featureList.includes(text)) {
      featureList.push(text);
    }
  });

  // 5g. Badges & Metadata Chips (e.g. Batch, Validity, Online/Offline)
  const badgeList: string[] = [];
  clone.querySelectorAll('[class*="badge"], [class*="pill"], [class*="tag"], [class*="chip"], [class*="label"], [class*="meta"]').forEach((el) => {
    const text = el.textContent?.replace(/\s+/g, ' ').trim();
    if (text && text.length > 2 && text.length < 80 && !badgeList.includes(text)) {
      badgeList.push(text);
    }
  });

  // 6. Headings Hierarchy
  const headingList: string[] = [];
  clone.querySelectorAll('h1, h2, h3, h4').forEach((h) => {
    const text = h.textContent?.replace(/\s+/g, ' ').trim();
    if (text && text.length > 3 && text.length < 120) {
      headingList.push(`## ${text}`);
    }
  });

  // 7. Lead Paragraphs & Visible Overview
  const leadParagraphs: string[] = [];
  const bodyParagraphs: string[] = [];

  // Extract first 4 main paragraphs (ensuring complete overview & Net Worth are always captured)
  const allP = clone.querySelectorAll('p');
  let leadCount = 0;
  allP.forEach((p) => {
    const text = p.textContent?.replace(/\s+/g, ' ').trim() || '';
    if (text.length < 25) return;
    if (leadCount < 4 && text.length < 1500) {
      leadParagraphs.push(text);
      leadCount++;
    } else if (text.length < 1200 && !bodyParagraphs.includes(text)) {
      bodyParagraphs.push(text);
    }
  });

  // Extract other visible text blocks (blockquotes, descriptions, summaries)
  clone.querySelectorAll('blockquote, [class*="desc"], [class*="about"], [class*="detail"], [class*="summary"], [class*="content"]').forEach((el) => {
    if (el.tagName === 'P') return;
    if (el.querySelector('p, table, ul, ol, div, section, article')) return;
    const text = el.textContent?.replace(/\s+/g, ' ').trim();
    if (text && text.length > 25 && text.length < 1000 && !bodyParagraphs.includes(text) && !leadParagraphs.includes(text)) {
      bodyParagraphs.push(text);
    }
  });

  // Fallback: If paragraphs are sparse, extract clean text lines from the whole page
  if (leadParagraphs.length === 0 && bodyParagraphs.length < 5) {
    const rawLines = (clone.innerText || clone.textContent || '')
      .split('\n')
      .map((l) => l.replace(/\s+/g, ' ').trim())
      .filter((l) => l.length > 20 && l.length < 400);
    const uniqueLines = Array.from(new Set(rawLines)).slice(0, 25);
    uniqueLines.forEach((line) => {
      if (!bodyParagraphs.includes(line)) {
        bodyParagraphs.push(line);
      }
    });
  }

  // 8. Assemble Comprehensive importantText (prioritizing Lead Summary & Financials at the TOP)
  let finalImportantText = '';

  // 8a. SUMMARY & LEAD (Top Priority)
  const summaryParts: string[] = [];
  if (description) {
    summaryParts.push(description);
  }
  if (leadParagraphs.length > 0) {
    summaryParts.push(...leadParagraphs);
  }
  if (summaryParts.length > 0) {
    finalImportantText += `[SUMMARY & LEAD OVERVIEW]\n${summaryParts.join('\n\n')}\n\n`;
  }

  // 8b. FINANCIALS, WEALTH & PRICING (Top Priority)
  const uniqueFinancials = Array.from(new Set(financialMatches)).slice(0, 15);
  if (uniqueFinancials.length > 0) {
    finalImportantText += `[KEY FINANCIALS, WEALTH & PRICING]\n• ${uniqueFinancials.join('\n• ')}\n\n`;
  }

  // 8c. SPECIFICATIONS & ATTRIBUTES (Tables, Infoboxes)
  const tableBlock = structuredSections.join('\n\n');
  if (tableBlock) {
    finalImportantText += `[SPECIFICATIONS & ATTRIBUTES]\n${tableBlock}\n\n`;
  }

  // 8d. KEY HIGHLIGHTS & ACHIEVEMENTS
  const uniqueFeatures = Array.from(new Set(featureList)).slice(0, 30);
  if (uniqueFeatures.length > 0) {
    finalImportantText += `[KEY HIGHLIGHTS & FEATURES]\n• ${uniqueFeatures.join('\n• ')}\n\n`;
  }

  // 8e. TAGS & METADATA
  const uniqueBadges = Array.from(new Set(badgeList)).slice(0, 15);
  if (uniqueBadges.length > 0) {
    finalImportantText += `[TAGS & LABELS]\n${uniqueBadges.join(' | ')}\n\n`;
  }

  // 8f. HEADINGS
  const headingsBlock = headingList.slice(0, 12).join('\n');
  if (headingsBlock) {
    finalImportantText += `[PAGE SECTIONS]\n${headingsBlock}\n\n`;
  }

  // 8g. ADDITIONAL DETAILS & CONTEXT
  const uniqueBody = Array.from(new Set(bodyParagraphs)).slice(0, 15);
  if (uniqueBody.length > 0) {
    finalImportantText += `[ADDITIONAL DETAILS]\n${uniqueBody.join('\n\n')}\n`;
  }

  // Cap at ~10,000 characters (within backend 15,000 limit)
  if (finalImportantText.length > 10000) {
    finalImportantText = finalImportantText.substring(0, 10000) + '... [truncated]';
  }

  return {
    url,
    domain,
    title,
    description,
    structuredData,
    importantText: finalImportantText.trim(),
  };
}

/**
 * Extracts page snapshot from the current active tab.
 */
export async function captureCurrentTab(): Promise<PageSnapshot> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.id) {
    throw new Error('No active browser tab found.');
  }

  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:')) {
    throw new Error('Cannot add internal browser pages. Please open a public webpage to compare.');
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractPageInTabDOM,
  });

  if (!results || results.length === 0 || !results[0].result) {
    throw new Error("Couldn't extract enough information from this page.");
  }

  const data = results[0].result;

  return {
    id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    url: data.url,
    domain: data.domain,
    title: data.title || tab.title || data.domain,
    description: data.description,
    structuredData: data.structuredData,
    importantText: data.importantText || data.title,
    capturedAt: new Date().toISOString(),
  };
}
