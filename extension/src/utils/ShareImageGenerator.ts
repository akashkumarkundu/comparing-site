import type { ComparisonResult } from '../models/types';

export class ShareImageGenerator {
  /**
   * Generates a sleek, high-resolution 1200x800 HTML Canvas representation of the comparison
   */
  static generateCanvas(result: ComparisonResult): HTMLCanvasElement {
    const width = 1200;
    const height = 800;
    const scale = 2; // High-DPI retina sharpness

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context is unavailable');
    }

    ctx.scale(scale, scale);

    // 1. Background Gradient (Dark Modern Theme)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.5, '#0d1527');
    bgGrad.addColorStop(1, '#070a12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle background glowing circles
    const radGrad1 = ctx.createRadialGradient(width - 150, 120, 10, width - 150, 120, 300);
    radGrad1.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
    radGrad1.addColorStop(1, 'transparent');
    ctx.fillStyle = radGrad1;
    ctx.fillRect(0, 0, width, height);

    const radGrad2 = ctx.createRadialGradient(150, height - 120, 10, 150, height - 120, 260);
    radGrad2.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
    radGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = radGrad2;
    ctx.fillRect(0, 0, width, height);

    // Card outer border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    this.roundRect(ctx, 24, 24, width - 48, height - 48, 16);
    ctx.stroke();

    // 2. Top Header Bar
    // Logo Icon Badge
    const logoGrad = ctx.createLinearGradient(50, 50, 94, 94);
    logoGrad.addColorStop(0, '#3b82f6');
    logoGrad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = logoGrad;
    this.roundRect(ctx, 50, 50, 44, 44, 10);
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
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('COMPARE ANYTHING', 106, 68);

    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Stop switching between tabs. Compare them.', 106, 88);

    // Category Tag (Top Right)
    const categoryText = (result.comparisonType || 'Comparison').toUpperCase();
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const catWidth = ctx.measureText(categoryText).width + 24;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    this.roundRect(ctx, width - 50 - catWidth, 56, catWidth, 28, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, width - 50 - catWidth, 56, catWidth, 28, 14);
    ctx.stroke();

    ctx.fillStyle = '#60a5fa';
    ctx.textAlign = 'center';
    ctx.fillText(categoryText, width - 50 - catWidth / 2, 74);

    // Divider
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(50, 114);
    ctx.lineTo(width - 50, 114);
    ctx.stroke();

    // 3. Comparison Title & Priority
    ctx.textAlign = 'left';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';

    const title = result.comparisonTitle || 'Side-by-Side Comparison';
    const truncatedTitle = this.truncateText(ctx, title, width - 100);
    ctx.fillText(truncatedTitle, 50, 154);

    let currentY = 176;
    if (result.goal) {
      const goalText = `User Priority: ${result.goal}`;
      ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const goalWidth = ctx.measureText(goalText).width + 24;

      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
      this.roundRect(ctx, 50, currentY, Math.min(goalWidth, width - 100), 26, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 1;
      this.roundRect(ctx, 50, currentY, Math.min(goalWidth, width - 100), 26, 6);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.fillText(this.truncateText(ctx, goalText, width - 120), 62, currentY + 17);
      currentY += 40;
    } else {
      currentY += 12;
    }

    // 4. Best Overall Verdict Banner (Highlighted Card)
    const bestItem = result.items.find((it) => it.id === result.bestOverall?.itemId);
    const bestWinnerName = bestItem ? bestItem.displayName : (result.bestOverall?.itemId ? 'Declared Winner' : 'No Clear Winner');
    const bestReason = result.bestOverall?.reason || 'The provided pages do not contain enough decisive evidence.';

    const verdictHeight = 88;
    const verdictGrad = ctx.createLinearGradient(50, currentY, width - 50, currentY + verdictHeight);
    verdictGrad.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
    verdictGrad.addColorStop(1, 'rgba(6, 78, 59, 0.20)');
    ctx.fillStyle = verdictGrad;
    this.roundRect(ctx, 50, currentY, width - 100, verdictHeight, 12);
    ctx.fill();

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, 50, currentY, width - 100, verdictHeight, 12);
    ctx.stroke();

    // Trophy Icon / Tag
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText('★ BEST OVERALL RECOMMENDATION', 70, currentY + 28);

    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.truncateText(ctx, bestWinnerName, width - 140), 70, currentY + 52);

