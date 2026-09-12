import type {
  ComparisonResult,
  ComparisonItem,
  ComparisonCriterion,
  PageSnapshot,
  BestForRecommendation,
  MissingInfo,
} from '../models/types';

export class OfflineComparisonService {
  /**
   * Generates a structured, evidence-based comparison result directly from page snapshots
   * without requiring an active backend connection.
   */
  static generate(pages: PageSnapshot[], goal: string): ComparisonResult {
    if (pages.length === 0) {
      throw new Error('At least 2 pages are required.');
    }

    const items: ComparisonItem[] = pages.map((p, idx) => ({
      id: p.id || `item-${idx + 1}`,
      displayName: this.cleanTitle(p.title || `Item ${idx + 1}`),
      shortDescription: p.description || `${p.domain} listing`,
    }));

    // 1. Extract Price
    const priceCriterion = this.buildPriceCriterion(pages);

    // 2. Extract Common Tech / Product Specs from text
    const specCriteria = this.buildSpecCriteria(pages);

    const allCriteria: ComparisonCriterion[] = [priceCriterion, ...specCriteria];

    // 3. Determine Best Overall
    const lowestPriceItem = this.findLowestPriceItem(priceCriterion, items);
    const bestOverall = {
      itemId: lowestPriceItem ? lowestPriceItem.id : items[0]?.id || null,
      reason: lowestPriceItem
        ? `${lowestPriceItem.displayName} offers the lowest listed price while meeting core requirements.`
        : 'The compared pages offer balanced specifications across the listed features.',
    };

    // 4. Best For
    const bestFor: BestForRecommendation[] = [];
    if (lowestPriceItem) {
      bestFor.push({
        label: 'Lowest Price',
        itemId: lowestPriceItem.id,
        reason: 'Lowest listed price among the compared pages.',
      });
    }

    // 5. Key Differences
    const keyDifferences: string[] = [];
    if (priceCriterion.values.length >= 2) {
      const p1 = priceCriterion.values[0];
      const p2 = priceCriterion.values[1];
      if (p1 && p2 && p1.value !== 'Not stated' && p2.value !== 'Not stated' && p1.value !== p2.value) {
        keyDifferences.push(`${items[0]?.displayName}: ${p1.value} vs ${items[1]?.displayName}: ${p2.value}`);
      }
    }

    specCriteria.forEach((crit) => {
      const val1 = crit.values[0]?.value;
      const val2 = crit.values[1]?.value;
      if (val1 && val2 && val1 !== val2 && val1 !== 'Not stated' && val2 !== 'Not stated') {
        keyDifferences.push(`${crit.name}: ${val1} vs ${val2}`);
      }
    });

    if (keyDifferences.length === 0) {
      keyDifferences.push('Pages provide distinct specification sets extracted from their source websites.');
    }

    // 6. Missing Information (specs that are 'Not stated')
    const missingInformation: MissingInfo[] = items
      .map((it) => {
        const missingFields = allCriteria
          .filter((c) => {
            const v = c.values.find((val) => val.itemId === it.id);
            return !v || v.value.toLowerCase() === 'not stated';
          })
          .map((c) => c.name);

        return {
          itemId: it.id,
          fields: missingFields,
        };
      })
      .filter((m) => m.fields.length > 0);

    const comparisonTitle = items.map((it) => it.displayName).join(' vs ');

    return {
      comparisonTitle,
      comparisonType: this.detectCategory(pages),
      goal: goal || 'General comparison',
      items,
      criteria: allCriteria,
      bestOverall,
      bestFor,
      keyDifferences: keyDifferences.slice(0, 4),
      missingInformation,
    };
  }

