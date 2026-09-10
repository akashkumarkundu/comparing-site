import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import './results.css';

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

  useEffect(() => {
    runComparison(false);
  }, []);

  const runComparison = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      setDetectStatus(null);
      setLoadingStep('Retrieving selected pages from local storage...');

      const state = await StorageService.getState();
      setPages(state.pages);
      setUserGoal(state.userGoal);
      setBackendUrl(state.apiBaseUrl || DEFAULT_API_BASE_URL);
      setCustomUrlInput(state.apiBaseUrl || DEFAULT_API_BASE_URL);

      if (state.pages.length < StorageService.MIN_PAGES) {
        setError(
          `At least ${StorageService.MIN_PAGES} pages are required to generate a comparison. Please open tabs and add pages using the Compare Anything extension.`
        );
        setLoading(false);
        return;
      }

      // If already cached and not forced refresh, load cached result
      if (!forceRefresh && state.cachedResult) {
        setResult(state.cachedResult);
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
      await StorageService.setCachedResult(response);
    } catch (err: any) {
      console.error('Comparison error:', err);
      setError(err.message || 'Failed to generate comparison. Please check that the backend server is running.');
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

  if (error || !result) {
    return (
      <div className="results-page">
        <div className="state-container">
          <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
          <h2 className="state-title">Comparison Unavailable</h2>
          <p className="state-desc">{error || 'Unknown error occurred.'}</p>

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

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            <button
              className="btn btn-primary"
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

        {result.missingInformation.length > 0 && (
          <div className="info-box">
            <h3>
              <HelpCircle size={16} color="#f59e0b" />
              Missing Information (Not Stated on Source)
            </h3>
            <ul className="bullet-list">
              {result.missingInformation.map((m, idx) => {
                const item = result.items.find((it) => it.id === m.itemId);
                return (
                  <li key={idx} style={{ flexDirection: 'column', gap: 4 }}>
                    <strong style={{ color: '#e2e8f0' }}>{item ? item.displayName : m.itemId}:</strong>
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
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Verified Web Sources</h3>
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
    </div>
  );
};
