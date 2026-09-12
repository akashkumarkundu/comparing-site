import React, { useEffect, useState, useMemo } from 'react';
import type { ComparisonResult, PageSnapshot } from '../models/types';
import { StorageService, DEFAULT_API_BASE_URL } from '../storage/StorageService';
import { BackendService } from '../services/BackendService';
import {
  Trophy,
  Copy,
  Check,
  Download,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  HelpCircle,
  Share2,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { ShareImageGenerator } from '../utils/ShareImageGenerator';
import { OfflineComparisonService } from '../services/OfflineComparisonService';
import './results.css';

const SAMPLE_DEMO_RESULT: ComparisonResult = {
  comparisonTitle: 'ASUS Vivobook 15 vs Lenovo IdeaPad 5',
  comparisonType: 'Laptop',
  goal: 'Best laptop for programming under Tk 80,000',
  items: [
    {
      id: 'demo-p1',
      displayName: 'ASUS Vivobook 15',
      shortDescription: 'Reliable 15.6" everyday workhorse laptop with Core i5 and 16GB RAM.',
    },
    {
      id: 'demo-p2',
      displayName: 'Lenovo IdeaPad 5',
      shortDescription: 'High-performance 8-core Ryzen 7 lightweight laptop for programming and multitasking.',
    },
  ],
  criteria: [
    {
      name: 'Price',
      importance: 'high',
      values: [
        { itemId: 'demo-p1', value: 'Tk 74,500', confidence: 'high' },
        { itemId: 'demo-p2', value: 'Tk 78,000', confidence: 'high' },
      ],
      winnerItemIds: ['demo-p1'],
    },
    {
      name: 'Processor / CPU',
      importance: 'high',
      values: [
        { itemId: 'demo-p1', value: 'Intel Core i5-1335U (10 Cores, up to 4.6 GHz)', confidence: 'high' },
        { itemId: 'demo-p2', value: 'AMD Ryzen 7 7730U (8 Cores, 16 Threads, up to 4.5 GHz)', confidence: 'high' },
      ],
      winnerItemIds: ['demo-p2'],
    },
    {
      name: 'RAM / Memory',
      importance: 'high',
      values: [
        { itemId: 'demo-p1', value: '16 GB DDR4', confidence: 'high' },
        { itemId: 'demo-p2', value: '16 GB DDR4', confidence: 'high' },
      ],
      winnerItemIds: [],
    },
    {
      name: 'Storage / SSD',
      importance: 'high',
      values: [
        { itemId: 'demo-p1', value: '512 GB NVMe M.2 SSD', confidence: 'high' },
        { itemId: 'demo-p2', value: '512 GB NVMe M.2 SSD', confidence: 'high' },
      ],
      winnerItemIds: [],
    },
    {
      name: 'Display / Screen',
      importance: 'medium',
      values: [
        { itemId: 'demo-p1', value: '15.6" Full HD (1920x1080) Anti-glare', confidence: 'high' },
        { itemId: 'demo-p2', value: '15.6" Full HD IPS (1920x1080) 300 nits', confidence: 'high' },
      ],
      winnerItemIds: ['demo-p2'],
    },
    {
      name: 'Weight (kg)',
      importance: 'medium',
      values: [
        { itemId: 'demo-p1', value: 'Not stated', confidence: 'high' },
        { itemId: 'demo-p2', value: '1.63 kg', confidence: 'high' },
      ],
      winnerItemIds: ['demo-p2'],
    },
    {
      name: 'Battery / Charging',
      importance: 'medium',
      values: [
        { itemId: 'demo-p1', value: '42 Wh (45W Fast Charging)', confidence: 'high' },
        { itemId: 'demo-p2', value: '57 Wh (65W USB-C Charging)', confidence: 'high' },
      ],
      winnerItemIds: ['demo-p2'],
    },
    {
      name: 'Warranty',
      importance: 'medium',
      values: [
        { itemId: 'demo-p1', value: '2 years international', confidence: 'high' },
        { itemId: 'demo-p2', value: '2 years official', confidence: 'high' },
      ],
      winnerItemIds: [],
    },
  ],
  bestOverall: {
    itemId: 'demo-p2',
    reason: 'Offers the strongest 8-core/16-thread multi-core processor (Ryzen 7 7730U), larger 57Wh battery, and verified lightweight 1.63 kg chassis while staying within your stated Tk 80,000 budget.',
  },
  bestFor: [
    {
      label: 'Highest Performance / Programming',
      itemId: 'demo-p2',
      reason: 'Ryzen 7 7730U delivers superior multi-threaded code compilation and IDE responsiveness compared to the Core i5.',
    },
    {
      label: 'Lowest Price',
      itemId: 'demo-p1',
      reason: 'Lowest listed price at Tk 74,500, saving Tk 3,500 while matching the 16GB RAM and 512GB SSD capacity.',
    },
  ],
  keyDifferences: [
    'Lenovo IdeaPad 5 features an 8-core, 16-thread Ryzen 7 processor with higher multi-threaded performance than the 10-core Core i5.',
    'Lenovo provides a larger 57Wh battery with faster 65W USB-C charging compared to ASUS 42Wh.',
    'ASUS Vivobook 15 is Tk 3,500 more affordable with identical 16GB RAM and 512GB SSD storage.',
    'ASUS webpage does not specify the product weight, whereas Lenovo confirms a 1.63 kg lightweight form factor.',
  ],
  missingInformation: [
    {
      itemId: 'demo-p1',
      fields: ['Weight', 'Color gamut'],
    },
  ],
};

const SAMPLE_DEMO_PAGES: PageSnapshot[] = [
  {
    id: 'demo-p1',
    url: 'https://www.startech.com.bd/asus-vivobook-15-x1504va-core-i5-13th-gen-laptop',
    domain: 'startech.com.bd',
    title: 'ASUS Vivobook 15 X1504VA Core i5 13th Gen 16GB RAM Laptop',
    description: 'ASUS Vivobook 15 with Core i5-1335U, 16GB DDR4, 512GB SSD at best price in BD.',
    structuredData: '{"name": "ASUS Vivobook 15", "price": "74500 BDT"}',
    importantText: 'Price: Tk 74,500, RAM: 16 GB, Storage: 512 GB, Display: 15.6 FHD, Warranty: 2 years.',
    capturedAt: new Date().toISOString(),
  },
  {
    id: 'demo-p2',
    url: 'https://www.ryans.com/lenovo-ideapad-5-15abr8-amd-ryzen-7-7730u-16gb-512gb-laptop',
    domain: 'ryans.com',
    title: 'Lenovo IdeaPad 5 15ABR8 AMD Ryzen 7 7730U 16GB RAM 512GB SSD Laptop',
    description: 'Lenovo IdeaPad 5 with Ryzen 7 7730U, 16GB RAM, 512GB SSD, 1.63 kg weight.',
    structuredData: '{"name": "Lenovo IdeaPad 5", "price": "78000 BDT"}',
    importantText: 'Price: Tk 78,000, Processor: Ryzen 7 7730U, RAM: 16 GB, Weight: 1.63 kg, Battery: 57 Wh.',
    capturedAt: new Date().toISOString(),
  },
];

export const ResultsApp: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<string>('Preparing comparison...');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [pages, setPages] = useState<PageSnapshot[]>([]);
  const [userGoal, setUserGoal] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [backendUrl, setBackendUrl] = useState<string>('');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [detecting, setDetecting] = useState<boolean>(false);
  const [detectStatus, setDetectStatus] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<boolean>(false);
  const [newGoalInput, setNewGoalInput] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [imageCopied, setImageCopied] = useState<boolean>(false);
  const [downloadingImg, setDownloadingImg] = useState<boolean>(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const sanitizedMissingInformation = useMemo(() => {
    if (!result || !result.missingInformation) return [];
    return result.missingInformation
      .map((m) => {
        const activeFields = (m.fields || []).filter((fieldName) => {
          const normField = fieldName
            .replace(/\s*\([^)]*\)/g, '')
            .replace(/[^a-zA-Z0-9]/g, '')
            .toLowerCase();
          if (!normField) return true;

          // Check if any criterion for this item has a known, non-"Not stated" value
          const isStated = (result.criteria || []).some((c) => {
            const normCrit = c.name
              .replace(/\s*\([^)]*\)/g, '')
              .replace(/[^a-zA-Z0-9]/g, '')
              .toLowerCase();
            const isMatch =
              normCrit === normField ||
              normCrit.includes(normField) ||
              normField.includes(normCrit);
            if (!isMatch) return false;

            const valObj = (c.values || []).find((v) => v.itemId === m.itemId);
            if (!valObj || !valObj.value) return false;
            const val = valObj.value.trim().toLowerCase();
            return (
              val !== '' &&
              val !== 'not stated' &&
              val !== 'n/a' &&
              val !== 'none' &&
              val !== 'undefined' &&
              val !== 'null'
            );
          });

          return !isStated;
        });

        return {
          ...m,
          fields: activeFields,
        };
      })
      .filter((m) => m.fields.length > 0);
  }, [result]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === '1') {
      loadDemoData();
    } else {
      runComparison(false);
    }
  }, []);

  const loadDemoData = () => {
    setIsDemoMode(true);
    setResult(SAMPLE_DEMO_RESULT);
    setPages(SAMPLE_DEMO_PAGES);
    setUserGoal(SAMPLE_DEMO_RESULT.goal || '');
    setLoading(false);
    setError(null);
  };

  const runComparison = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      setDetectStatus(null);
      setLoadingStep('Retrieving selected pages from local storage...');

      const state = await StorageService.getState();
      const savedResult = state.cachedResult || state.lastResult;
      setPages(state.pages);
      setUserGoal(state.userGoal);
      setBackendUrl(state.apiBaseUrl || DEFAULT_API_BASE_URL);
      setCustomUrlInput(state.apiBaseUrl || DEFAULT_API_BASE_URL);

      // If already cached/saved and not forced refresh, load cached result immediately
      if (!forceRefresh && savedResult) {
        setResult(savedResult);
        setLoading(false);
        return;
      }

      if (state.pages.length < StorageService.MIN_PAGES) {
        if (savedResult) {
          setResult(savedResult);
          setLoading(false);
          return;
        }
        setError(
          `At least ${StorageService.MIN_PAGES} pages are required to generate a comparison. Please open tabs and add pages using the Compare Anything extension.`
        );
        setLoading(false);
        return;
      }

      setLoadingStep('Sending page snapshots to AI comparison engine...');
      const response = await BackendService.compare({
        installId: state.installId,
        goal: state.userGoal,
        pages: state.pages,
      });

      setResult(response);
      setOfflineNotice(null);
      await StorageService.setCachedResult(response);
    } catch (err: any) {
      console.error('Comparison error:', err);
      // If we have a saved or cached result, fall back to it so the table is never lost!
      const state = await StorageService.getState().catch(() => null);
      const fallbackResult = result || state?.cachedResult || state?.lastResult;
      if (fallbackResult) {
        setResult(fallbackResult);
        setOfflineNotice(
          `Backend server is offline (${backendUrl || DEFAULT_API_BASE_URL}). Showing your saved comparison table.`
        );
        setError(null);
      } else if (state && state.pages.length >= StorageService.MIN_PAGES) {
        try {
          const offlineComparison = OfflineComparisonService.generate(state.pages, state.userGoal);
          setResult(offlineComparison);
          await StorageService.setCachedResult(offlineComparison);
          setOfflineNotice(
            `Standalone Browser Engine: Live backend is offline on this device (${backendUrl || DEFAULT_API_BASE_URL}). Generated comparison locally from extracted page content.`
          );
          setError(null);
        } catch (offlineErr: any) {
          setError(err.message || 'Failed to generate comparison. Please check that the backend server is running.');
        }
      } else {
        setError(err.message || 'Failed to generate comparison. Please check that the backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDetect = async () => {
    try {
      setDetecting(true);
      setDetectStatus('Probing local servers (Laravel Herd, php artisan serve)...');
      const res = await BackendService.autoDetectBackend();
      if (res.success) {
        setBackendUrl(res.url);
        setCustomUrlInput(res.url);
        setDetectStatus(`Connected to live backend at ${res.url}! Retrying...`);
        setTimeout(() => {
          runComparison(true);
        }, 500);
      } else {
        setDetectStatus(res.error || 'Could not find any live backend server.');
      }
    } catch (err: any) {
      setDetectStatus(err.message || 'Auto-detection failed.');
    } finally {
      setDetecting(false);
    }
  };

  const handleSaveCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    const clean = customUrlInput.trim().replace(/\/+$/, '');
    await StorageService.setApiBaseUrl(clean);
    setBackendUrl(clean);
    setShowConfig(false);
    runComparison(true);
  };

  const handleClearGoalAndRecompare = async () => {
    await StorageService.setUserGoal('');
    setUserGoal('');
    if (result) {
      setResult({ ...result, goal: '' });
    }
    runComparison(true);
  };

  const handleUpdateGoalAndRecompare = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newGoalInput.trim();
    await StorageService.setUserGoal(clean);
    setUserGoal(clean);
    setEditingGoal(false);
    runComparison(true);
  };

  const handleOpenShareModal = () => {
    if (!result) return;
    try {
      const canvas = ShareImageGenerator.generateCanvas(result);
      setPreviewDataUrl(canvas.toDataURL('image/png'));
      setShowShareModal(true);
    } catch (err) {
      console.error('Failed to generate share preview image:', err);
    }
  };

  const handleDownloadPng = async () => {
    if (!result) return;
    try {
      setDownloadingImg(true);
      await ShareImageGenerator.downloadPng(result);
    } catch (err) {
      console.error('Failed to download PNG:', err);
    } finally {
      setDownloadingImg(false);
    }
  };

  const handleCopyImage = async () => {
    if (!result) return;
    const success = await ShareImageGenerator.copyImageToClipboard(result);
    if (success) {
      setImageCopied(true);
      setTimeout(() => setImageCopied(false), 2500);
    } else {
      alert('Could not copy image directly to clipboard on this browser. You can click "Download PNG" instead!');
    }
  };

  const handleCopyComparison = async () => {
    if (!result) return;

    const lines: string[] = [];
    lines.push(`# ${result.comparisonTitle}`);
    if (result.goal) {
      lines.push(`**Goal / Priority:** ${result.goal}`);
    }
    lines.push('');

    // Verdict
    const winnerItem = result.items.find((it) => it.id === result.bestOverall.itemId);
    lines.push('## Quick Verdict');
    lines.push(`- **Best Overall:** ${winnerItem ? winnerItem.displayName : 'No clear winner'}`);
    lines.push(`- **Reason:** ${result.bestOverall.reason}`);
    lines.push('');

    // Comparison Table
    lines.push('## Comparison Table');
    const headerCols = ['Feature', ...result.items.map((it) => it.displayName)];
    lines.push(`| ${headerCols.join(' | ')} |`);
    lines.push(`| ${headerCols.map(() => '---').join(' | ')} |`);

    for (const c of result.criteria) {
      const row = [c.name];
      for (const it of result.items) {
        const valObj = c.values.find((v) => v.itemId === it.id);
        const isWinner = c.winnerItemIds.includes(it.id);
        const val = valObj?.value || 'Not stated';
        row.push(isWinner ? `**${val}** (Winner)` : val);
      }
      lines.push(`| ${row.join(' | ')} |`);
    }
    lines.push('');

    // Best for
    if (result.bestFor.length > 0) {
      lines.push('## Best For');
      for (const bf of result.bestFor) {
        const bfItem = result.items.find((it) => it.id === bf.itemId);
        lines.push(`- **${bf.label}:** ${bfItem ? bfItem.displayName : 'N/A'} — ${bf.reason}`);
      }
      lines.push('');
    }

    // Differences
    if (result.keyDifferences.length > 0) {
      lines.push('## Important Differences');
      for (const d of result.keyDifferences) {
        lines.push(`- ${d}`);
      }
      lines.push('');
    }

    // Sources
    lines.push('## Sources');
    for (const p of pages) {
      lines.push(`- [${p.title}](${p.url}) (${p.domain})`);
    }

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Unable to access clipboard. Please allow clipboard permissions.');
    }
  };

  const handleDownloadCSV = () => {
    if (!result) return;

    const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;

    const headers = ['Feature', 'Importance', ...result.items.map((it) => `${it.displayName} (${it.id})`)];
    const rows: string[][] = [headers];

    for (const c of result.criteria) {
      const row: string[] = [c.name, c.importance];
      for (const it of result.items) {
        const valObj = c.values.find((v) => v.itemId === it.id);
        row.push(valObj?.value || 'Not stated');
      }
      rows.push(row);
    }

    const csvContent = rows.map((r) => r.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compare-anything-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartNew = async () => {
    if (confirm('Start a new comparison? This will clear current captured pages.')) {
      await StorageService.clearComparison();
      window.close();
    }
  };

  if (loading) {
    return (
      <div className="results-page">
        <div className="state-container">
          <div className="spinner" />
          <h2 className="state-title">Analyzing & Comparing Webpages</h2>
          <p className="state-desc">{loadingStep}</p>
          <div className="goal-banner" style={{ marginTop: 12 }}>
            <Sparkles size={14} color="#60a5fa" />
            <span>Using evidence-based AI with zero hallucinations</span>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-page">
        <div className="state-container">
          <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
          <h2 className="state-title">Comparison Unavailable</h2>
          <p className="state-desc">{error || 'No comparison data found. Please make sure the backend server is running and add pages to compare.'}</p>

          <div className="server-status-pill">
            <span className="dot dot-offline"></span>
            <span>Target Backend: <code>{backendUrl || 'http://comparing-site.test'}</code></span>
          </div>

          {detectStatus && (
            <div className={`detect-status-alert ${detectStatus.includes('Connected') ? 'success' : 'warning'}`}>
              <Info size={14} />
              <span>{detectStatus}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
            <button
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', border: 'none', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}
              onClick={loadDemoData}
            >
              <Sparkles size={14} />
              <span>View Sample 2-Page Comparison (Demo Mode)</span>
            </button>
            <button
              className="btn"
              onClick={handleAutoDetect}
              disabled={detecting}
            >
              <RotateCcw size={14} className={detecting ? 'spin' : ''} />
              {detecting ? 'Detecting Server...' : 'Auto-Detect & Connect'}
            </button>
            <button className="btn" onClick={() => runComparison(true)} disabled={detecting}>
              Retry Comparison
            </button>
            <button
              className="btn"
              onClick={() => setShowConfig(!showConfig)}
            >
              {showConfig ? 'Hide Settings' : 'Change URL'}
            </button>
            <button className="btn" onClick={() => window.close()}>
              Close Tab
            </button>
          </div>

          {showConfig && (
            <form onSubmit={handleSaveCustomUrl} className="server-config-form">
              <input
                type="text"
                className="server-input"
                placeholder="e.g. http://comparing-site.test or http://127.0.0.1:8000"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Save & Connect
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const winnerItem = result.items.find((it) => it.id === result.bestOverall.itemId);

  return (
    <div className="results-page">
      {isDemoMode && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.15), rgba(124, 58, 237, 0.15))',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: 'var(--text-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#818cf8" />
            <span>
              <strong>Sample 2-Page Comparison (Demo Mode):</strong> Comparing ASUS Vivobook 15 (Star Tech) vs Lenovo IdeaPad 5 (Ryans). All buttons, CSV export, and image sharing are fully interactive.
            </span>
          </div>
          <button
            className="btn"
            style={{ padding: '3px 10px', fontSize: '11px', whiteSpace: 'nowrap' }}
            onClick={() => {
              setIsDemoMode(false);
              runComparison(true);
            }}
          >
            Connect Live Backend
          </button>
        </div>
      )}

      {offlineNotice && !isDemoMode && (
        <div className="offline-notice-banner">
          <div className="offline-notice-content">
            <AlertTriangle size={18} color="#d97706" />
            <span>{offlineNotice}</span>
          </div>
          <div className="offline-notice-actions">
            <button className="btn-outline-warning btn-sm" onClick={handleAutoDetect} disabled={detecting}>
              <RotateCcw size={12} className={detecting ? 'spin' : ''} />
              {detecting ? 'Detecting...' : 'Reconnect Server'}
            </button>
            <button className="offline-notice-close" onClick={() => setOfflineNotice(null)} title="Dismiss">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="results-header">
        <div className="header-top-row">
          <div className="brand-wrapper">
            <div className="brand-logo-badge">CA</div>
            <div className="brand-info">
              <h1>Compare Anything</h1>
              <p>AI-Powered Side-by-Side Webpage Analysis</p>
            </div>
          </div>

          <div className="header-actions">
            <button
              className={`btn ${copied ? 'btn-success' : ''}`}
              onClick={handleCopyComparison}
              title="Copy comparison report to clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Comparison'}</span>
            </button>

            <button className="btn" onClick={handleDownloadCSV} title="Download spreadsheet CSV">
              <Download size={14} />
              <span>Download CSV</span>
            </button>

            <button
              className="btn btn-primary"
              onClick={handleOpenShareModal}
              title="Download clean shareable PNG image & post to social media (PDF Section 44)"
            >
              <Share2 size={14} />
              <span>Share as Image</span>
            </button>

            <button className="btn" onClick={() => runComparison(true)} title="Re-run comparison with AI">
              <RotateCcw size={14} />
              <span>Re-compare</span>
            </button>

            <button className="btn" onClick={handleStartNew} title="Start fresh comparison">
              <span>Start New</span>
            </button>
          </div>
        </div>

        {/* Title & Goal */}
        <div className="title-section">
          <div className="comparison-title-row">
            <h2 className="comparison-main-title">{result.comparisonTitle}</h2>
            <span className="category-tag">{result.comparisonType}</span>
          </div>

          {editingGoal ? (
            <form onSubmit={handleUpdateGoalAndRecompare} className="goal-edit-form">
              <input
                type="text"
                className="goal-edit-input"
                placeholder="e.g. Budget friendly, More live classes, Best faculty"
                value={newGoalInput}
                onChange={(e) => setNewGoalInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '3px 10px', fontSize: '11px' }}>
                Save & Re-compare
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setEditingGoal(false)}
                style={{ padding: '3px 10px', fontSize: '11px' }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="goal-banner">
              <strong>Your Priority:</strong>
              <span>{result.goal || userGoal || 'General comparison'}</span>
              {(result.goal || userGoal) && (
                <button
                  className="goal-action-btn"
                  onClick={handleClearGoalAndRecompare}
                  title="Remove this priority and re-compare objectively"
                >
                  ✕ Clear Priority
                </button>
              )}
              <button
                className="goal-edit-btn"
                onClick={() => {
                  setNewGoalInput(result.goal || userGoal || '');
                  setEditingGoal(true);
                }}
                title="Change or customize your comparison priority"
              >
                ✎ Change Priority
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Quick Verdict Banner */}
      <section className="verdict-card">
        <div className="verdict-icon">
          <Trophy size={24} />
        </div>
        <div className="verdict-content">
          <h2>Quick Verdict</h2>
          <div className="verdict-winner-title">
            {winnerItem ? (
              <>Best Overall: {winnerItem.displayName}</>
            ) : (
              <>Best Overall: No Clear Winner</>
            )}
          </div>
          <p className="verdict-reason">{result.bestOverall.reason}</p>
        </div>
      </section>

      {/* Side-by-side Comparison Table */}
      <section>
        <h3 className="section-title">
          <Layers size={18} color="#3b82f6" />
          Side-by-Side Comparison
        </h3>

        <div className="table-card">
          <div className="table-container">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  {result.items.map((item) => {
                    const sourcePage = pages.find((p) => p.id === item.id);
                    return (
                      <th key={item.id}>
                        <div className="th-item-header">
                          <span className="item-name">{item.displayName}</span>
                          {item.shortDescription && (
                            <span className="item-desc">{item.shortDescription}</span>
                          )}
                          {sourcePage && (
                            <a
                              href={sourcePage.url}
                              target="_blank"
                              rel="noreferrer"
                              className="item-source-link"
                            >
                              <span>{sourcePage.domain}</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {result.criteria.map((criterion, idx) => (
                  <tr key={idx}>
                    <td className="feature-name-cell">
                      <span>{criterion.name}</span>
                      {criterion.importance === 'high' && (
                        <span className="feature-importance">Key Spec</span>
                      )}
                    </td>
                    {result.items.map((item) => {
                      const valObj = criterion.values.find((v) => v.itemId === item.id);
                      const isWinner = criterion.winnerItemIds.includes(item.id);
                      const value = valObj?.value || 'Not stated';
                      const isNotStated = value.toLowerCase() === 'not stated';

                      return (
                        <td
                          key={item.id}
                          className={`value-cell ${isWinner ? 'is-winner' : ''}`}
                        >
                          {isNotStated ? (
                            <span className="not-stated-badge">Not stated</span>
                          ) : (
                            <span>{value}</span>
                          )}
                          {isWinner && (
                            <span className="winner-indicator">
                              <Check size={10} /> Best
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Best For Section */}
      {result.bestFor.length > 0 && (
        <section>
          <h3 className="section-title">
            <Sparkles size={18} color="#10b981" />
            Best For Specific Needs
          </h3>
          <div className="grid-2col">
            {result.bestFor.map((bf, idx) => {
              const item = result.items.find((it) => it.id === bf.itemId);
              return (
                <div key={idx} className="best-for-card">
                  <span className="best-for-label">{bf.label}</span>
                  <div className="best-for-item">{item ? item.displayName : 'General'}</div>
                  <p className="best-for-reason">{bf.reason}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Important Differences & Missing Information */}
      <div className="info-section-grid">
        {result.keyDifferences.length > 0 && (
          <div className="info-box">
            <h3>
              <Info size={16} color="#3b82f6" />
              Important Differences
            </h3>
            <ul className="bullet-list">
              {result.keyDifferences.map((diff, idx) => (
                <li key={idx}>
                  <span className="bullet-dot">•</span>
                  <span>{diff}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {sanitizedMissingInformation.length > 0 && (
          <div className="info-box">
            <h3>
              <HelpCircle size={16} color="#f59e0b" />
              Missing Information (Not Stated on Source)
            </h3>
            <ul className="bullet-list">
              {sanitizedMissingInformation.map((m, idx) => {
                const item = result.items.find((it) => it.id === m.itemId);
                return (
                  <li key={idx} style={{ flexDirection: 'column', gap: 4 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{item ? item.displayName : m.itemId}:</strong>
                    <div className="missing-tag-group">
                      {m.fields.map((f, fIdx) => (
                        <span key={fIdx} className="missing-tag">
                          {f}
                        </span>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Source Links */}
      <section className="sources-card">
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Verified Web Sources</h3>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          This comparison was generated strictly using facts extracted from these webpages:
        </p>
        <div className="sources-list">
          {pages.map((p) => (
            <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="source-pill">
              <span>{p.title}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({p.domain})</span>
              <ExternalLink size={12} />
            </a>
          ))}
        </div>
      </section>

      {/* Share Comparison PNG Modal (PDF Section 44) */}
      {showShareModal && result && (
        <div className="share-modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="share-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <div className="share-modal-title-group">
                <ImageIcon size={18} color="#3b82f6" />
                <h3 className="share-modal-title">Share Comparison Card (PNG)</h3>
              </div>
              <button
                className="share-modal-close-btn"
                onClick={() => setShowShareModal(false)}
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="share-modal-body">
              {previewDataUrl && (
                <div className="share-preview-box">
                  <img
                    src={previewDataUrl}
                    alt="Comparison Card Preview"
                    className="share-preview-img"
                  />
                </div>
              )}

              <div className="share-actions-row">
                <div className="share-buttons-primary">
                  <button
                    className="btn btn-primary"
                    onClick={handleDownloadPng}
                    disabled={downloadingImg}
                  >
                    <Download size={14} />
                    <span>{downloadingImg ? 'Generating...' : 'Download PNG'}</span>
                  </button>

                  <button
                    className={`btn ${imageCopied ? 'btn-success' : ''}`}
                    onClick={handleCopyImage}
                  >
                    {imageCopied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{imageCopied ? 'Image Copied!' : 'Copy Image'}</span>
                  </button>
                </div>

                {/* Social Share Intent Links (Facebook, LinkedIn, X, WhatsApp, Reddit) */}
                <div className="social-share-group">
                  <span className="social-share-label">Post to:</span>
                  {(() => {
                    const links = ShareImageGenerator.getSocialShareLinks(result);
                    return (
                      <>
                        <a
                          href={links.x}
                          target="_blank"
                          rel="noreferrer"
                          className="social-btn btn-x"
                          title="Share on X (Twitter)"
                        >
                          X
                        </a>
                        <a
                          href={links.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="social-btn btn-linkedin"
                          title="Share on LinkedIn"
                        >
                          LinkedIn
                        </a>
                        <a
                          href={links.facebook}
                          target="_blank"
                          rel="noreferrer"
                          className="social-btn btn-facebook"
                          title="Share on Facebook"
                        >
                          Facebook
                        </a>
                        <a
                          href={links.whatsapp}
                          target="_blank"
                          rel="noreferrer"
                          className="social-btn btn-whatsapp"
                          title="Share on WhatsApp"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={links.reddit}
                          target="_blank"
                          rel="noreferrer"
                          className="social-btn btn-reddit"
                          title="Share on Reddit"
                        >
                          Reddit
                        </a>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
