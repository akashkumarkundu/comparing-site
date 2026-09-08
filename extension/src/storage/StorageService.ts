import type { PageSnapshot, StorageState } from '../models/types';

const STORAGE_KEYS = {
  PAGES: 'ca_selected_pages',
  USER_GOAL: 'ca_user_goal',
  INSTALL_ID: 'ca_install_id',
};

const MAX_PAGES = 4;
const MIN_PAGES = 2;

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
      };
    } else {
      // LocalStorage fallback for non-extension preview
      let installId = localStorage.getItem(STORAGE_KEYS.INSTALL_ID);
      if (!installId) {
        installId = generateGuid();
        localStorage.setItem(STORAGE_KEYS.INSTALL_ID, installId);
      }
      const rawPages = localStorage.getItem(STORAGE_KEYS.PAGES);
      return {
        pages: rawPages ? JSON.parse(rawPages) : [],
        userGoal: localStorage.getItem(STORAGE_KEYS.USER_GOAL) || '',
        installId,
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

    if (isChromeStorageAvailable) {
      await chrome.storage.local.set({ [STORAGE_KEYS.PAGES]: updatedPages });
    } else {
      localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(updatedPages));
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
    } else {
      localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(updatedPages));
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
   * Clears all comparison pages and goal
   */
  static async clearComparison(): Promise<void> {
    if (isChromeStorageAvailable) {
      await chrome.storage.local.remove([STORAGE_KEYS.PAGES, STORAGE_KEYS.USER_GOAL]);
    } else {
      localStorage.removeItem(STORAGE_KEYS.PAGES);
      localStorage.removeItem(STORAGE_KEYS.USER_GOAL);
    }
  }

  static get MAX_PAGES() {
    return MAX_PAGES;
  }

  static get MIN_PAGES() {
    return MIN_PAGES;
  }
}
