import React, { useEffect, useState } from 'react';
import { PageSnapshot } from '../models/types';
import { StorageService } from '../storage/StorageService';
import { captureCurrentTab } from '../extractors/PageExtractor';
import { ExternalLink, Trash2, Plus, Check, Layers, AlertCircle, Sparkles } from 'lucide-react';

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

  // Load storage state and active tab on mount
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const state = await StorageService.getState();
        setPages(state.pages);
        setUserGoal(state.userGoal);

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
        <span className={`badge-count ${isCompareReady ? 'ready' : ''}`}>
          {pages.length} / {StorageService.MAX_PAGES} pages added
        </span>
      </header>

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
        <input
          id="user-goal-input"
          type="text"
          className="goal-input"
          placeholder="e.g. Best laptop for programming under Tk 80,000"
          value={userGoal}
          onChange={handleGoalChange}
          maxLength={120}
        />
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

        {pages.length > 0 && (
          <div className="clear-btn-row">
            <button
              className="btn-danger-text"
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={handleClearComparison}
            >
              Clear Comparison
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};