    ctx.font = '400 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(this.truncateText(ctx, bestReason, width - 140), 70, currentY + 74);

    currentY += verdictHeight + 24;

    // 5. Best For Quick Highlights (Pills grid)
    if (result.bestFor && result.bestFor.length > 0) {
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('KEY HIGHLIGHTS & BEST-FOR AWARDS:', 50, currentY + 6);
      currentY += 18;

      const highlights = result.bestFor.slice(0, 3);
      const pillWidth = (width - 100 - (highlights.length - 1) * 16) / highlights.length;

      highlights.forEach((bf, idx) => {
        const item = result.items.find((it) => it.id === bf.itemId);
        const itemName = item ? item.displayName : 'Item';
        const pillX = 50 + idx * (pillWidth + 16);

        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        this.roundRect(ctx, pillX, currentY, pillWidth, 56, 8);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        this.roundRect(ctx, pillX, currentY, pillWidth, 56, 8);
        ctx.stroke();

        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#60a5fa';
        ctx.fillText(this.truncateText(ctx, bf.label.toUpperCase(), pillWidth - 24), pillX + 12, currentY + 22);

        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#f1f5f9';
        ctx.fillText(this.truncateText(ctx, itemName, pillWidth - 24), pillX + 12, currentY + 44);
      });

      currentY += 76;
    }

    // 6. Side-by-Side Comparison Mini Table (Top 4 Criteria)
    const itemCount = Math.min(result.items.length, 4);
    const topCriteria = result.criteria.slice(0, 4);

    if (topCriteria.length > 0 && itemCount > 0) {
      const tableX = 50;
      const tableWidth = width - 100;
      const featureColWidth = 200;
      const itemColWidth = (tableWidth - featureColWidth) / itemCount;

      // Table Header Row
      const headerY = currentY;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      this.roundRect(ctx, tableX, headerY, tableWidth, 34, 6);
      ctx.fill();

      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('FEATURE / CRITERIA', tableX + 14, headerY + 22);

      result.items.slice(0, itemCount).forEach((it, idx) => {
        const colX = tableX + featureColWidth + idx * itemColWidth;
        const isOverallWinner = it.id === result.bestOverall?.itemId;
        ctx.fillStyle = isOverallWinner ? '#34d399' : '#e2e8f0';
        ctx.font = isOverallWinner ? 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(this.truncateText(ctx, (isOverallWinner ? '★ ' : '') + it.displayName, itemColWidth - 16), colX + 8, headerY + 22);
      });

      currentY += 38;

      // Criteria Rows
      topCriteria.forEach((crit, rIdx) => {
        const rowY = currentY + rIdx * 30;
        ctx.fillStyle = rIdx % 2 === 0 ? 'rgba(15, 23, 42, 0.6)' : 'rgba(30, 41, 59, 0.3)';
        ctx.fillRect(tableX, rowY, tableWidth, 28);

        ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(this.truncateText(ctx, crit.name, featureColWidth - 20), tableX + 14, rowY + 18);

        result.items.slice(0, itemCount).forEach((it, cIdx) => {
          const colX = tableX + featureColWidth + cIdx * itemColWidth;
          const valObj = crit.values.find((v) => v.itemId === it.id);
          const isWinner = crit.winnerItemIds.includes(it.id);
          const valText = valObj?.value || 'Not stated';

          if (isWinner) {
            ctx.fillStyle = '#34d399';
            ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          } else {
            ctx.fillStyle = valText === 'Not stated' ? '#64748b' : '#f8fafc';
            ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          }

          ctx.fillText(this.truncateText(ctx, valText, itemColWidth - 16), colX + 8, rowY + 18);
        });
      });
    }

    // 7. Footer Watermark Bar
    const footerY = height - 48;
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(50, footerY - 14);
    ctx.lineTo(width - 50, footerY - 14);
    ctx.stroke();

    ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Generated with Compare Anything • Evidence-based AI comparison with zero hallucinations', 50, footerY + 6);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('compare-anything.org', width - 50, footerY + 6);

    return canvas;
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
