import React, { useEffect, useState } from 'react';
import { PageSnapshot } from '../models/types';
import { StorageService, DEFAULT_API_BASE_URL } from '../storage/StorageService';
import { BackendService } from '../services/BackendService';
import { captureCurrentTab } from '../extractors/PageExtractor';
import { ExternalLink, Trash2, Plus, Check, Layers, AlertCircle, Sparkles, RotateCcw } from 'lucide-react';

interface CurrentTabInfo {
  title: string;
  url: string;
  domain: string;
  isRestricted: boolean;
}

export const App: React.FC = () => {
  const [pages, setPages] = useState<PageSnapshot[]>([]);
  const [userGoal, setUserGoal] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<CurrentTabInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [backendUrl, setBackendUrl] = useState<string>('');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [detecting, setDetecting] = useState<boolean>(false);

  // Load storage state and active tab on mount
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const state = await StorageService.getState();
        setPages(state.pages);
        setUserGoal(state.userGoal);
        const activeUrl = state.apiBaseUrl || DEFAULT_API_BASE_URL;
        setBackendUrl(activeUrl);
        setCustomUrlInput(activeUrl);

        // Probe backend health asynchronously
        BackendService.checkHealth(activeUrl).then(async (alive) => {
          if (alive) {
            setServerOnline(true);
          } else {
            const det = await BackendService.autoDetectBackend();
            if (det.success) {
              setServerOnline(true);
              setBackendUrl(det.url);
              setCustomUrlInput(det.url);
            } else {
              setServerOnline(false);
            }
          }
        });

        // Fetch current active tab info
        if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab) {
            const url = tab.url || '';
            const isRestricted =
              !url ||
              url.startsWith('chrome://') ||
              url.startsWith('chrome-extension://') ||
              url.startsWith('edge://') ||
              url.startsWith('about:');

            let domain = 'unknown';
            try {
              if (!isRestricted && url) {
                domain = new URL(url).hostname.replace(/^www\./, '');
              }
            } catch {
              domain = 'webpage';
            }

            setCurrentTab({
              title: tab.title || 'Active Tab',
              url,
              domain,
              isRestricted,
            });
          }
        } else {
          // Dev preview fallback
          setCurrentTab({
            title: 'ASUS Vivobook 15 Laptop (16GB RAM / 512GB SSD)',
            url: 'https://startech.com.bd/asus-vivobook-15',
            domain: 'startech.com.bd',
            isRestricted: false,
          });
        }
      } catch (err: any) {
        console.error('Failed to initialize popup:', err);
        setErrorMessage(err.message || 'Failed to initialize.');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const isCurrentTabAdded = Boolean(
    currentTab && pages.some((p) => p.url === currentTab.url)
  );

  const canAddMore = pages.length < StorageService.MAX_PAGES;
  const isCompareReady = pages.length >= StorageService.MIN_PAGES;

  // Add current tab
  const handleAddCurrentPage = async () => {
    if (!currentTab || currentTab.isRestricted) {
      setErrorMessage('Cannot add internal browser pages. Please open a public webpage.');
      return;
    }

    if (isCurrentTabAdded) {
      setInfoMessage('This page is already in your comparison.');
      return;
    }

    if (!canAddMore) {
      setErrorMessage(`Maximum ${StorageService.MAX_PAGES} pages allowed.`);
      return;
    }

    try {
      setExtracting(true);
      setErrorMessage(null);
      setInfoMessage(null);

      let snapshot: PageSnapshot;
      if (typeof chrome !== 'undefined' && chrome.scripting) {
        snapshot = await captureCurrentTab();
      } else {
        // Preview fallback
        snapshot = {
          id: `page-${Date.now()}`,
          url: currentTab.url,
          domain: currentTab.domain,
          title: currentTab.title,
          description: 'High performance laptop with Core i5 and 16GB RAM',
          structuredData: '{"@type":"Product","name":"ASUS Vivobook 15","price":"74500"}',
          importantText: '[SPECIFICATIONS]\nPrice: Tk 74,500\nRAM: 16 GB\nStorage: 512 GB SSD',
          capturedAt: new Date().toISOString(),
        };
      }

      const res = await StorageService.addPage(snapshot);
      if (res.success) {
        setPages(res.pages);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "We couldn't extract enough information from this page.");
    } finally {
      setExtracting(false);
    }
  };

  // Remove a page
  const handleRemovePage = async (id: string) => {
    const updated = await StorageService.removePage(id);
    setPages(updated);
    setErrorMessage(null);
  };

  // Clear all pages
  const handleClearComparison = async () => {
    await StorageService.clearComparison();
    setPages([]);
    setUserGoal('');
    setErrorMessage(null);
    setInfoMessage(null);
  };

  // Update user goal
  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserGoal(val);
    StorageService.setUserGoal(val);
  };

  // Compare action
  const handleCompareClick = () => {
    if (!isCompareReady) {
      setErrorMessage('Add at least one more page to compare.');
      return;
    }

    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: chrome.runtime.getURL('results.html') });
    } else {
      window.open('/results.html', '_blank');
    }
  };

  const handleAutoDetectBackend = async () => {
    try {
      setDetecting(true);
      const res = await BackendService.autoDetectBackend();
      if (res.success) {
        setBackendUrl(res.url);
        setCustomUrlInput(res.url);
        setServerOnline(true);
        setInfoMessage(`Connected to live backend at ${res.url}`);
      } else {
        setServerOnline(false);
        setErrorMessage('Could not find any running Laravel backend.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Auto-detection failed.');
    } finally {
      setDetecting(false);
    }
  };

  const handleSaveBackendUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    const clean = customUrlInput.trim().replace(/\/+$/, '');
    await StorageService.setApiBaseUrl(clean);
    setBackendUrl(clean);
    setShowSettings(false);
    const alive = await BackendService.checkHealth(clean);
    setServerOnline(alive);
    if (alive) {
      setInfoMessage(`Connected to ${clean}`);
    } else {
      setErrorMessage(`Cannot connect to ${clean}. Please check that the server is running.`);
    }
  };

  if (loading) {
    return (
      <div className="popup-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading Compare Anything...</p>
      </div>
    );
  }

  return (
    <div className="popup-container">
      {/* Header */}
      <header className="popup-header">
        <div className="brand-badge">
          <div className="brand-logo">CA</div>
          <h1 className="brand-title">Compare Anything</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            className={`server-badge ${serverOnline === true ? 'online' : serverOnline === false ? 'offline' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
            title={`Backend: ${backendUrl || 'Checking...'}. Click to configure.`}
          >
            <span className={`dot-indicator ${serverOnline === true ? 'online' : serverOnline === false ? 'offline' : ''}`} />
            <span>{serverOnline === true ? 'Live' : serverOnline === false ? 'Offline' : '...'}</span>
          </div>
          <span className={`badge-count ${isCompareReady ? 'ready' : ''}`}>
            {pages.length} / {StorageService.MAX_PAGES}
          </span>
        </div>
      </header>

      {/* Settings Dropdown Box */}
      {showSettings && (
        <form onSubmit={handleSaveBackendUrl} className="settings-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>Backend Server URL</span>
            <span style={{ fontSize: '10px', color: serverOnline ? 'var(--success)' : 'var(--danger)' }}>
              {serverOnline ? '● Connected' : '○ Unreachable'}
            </span>
          </div>
          <input
            type="text"
            className="settings-input"
            value={customUrlInput}
            onChange={(e) => setCustomUrlInput(e.target.value)}
            placeholder="http://comparing-site.test"
          />
          <div className="settings-actions">
            <button
              type="button"
              className="btn-xs"
              onClick={handleAutoDetectBackend}
              disabled={detecting}
            >
              <RotateCcw size={10} className={detecting ? 'spin' : ''} />
              {detecting ? 'Scanning...' : 'Auto-Detect'}
            </button>
            <button type="submit" className="btn-xs btn-primary">
              Save
            </button>
          </div>
        </form>
      )}

      {/* Error & Info Alerts */}
      {errorMessage && (
        <div className="alert alert-error">
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}
      {infoMessage && (
        <div className="alert alert-warning">
          <AlertCircle size={14} />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Current Page Section */}
      <section className="card current-page-card">
        <div className="card-title-row">
          <span className="card-label">Current Page</span>
          {isCurrentTabAdded && (
            <span style={{ color: 'var(--success)', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Check size={12} /> Added
            </span>
          )}
        </div>

        {currentTab?.isRestricted ? (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Browser system page. Open a website to add it to comparison.
          </p>
        ) : (
          <>
            <div className="page-title" title={currentTab?.title}>
              {currentTab?.title || 'Untitled Page'}
            </div>
            <div className="page-domain">
              <ExternalLink size={10} />
              {currentTab?.domain || 'webpage'}
            </div>
          </>
        )}

        <button
          className={`btn ${isCurrentTabAdded ? 'btn-secondary' : 'btn-primary'}`}
          disabled={extracting || isCurrentTabAdded || !canAddMore || currentTab?.isRestricted}
          onClick={handleAddCurrentPage}
        >
          {extracting ? (
            'Extracting page data...'
          ) : isCurrentTabAdded ? (
            <>
              <Check size={14} /> Added to Comparison
            </>
          ) : !canAddMore ? (
            'Maximum 4 Pages Reached'
          ) : (
            <>
              <Plus size={14} /> Add to Comparison
            </>
          )}
        </button>
      </section>

      {/* Selected Pages List */}
      <section className="goal-container">
        <div className="goal-label">
          <span>Selected Pages</span>
          {pages.length > 0 && (
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {pages.length < 2 ? 'Add at least 1 more' : 'Ready to compare'}
            </span>
          )}
        </div>

        {pages.length === 0 ? (
          <div className="empty-state">
            <Layers size={22} style={{ opacity: 0.4, margin: '0 auto 6px' }} />
            <p>No pages added yet.</p>
            <p style={{ fontSize: '11px', marginTop: '2px' }}>
              Click <strong>Add to Comparison</strong> on any webpage to begin.
            </p>
          </div>
        ) : (
          <div className="selected-list">
            {pages.map((page, index) => (
              <div key={page.id} className="selected-item-card">
                <div className="item-info">
                  <div className="item-title">
                    <span className="item-index">{index + 1}.</span>
                    {page.title}
                  </div>
                  <div className="item-meta">{page.domain}</div>
                </div>
                <button
                  className="btn-danger-text"
                  title="Remove page"
                  onClick={() => handleRemovePage(page.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Optional User Requirement / Goal */}
      <section className="goal-container">
        <label className="goal-label" htmlFor="user-goal-input">
          <span>What matters to you?</span>
          <span className="goal-optional">— Optional</span>
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            id="user-goal-input"
            type="text"
            className="goal-input"
            style={{ paddingRight: userGoal ? '26px' : '10px' }}
            placeholder="e.g. Affordable price, More exams, Better faculty"
            value={userGoal}
            onChange={handleGoalChange}
            maxLength={120}
          />
          {userGoal && (
            <button
              type="button"
              onClick={() => {
                setUserGoal('');
                StorageService.setUserGoal('');
              }}
              title="Clear goal"
              style={{
                position: 'absolute',
                right: '8px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '13px',
                lineHeight: 1,
                padding: '2px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* Footer Actions */}
      <footer className="footer-actions">
        <button
          className="btn btn-primary"
          style={{ padding: '10px 14px', fontSize: '13px' }}
          disabled={!isCompareReady}
          onClick={handleCompareClick}
        >
          <Sparkles size={15} />
          {pages.length >= 2
            ? `COMPARE ${pages.length} PAGES`
            : pages.length === 1
            ? 'ADD 1 MORE PAGE TO COMPARE'
            : 'ADD 2–4 PAGES TO COMPARE'}
        </button>

        {pages.length > 0 ? (
          <div className="clear-btn-row">
            <button
              className="btn-danger-text"
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={handleClearComparison}
            >
              Clear Comparison
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => {
                if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
                  chrome.tabs.create({ url: chrome.runtime.getURL('results.html?demo=1') });
                } else {
                  window.open('/results.html?demo=1', '_blank');
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#60a5fa',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
              }}
            >
              <Sparkles size={12} />
              <span>View Sample 2-Page Comparison (Demo)</span>
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};
