import type { ComparisonResult } from '../models/types';

interface CriteriaRowLayout {
  crit: ComparisonResult['criteria'][number];
  rowHeight: number;
  nameLines: string[];
  values: {
    itemId: string;
    text: string;
    lines: string[];
    isWinner: boolean;
    isNotStated: boolean;
  }[];
}

export class ShareImageGenerator {
  /**
   * Generates a sleek, high-resolution HTML Canvas representation of the comparison.
   * Dynamically calculates canvas height and wraps rows so that ALL comparison criteria are fully included.
   */
  static generateCanvas(result: ComparisonResult): HTMLCanvasElement {
    const width = 1200;
    const scale = 2; // High-DPI retina sharpness

    // Context for preliminary text measurements to calculate layout & height
    const measureCanvas = document.createElement('canvas');
    const mCtx = measureCanvas.getContext('2d');
    if (!mCtx) {
      throw new Error('Canvas 2D context is unavailable');
    }

    const tableX = 50;
    const tableWidth = width - 100;
    const featureColWidth = 240;
    const itemCount = Math.min(result.items.length, 4);
    const itemColWidth = (tableWidth - featureColWidth) / Math.max(itemCount, 1);

    // Pre-calculate all criteria rows layout (wrap text and determine row heights)
    const allCriteria = result.criteria || [];
    const rowLayouts: CriteriaRowLayout[] = allCriteria.map((crit) => {
      mCtx.font = crit.importance === 'high'
        ? 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        : '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const nameLines = this.wrapText(mCtx, crit.name, featureColWidth - 24, 2);

      const valueLayouts = result.items.slice(0, itemCount).map((it) => {
        const valObj = crit.values.find((v) => v.itemId === it.id);
        const isWinner = crit.winnerItemIds.includes(it.id);
        const rawVal = valObj?.value || 'Not stated';
        const isNotStated = rawVal.toLowerCase() === 'not stated';
        const fullValText = isWinner && !rawVal.toLowerCase().includes('best') && !isNotStated
          ? `${rawVal}  ✓ Best`
          : rawVal;

        mCtx.font = isWinner
          ? 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          : (isNotStated
            ? 'italic 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            : '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');

        const lines = this.wrapText(mCtx, fullValText, itemColWidth - 16, 2);
        return {
          itemId: it.id,
          text: fullValText,
          lines,
          isWinner,
          isNotStated,
        };
      });

      const maxLines = Math.max(
        nameLines.length,
        ...valueLayouts.map((v) => v.lines.length),
        1
      );
      const rowHeight = maxLines === 1 ? 34 : 48;

      return {
        crit,
        rowHeight,
        nameLines,
        values: valueLayouts,
      };
    });

    const totalCriteriaHeight = rowLayouts.reduce((sum, r) => sum + r.rowHeight + 2, 0);

    // Dynamic height calculation
    let currentY = 176;
    if (result.goal) {
      currentY += 40;
    } else {
      currentY += 12;
    }
    const verdictHeight = 88;
    currentY += verdictHeight + 24;

    if (result.bestFor && result.bestFor.length > 0) {
      currentY += 18 + 76;
    }

    if (rowLayouts.length > 0 && itemCount > 0) {
      currentY += 38 + totalCriteriaHeight + 24;
    }

    const footerPadding = 80;
    const height = Math.max(800, currentY + footerPadding);

    // Create the actual high-res canvas
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context is unavailable');
    }

    ctx.scale(scale, scale);

    // 1. Background Gradient (Modern Vibrant White & Blue Theme)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#f0f7ff');
    bgGrad.addColorStop(0.3, '#ffffff');
    bgGrad.addColorStop(0.7, '#f8faff');
    bgGrad.addColorStop(1, '#e8f2fe');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle ambient glowing accents (royal blue & sky cyan)
    const radGrad1 = ctx.createRadialGradient(width - 120, 80, 20, width - 120, 80, 420);
    radGrad1.addColorStop(0, 'rgba(59, 130, 246, 0.16)');
    radGrad1.addColorStop(1, 'transparent');
    ctx.fillStyle = radGrad1;
    ctx.fillRect(0, 0, width, height);

    const radGrad2 = ctx.createRadialGradient(80, 260, 20, 80, 260, 360);
    radGrad2.addColorStop(0, 'rgba(14, 165, 233, 0.12)');
    radGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = radGrad2;
    ctx.fillRect(0, 0, width, height);

    const radGrad3 = ctx.createRadialGradient(width / 2, height - 100, 30, width / 2, height - 100, 450);
    radGrad3.addColorStop(0, 'rgba(99, 102, 241, 0.07)');
    radGrad3.addColorStop(1, 'transparent');
    ctx.fillStyle = radGrad3;
    ctx.fillRect(0, 0, width, height);

    // Card outer border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, 24, 24, width - 48, height - 48, 20);
    ctx.stroke();

    // Inner subtle luxury border
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.14)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, 28, 28, width - 56, height - 56, 17);
    ctx.stroke();

    // 2. Top Header Bar
    // Logo Icon Badge
    const logoGrad = ctx.createLinearGradient(50, 50, 94, 94);
    logoGrad.addColorStop(0, '#2563eb');
    logoGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = logoGrad;
    this.roundRect(ctx, 50, 50, 44, 44, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CA', 72, 73);

    // App Name & Tagline
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('COMPARE ANYTHING', 106, 68);

    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Stop switching between tabs. Compare them.', 106, 88);

    // Category Tag (Top Right)
    const categoryText = (result.comparisonType || 'Comparison').toUpperCase();
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const catWidth = ctx.measureText(categoryText).width + 26;
    ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
    this.roundRect(ctx, width - 50 - catWidth, 56, catWidth, 28, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.28)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, width - 50 - catWidth, 56, catWidth, 28, 14);
    ctx.stroke();

    ctx.fillStyle = '#1d4ed8';
    ctx.textAlign = 'center';
    ctx.fillText(categoryText, width - 50 - catWidth / 2, 74);

    // Divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(50, 114);
    ctx.lineTo(width - 50, 114);
    ctx.stroke();

    // 3. Comparison Title & Priority
    ctx.textAlign = 'left';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#0f172a';

    const title = result.comparisonTitle || 'Side-by-Side Comparison';
    const truncatedTitle = this.truncateText(ctx, title, width - 100);
    ctx.fillText(truncatedTitle, 50, 154);

    let drawY = 176;
    if (result.goal) {
      const goalText = `User Priority: ${result.goal}`;
      ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const goalWidth = ctx.measureText(goalText).width + 24;

      ctx.fillStyle = 'rgba(245, 158, 11, 0.10)';
      this.roundRect(ctx, 50, drawY, Math.min(goalWidth, width - 100), 26, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 1;
      this.roundRect(ctx, 50, drawY, Math.min(goalWidth, width - 100), 26, 6);
      ctx.stroke();

      ctx.fillStyle = '#b45309';
      ctx.fillText(this.truncateText(ctx, goalText, width - 120), 62, drawY + 17);
      drawY += 40;
    } else {
      drawY += 12;
    }

    // 4. Best Overall Verdict Banner (Vibrant Blue Highlight Card)
    const bestItem = result.items.find((it) => it.id === result.bestOverall?.itemId);
    const bestWinnerName = bestItem ? bestItem.displayName : (result.bestOverall?.itemId ? 'Declared Winner' : 'No Clear Winner');
    const bestReason = result.bestOverall?.reason || 'The provided pages do not contain enough decisive evidence.';

    const verdictGrad = ctx.createLinearGradient(50, drawY, width - 50, drawY + verdictHeight);
    verdictGrad.addColorStop(0, '#1e40af'); // Deep royal blue
    verdictGrad.addColorStop(0.55, '#2563eb'); // Vibrant blue
    verdictGrad.addColorStop(1, '#0284c7'); // Electric sky blue
    ctx.fillStyle = verdictGrad;
    this.roundRect(ctx, 50, drawY, width - 100, verdictHeight, 14);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.30)';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, 50, drawY, width - 100, verdictHeight, 14);
    ctx.stroke();

    // Trophy Icon / Tag
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#93c5fd';
    ctx.fillText('★ BEST OVERALL RECOMMENDATION', 72, drawY + 28);

    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.truncateText(ctx, bestWinnerName, width - 144), 72, drawY + 54);

    ctx.font = '400 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText(this.truncateText(ctx, bestReason, width - 144), 72, drawY + 76);

    drawY += verdictHeight + 24;

    // 5. Best For Quick Highlights (Pills grid)
    if (result.bestFor && result.bestFor.length > 0) {
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('KEY HIGHLIGHTS & BEST-FOR AWARDS:', 50, drawY + 6);
      drawY += 18;

      const highlights = result.bestFor.slice(0, 3);
      const pillWidth = (width - 100 - (highlights.length - 1) * 16) / highlights.length;

      highlights.forEach((bf, idx) => {
        const item = result.items.find((it) => it.id === bf.itemId);
        const itemName = item ? item.displayName : 'Item';
        const pillX = 50 + idx * (pillWidth + 16);

        // White card with soft border
        ctx.fillStyle = '#ffffff';
        this.roundRect(ctx, pillX, drawY, pillWidth, 58, 10);
        ctx.fill();
        ctx.strokeStyle = '#bfdbfe';
        ctx.lineWidth = 1.5;
        this.roundRect(ctx, pillX, drawY, pillWidth, 58, 10);
        ctx.stroke();

        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(this.truncateText(ctx, bf.label.toUpperCase(), pillWidth - 24), pillX + 14, drawY + 23);

        ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(this.truncateText(ctx, itemName, pillWidth - 24), pillX + 14, drawY + 46);
      });

      drawY += 76;
    }

    // 6. Side-by-Side Comparison Full Table (All criteria points rendered)
    if (rowLayouts.length > 0 && itemCount > 0) {
      // Table Header Row: Deep Navy with Royal Blue Accent
      const headerY = drawY;
      const headerGrad = ctx.createLinearGradient(tableX, headerY, tableX + tableWidth, headerY);
      headerGrad.addColorStop(0, '#0f172a');
      headerGrad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = headerGrad;
      this.roundRect(ctx, tableX, headerY, tableWidth, 36, 8);
      ctx.fill();

      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText('FEATURE / CRITERIA', tableX + 16, headerY + 23);

      result.items.slice(0, itemCount).forEach((it, idx) => {
        const colX = tableX + featureColWidth + idx * itemColWidth;
        const isOverallWinner = it.id === result.bestOverall?.itemId;
        ctx.fillStyle = isOverallWinner ? '#38bdf8' : '#ffffff';
        ctx.font = isOverallWinner
          ? 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          : '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(this.truncateText(ctx, (isOverallWinner ? '★ ' : '') + it.displayName, itemColWidth - 16), colX + 10, headerY + 23);
      });

      drawY += 40;

      // All Criteria Rows
      rowLayouts.forEach((row, rIdx) => {
        const rowY = drawY;
        // Alternating crisp white and soft ice-blue rows
        ctx.fillStyle = rIdx % 2 === 0 ? '#ffffff' : '#f4f8fe';
        this.roundRect(ctx, tableX, rowY, tableWidth, row.rowHeight, 4);
        ctx.fill();

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        this.roundRect(ctx, tableX, rowY, tableWidth, row.rowHeight, 4);
        ctx.stroke();

        // Feature Name
        const isKeySpec = row.crit.importance === 'high';
        ctx.textAlign = 'left';
        ctx.fillStyle = isKeySpec ? '#0f172a' : '#1e293b';
        ctx.font = isKeySpec
          ? 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          : '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

        if (row.nameLines.length === 1) {
          ctx.fillText(row.nameLines[0], tableX + 16, rowY + (row.rowHeight / 2) + 4);
          if (isKeySpec) {
            const nameWidth = ctx.measureText(row.nameLines[0]).width;
            if (nameWidth + 76 < featureColWidth) {
              const pillX = tableX + 16 + nameWidth + 8;
              const pillY = rowY + (row.rowHeight / 2) - 8;
              ctx.fillStyle = 'rgba(37, 99, 235, 0.10)';
              this.roundRect(ctx, pillX, pillY, 58, 16, 4);
              ctx.fill();
              ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
              ctx.fillStyle = '#2563eb';
              ctx.fillText('KEY SPEC', pillX + 6, pillY + 12);
            }
          }
        } else {
          ctx.fillText(row.nameLines[0], tableX + 16, rowY + 16);
          ctx.fillText(row.nameLines[1], tableX + 16, rowY + 32);
        }

        // Feature Values
        row.values.forEach((val, cIdx) => {
          const colX = tableX + featureColWidth + cIdx * itemColWidth;

          if (val.isWinner) {
            // Subtle emerald highlight background pill
            ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
            this.roundRect(ctx, colX + 4, rowY + 3, itemColWidth - 8, row.rowHeight - 6, 6);
            ctx.fill();

            ctx.fillStyle = '#047857'; // Deep emerald green
            ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          } else if (val.isNotStated) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'italic 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          } else {
            ctx.fillStyle = '#1e293b'; // High-contrast dark slate
            ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          }

          if (val.lines.length === 1) {
            ctx.fillText(val.lines[0], colX + 10, rowY + (row.rowHeight / 2) + 4);
          } else {
            ctx.fillText(val.lines[0], colX + 10, rowY + 16);
            ctx.fillText(val.lines[1], colX + 10, rowY + 32);
          }
        });

        drawY += row.rowHeight + 2;
      });
    }

    // 7. Footer Watermark Bar
    const footerY = height - 44;
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(50, footerY - 14);
    ctx.lineTo(width - 50, footerY - 14);
    ctx.stroke();

    ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.fillText('Generated with Compare Anything • Evidence-based AI comparison with zero hallucinations', 50, footerY + 6);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('compare-anything.org', width - 50, footerY + 6);

    return canvas;
  }

  /**
   * Wraps text into lines with a maximum line limit, truncating the final line if necessary
   */
  private static wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxLines: number = 2
  ): string[] {
    if (!text) return ['Not stated'];
    const trimmed = text.trim();
    if (!trimmed) return ['Not stated'];

    if (ctx.measureText(trimmed).width <= maxWidth) {
      return [trimmed];
    }

    const words = trimmed.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;

      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;

        if (lines.length >= maxLines - 1) {
          const remainingWords = words.slice(i).join(' ');
          lines.push(this.truncateText(ctx, remainingWords, maxWidth));
          return lines;
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Truncates text with ellipsis if exceeding maxWidth
   */
  private static truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    if (ctx.measureText(text).width <= maxWidth) {
      return text;
    }
    let truncated = text;
    while (truncated.length > 1 && ctx.measureText(truncated + '...').width > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
  }

  /**
   * Utility to draw rounded rectangles
   */
  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /**
   * Triggers a browser download of the generated comparison PNG
   */
  static async downloadPng(result: ComparisonResult, customName?: string): Promise<void> {
    const canvas = this.generateCanvas(result);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const slug = (result.comparisonTitle || 'comparison')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .slice(0, 35);
        a.href = url;
        a.download = customName || `compare-anything-${slug}-${new Date().toISOString().slice(0, 10)}.png`;
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    });
  }

  /**
   * Copies the generated comparison image directly to clipboard
   */
  static async copyImageToClipboard(result: ComparisonResult): Promise<boolean> {
    const canvas = this.generateCanvas(result);
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return resolve(false);
        try {
          if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            resolve(true);
          } else {
            resolve(false);
          }
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  }

  /**
   * Formats social share intent links for Facebook, LinkedIn, X, WhatsApp, Reddit
   */
  static getSocialShareLinks(result: ComparisonResult) {
    const title = result.comparisonTitle || 'Webpage Comparison';
    const winner = result.bestOverall?.itemId
      ? result.items.find((i) => i.id === result.bestOverall?.itemId)?.displayName
      : null;

    const shareText = winner
      ? `I compared ${title} using Compare Anything! Winner: ${winner}. Stop switching tabs, compare them.`
      : `I compared ${title} side-by-side using Compare Anything! Check out the results.`;

    const shareUrl = 'https://github.com/akashkumarkundu/comparing-site';

    return {
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
    };
  }
}