  private static cleanTitle(title: string): string {
    return title
      .split(/[-–|:—]/)[0]
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 40) || title;
  }

  private static detectCategory(pages: PageSnapshot[]): string {
    const text = pages.map((p) => (p.title + ' ' + p.importantText).toLowerCase()).join(' ');
    if (text.includes('laptop') || text.includes('notebook') || text.includes('processor')) return 'Laptop';
    if (text.includes('phone') || text.includes('smartphone') || text.includes('camera')) return 'Smartphone';
    if (text.includes('course') || text.includes('class') || text.includes('syllabus')) return 'Course';
    if (text.includes('job') || text.includes('salary') || text.includes('engineer')) return 'Job';
    if (text.includes('hosting') || text.includes('server') || text.includes('storage')) return 'Hosting';
    return 'Product';
  }

  private static buildPriceCriterion(pages: PageSnapshot[]): ComparisonCriterion {
    const prices = pages.map((p) => this.extractPrice(p));
    let lowestVal = Infinity;
    let winnerId = '';

    prices.forEach((item, idx) => {
      if (item.numeric > 0 && item.numeric < lowestVal) {
        lowestVal = item.numeric;
        winnerId = pages[idx]?.id || '';
      }
    });

    return {
      name: 'Price',
      importance: 'high',
      values: pages.map((p, idx) => ({
        itemId: p.id,
        value: prices[idx]?.formatted || 'Not stated',
        confidence: 'high',
      })),
      winnerItemIds: winnerId ? [winnerId] : [],
    };
  }

  private static extractPrice(page: PageSnapshot): { numeric: number; formatted: string } {
    // 1. Try structuredData JSON
    if (page.structuredData) {
      try {
        const parsed = JSON.parse(page.structuredData);
        const rawPrice =
          parsed.price ||
          parsed.offers?.price ||
          parsed.offers?.[0]?.price;
        const currency = parsed.priceCurrency || parsed.offers?.priceCurrency || 'Tk';
        if (rawPrice) {
          const num = parseFloat(rawPrice.toString().replace(/[^0-9.]/g, ''));
          if (!isNaN(num) && num > 0) {
            return { numeric: num, formatted: `${currency} ${num.toLocaleString()}` };
          }
        }
      } catch {
        // ignore
      }
    }

    // 2. Try regex match on importantText or title
    const haystack = `${page.title}\n${page.importantText}`;
    const pricePatterns = [
      /(?:Tk|BDT|৳|Price:\s*Tk|৳)\s*([0-9,]{2,10})/i,
      /(?:\$|USD|US\$)\s*([0-9,]{1,8}(?:\.[0-9]{2})?)/i,
      /([0-9,]{2,8})\s*(?:Tk|BDT|৳)/i,
    ];

    for (const pattern of pricePatterns) {
      const match = haystack.match(pattern);
      if (match && match[1]) {
        const num = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(num) && num > 0) {
          return { numeric: num, formatted: `Tk ${num.toLocaleString()}` };
        }
      }
    }

    return { numeric: 0, formatted: 'Not stated' };
  }

  private static buildSpecCriteria(pages: PageSnapshot[]): ComparisonCriterion[] {
    const specPatterns: { name: string; importance: 'high' | 'medium'; regex: RegExp }[] = [
      {
        name: 'Processor / CPU',
        importance: 'high',
        regex: /(Intel\s+Core\s+i[3579]-?[0-9]{4,5}[A-Z]*|AMD\s+Ryzen\s+[3579]\s+[0-9]{4}[A-Z]*|Apple\s+M[1234][\s\w]*|Snapdragon\s+[\w\d]+|MediaTek\s+Dimensity\s+[\w\d]+)/i,
      },
      {
        name: 'RAM / Memory',
        importance: 'high',
        regex: /([0-9]{1,3}\s*GB\s*(?:DDR[345]|LPDDR[45]X?|RAM)?)/i,
      },
      {
        name: 'Storage / Capacity',
        importance: 'high',
        regex: /([0-9]{1,4}\s*(?:GB|TB)\s*(?:SSD|NVMe|HDD|UFS)?)/i,
      },
      {
        name: 'Display / Screen',
        importance: 'medium',
        regex: /([0-9]{1,2}(?:\.[0-9])?["”]\s*(?:FHD|OLED|AMOLED|IPS|Retina|4K|QHD|Full\s*HD)?(?:\s*\(?[0-9]{3,4}\s*x\s*[0-9]{3,4}\)?)?)/i,
      },
      {
        name: 'Battery / Power',
        importance: 'medium',
        regex: /([0-9]{2,5}\s*(?:mAh|Wh)(?:\s*(?:Li-ion|Polymer|\w+)?(?:\s*[0-9]{2,3}W)?)?)/i,
      },
      {
        name: 'Weight',
        importance: 'medium',
        regex: /([0-9]+(?:\.[0-9]+)?\s*(?:kg|g|lbs)\b)/i,
      },
      {
        name: 'Warranty',
        importance: 'medium',
        regex: /([0-9]\s*(?:years?|months?)\s*(?:warranty|official|brand)?)/i,
      },
    ];

    const criteria: ComparisonCriterion[] = [];

    specPatterns.forEach(({ name, importance, regex }) => {
      let atLeastOneFound = false;
      const values = pages.map((p) => {
        const text = `${p.title}\n${p.importantText}`;
        const match = text.match(regex);
        if (match && match[1]) {
          atLeastOneFound = true;
          return {
            itemId: p.id,
            value: match[1].trim(),
            confidence: 'high' as const,
          };
        }
        return {
          itemId: p.id,
          value: 'Not stated',
          confidence: 'high' as const,
        };
      });

      if (atLeastOneFound) {
        criteria.push({
          name,
          importance,
          values,
          winnerItemIds: [],
        });
      }
    });

    return criteria;
  }

  private static findLowestPriceItem(
    priceCriterion: ComparisonCriterion,
    items: ComparisonItem[]
  ): ComparisonItem | null {
    let minPrice = Infinity;
    let minItem: ComparisonItem | null = null;

    priceCriterion.values.forEach((v) => {
      if (v.value !== 'Not stated') {
        const num = parseFloat(v.value.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0 && num < minPrice) {
          minPrice = num;
          minItem = items.find((it) => it.id === v.itemId) || null;
        }
      }
    });

    return minItem;
  }
}
