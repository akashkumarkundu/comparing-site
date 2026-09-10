import type { ComparisonResult, PageSnapshot, StorageState } from '../models/types';

const STORAGE_KEYS = {
  PAGES: 'ca_selected_pages',
  USER_GOAL: 'ca_user_goal',
  INSTALL_ID: 'ca_install_id',
  CACHED_RESULT: 'ca_cached_result',
  API_BASE_URL: 'ca_api_base_url',
};

const MAX_PAGES = 4;
const MIN_PAGES = 2;
export const DEFAULT_API_BASE_URL = 'http://comparing-site.test';
export const CANDIDATE_API_BASE_URLS = [
  'http://comparing-site.test',
  'http://127.0.0.1:8000',
  'http://localhost:8000',
  'http://localhost',
  'https://comparing-site.test',
];

function generateGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const isChromeStorageAvailable = typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);

export class StorageService {
  /**
   * Retrieves full storage state
   */
  static async getState(): Promise<StorageState> {
    if (isChromeStorageAvailable) {
      const data = await chrome.storage.local.get([
        STORAGE_KEYS.PAGES,
        STORAGE_KEYS.USER_GOAL,
        STORAGE_KEYS.INSTALL_ID,
        STORAGE_KEYS.CACHED_RESULT,
        STORAGE_KEYS.API_BASE_URL,
      ]);

      let installId = data[STORAGE_KEYS.INSTALL_ID];
      if (!installId) {
        installId = generateGuid();
        await chrome.storage.local.set({ [STORAGE_KEYS.INSTALL_ID]: installId });
      }

      return {
        pages: data[STORAGE_KEYS.PAGES] || [],
        userGoal: data[STORAGE_KEYS.USER_GOAL] || '',
        installId,
        cachedResult: data[STORAGE_KEYS.CACHED_RESULT] || null,
        apiBaseUrl: data[STORAGE_KEYS.API_BASE_URL] || DEFAULT_API_BASE_URL,
      };
    } else {
      // LocalStorage fallback for non-extension preview
      let installId = localStorage.getItem(STORAGE_KEYS.INSTALL_ID);
      if (!installId) {
        installId = generateGuid();
        localStorage.setItem(STORAGE_KEYS.INSTALL_ID, installId);
      }
      const rawPages = localStorage.getItem(STORAGE_KEYS.PAGES);
      const rawResult = localStorage.getItem(STORAGE_KEYS.CACHED_RESULT);

      return {
        pages: rawPages ? JSON.parse(rawPages) : [],
        userGoal: localStorage.getItem(STORAGE_KEYS.USER_GOAL) || '',
        installId,
        cachedResult: rawResult ? JSON.parse(rawResult) : null,
        apiBaseUrl: localStorage.getItem(STORAGE_KEYS.API_BASE_URL) || DEFAULT_API_BASE_URL,
      };
    }
  }

  /**
   * Adds a page snapshot to local storage
   */
  static async addPage(snapshot: PageSnapshot): Promise<{ success: boolean; error?: string; pages: PageSnapshot[] }> {
    const state = await this.getState();

    // Check duplicate URL
    const isDuplicate = state.pages.some((p) => p.url === snapshot.url);
    if (isDuplicate) {
      return { success: false, error: 'This page is already in your comparison.', pages: state.pages };
    }

    // Check maximum pages
    if (state.pages.length >= MAX_PAGES) {
      return {
        success: false,
        error: `Maximum ${MAX_PAGES} pages allowed for comparison.`,
        pages: state.pages,
      };
    }

    const updatedPages = [...state.pages, snapshot];

    // Invalidate cached result when pages change
    if (isChromeStorageAvailable) {
      await chrome.storage.local.set({ [STORAGE_KEYS.PAGES]: updatedPages });
      await chrome.storage.local.remove([STORAGE_KEYS.CACHED_RESULT]);
    } else {
      localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(updatedPages));
      localStorage.removeItem(STORAGE_KEYS.CACHED_RESULT);
    }

    return { success: true, pages: updatedPages };
  }

  /**
   * Removes a page snapshot by ID
   */
  static async removePage(id: string): Promise<PageSnapshot[]> {
    const state = await this.getState();
    const updatedPages = state.pages.filter((p) => p.id !== id);

    if (isChromeStorageAvailable) {
      await chrome.storage.local.set({ [STORAGE_KEYS.PAGES]: updatedPages });
      await chrome.storage.local.remove([STORAGE_KEYS.CACHED_RESULT]);
    } else {
      localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(updatedPages));
      localStorage.removeItem(STORAGE_KEYS.CACHED_RESULT);
    }

    return updatedPages;
  }

  /**
   * Saves or updates the user priority goal
   */
  static async setUserGoal(goal: string): Promise<void> {
    if (isChromeStorageAvailable) {
      await chrome.storage.local.set({ [STORAGE_KEYS.USER_GOAL]: goal });
    } else {
      localStorage.setItem(STORAGE_KEYS.USER_GOAL, goal);
    }
  }

  /**
   * Cached comparison result getter and setter
   */
  static async getCachedResult(): Promise<ComparisonResult | null> {
    const state = await this.getState();
    return state.cachedResult || null;
  }

  static async setCachedResult(result: ComparisonResult | null): Promise<void> {
    if (isChromeStorageAvailable) {
      if (result) {
        await chrome.storage.local.set({ [STORAGE_KEYS.CACHED_RESULT]: result });
      } else {
        await chrome.storage.local.remove([STORAGE_KEYS.CACHED_RESULT]);
      }
    } else {
      if (result) {
        localStorage.setItem(STORAGE_KEYS.CACHED_RESULT, JSON.stringify(result));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CACHED_RESULT);
      }
    }
  }

  /**
   * Clears all comparison pages, goal, and cached results
   */
  static async clearComparison(): Promise<void> {
    if (isChromeStorageAvailable) {
      await chrome.storage.local.remove([
        STORAGE_KEYS.PAGES,
        STORAGE_KEYS.USER_GOAL,
        STORAGE_KEYS.CACHED_RESULT,
      ]);
    } else {
      localStorage.removeItem(STORAGE_KEYS.PAGES);
      localStorage.removeItem(STORAGE_KEYS.USER_GOAL);
      localStorage.removeItem(STORAGE_KEYS.CACHED_RESULT);
    }
  }

  /**
   * Updates and saves the API base URL in storage
   */
  static async setApiBaseUrl(url: string): Promise<string> {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    if (isChromeStorageAvailable) {
      await chrome.storage.local.set({ [STORAGE_KEYS.API_BASE_URL]: cleanUrl });
    } else {
      localStorage.setItem(STORAGE_KEYS.API_BASE_URL, cleanUrl);
    }
    return cleanUrl;
  }

  static get MAX_PAGES() {
    return MAX_PAGES;
  }

  static get MIN_PAGES() {
    return MIN_PAGES;
  }
}
