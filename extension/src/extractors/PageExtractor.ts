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

  // 4. Clutter Removal Clone
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
    'header',
    'footer',
    'aside',
    '[role="navigation"]',
    '[role="banner"]',
    '[role="dialog"]',
    '.cookie',
    '#cookie',
    '.consent',
    '.ad',
    '.ads',
    '.advertisement',
    '.sidebar',
    '[aria-hidden="true"]',
    '[hidden]',
  ];

  junkSelectors.forEach((sel) => {
    clone.querySelectorAll(sel).forEach((el) => el.remove());
  });

  // 5. Structured Data Collection (Tables, Specs, DLs, eCommerce Key-Values)
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

  // 5b. Modern eCommerce Key-Value Attribute Pairs (e.g. Ryans, Daraz, StarTech, BestBuy)
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

  // 6. Headings & Key Bullet points
  const headingList: string[] = [];
  clone.querySelectorAll('h1, h2, h3, h4').forEach((h) => {
    const text = h.textContent?.replace(/\s+/g, ' ').trim();
    if (text && text.length > 3 && text.length < 120) {
      headingList.push(`## ${text}`);
    }
  });

  // 7. Visible paragraphs from main content
  const mainEl = clone.querySelector('main, article, [role="main"], #content, .content') || clone;
  const paragraphs: string[] = [];
  mainEl.querySelectorAll('p').forEach((p) => {
    const text = p.textContent?.replace(/\s+/g, ' ').trim();
    if (text && text.length > 20 && text.length < 500) {
      paragraphs.push(text);
    }
  });

  // 8. Intelligent Truncation & Prioritization (~5,000 chars limit)
  // Priority: Specifications/Tables/Attributes > Headings > Description > Body text
  let finalImportantText = '';

  const tableBlock = structuredSections.join('\n\n');
  const headingsBlock = headingList.slice(0, 10).join('\n');
  const bodyBlock = paragraphs.slice(0, 8).join('\n\n');

  if (tableBlock) {
    finalImportantText += `[SPECIFICATIONS & ATTRIBUTES]\n${tableBlock}\n\n`;
  }

  if (headingsBlock && finalImportantText.length < 3500) {
    finalImportantText += `[KEY SECTIONS]\n${headingsBlock}\n\n`;
  }

  if (description && finalImportantText.length < 4000) {
    finalImportantText += `[SUMMARY]\n${description}\n\n`;
  }

  if (bodyBlock && finalImportantText.length < 4500) {
    finalImportantText += `[OVERVIEW]\n${bodyBlock}\n`;
  }

  // Cap at ~5,000 characters
  if (finalImportantText.length > 5000) {
    finalImportantText = finalImportantText.substring(0, 5000) + '... [truncated]';
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
