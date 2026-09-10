import type { ApiResponse, CompareRequest, ComparisonResult } from '../models/types';
import { StorageService, DEFAULT_API_BASE_URL, CANDIDATE_API_BASE_URLS } from '../storage/StorageService';

export class BackendService {
  /**
   * Fast health check on a target backend URL
   */
  static async checkHealth(baseUrl: string): Promise<boolean> {
    const cleanUrl = baseUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl) return false;

    // First try the lightweight Laravel /up health check
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${cleanUrl}/up`, {
        method: 'GET',
        headers: { Accept: 'application/json, text/plain, */*' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok || res.status === 200) {
        return true;
      }
    } catch {
      // Fall through to OPTIONS probe
    }

    // Secondary probe: OPTIONS /api/v1/compare
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${cleanUrl}/api/v1/compare`, {
        method: 'OPTIONS',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Status 204 or any 2xx/3xx/4xx means the backend is listening
      return res.status < 500;
    } catch {
      return false;
    }
  }

  /**
   * Auto-detects the first healthy backend URL from candidate list
   */
  static async autoDetectBackend(): Promise<{ success: boolean; url: string; error?: string }> {
    const state = await StorageService.getState();
    const currentUrl = (state.apiBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

    // List of candidates to probe, current URL first
    const candidates = Array.from(
      new Set([currentUrl, ...CANDIDATE_API_BASE_URLS])
    );

    for (const candidate of candidates) {
      const isAlive = await this.checkHealth(candidate);
      if (isAlive) {
        await StorageService.setApiBaseUrl(candidate);
        return { success: true, url: candidate };
      }
    }

    return {
      success: false,
      url: currentUrl,
      error: `No live Laravel backend detected. Probed: ${candidates.join(', ')}`,
    };
  }

  /**
   * Resolves the current active base URL, falling back if offline
   */
  static async resolveActiveBaseUrl(): Promise<string> {
    const state = await StorageService.getState();
    const currentUrl = (state.apiBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

    // If current URL is alive, use it directly
    const isAlive = await this.checkHealth(currentUrl);
    if (isAlive) {
      return currentUrl;
    }

    // Attempt to auto-detect a working fallback
    const detection = await this.autoDetectBackend();
    if (detection.success) {
      return detection.url;
    }

    return currentUrl;
  }

  /**
   * Sends comparison request to the backend API endpoint
   */
  static async compare(request: CompareRequest): Promise<ComparisonResult> {
    let baseUrl = await this.resolveActiveBaseUrl();
    let response: Response;

    const executeRequest = async (url: string): Promise<Response> => {
      const endpoint = `${url}/api/v1/compare`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            installId: request.installId,
            goal: request.goal || null,
            pages: request.pages,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return res;
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    };

    try {
      response = await executeRequest(baseUrl);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Comparison timed out after 60 seconds. Please try again.');
      }

      // If initial fetch failed, attempt fallback detection once
      const detection = await this.autoDetectBackend();
      if (detection.success && detection.url !== baseUrl) {
        baseUrl = detection.url;
        try {
          response = await executeRequest(baseUrl);
        } catch (retryErr: any) {
          throw new Error(
            `Backend server is unreachable at ${baseUrl}. Please make sure Laravel Herd is running or run "php artisan serve".`
          );
        }
      } else {
        throw new Error(
          `Backend server is unreachable at ${baseUrl}. Please make sure Laravel Herd is running or run "php artisan serve".`
        );
      }
    }

    let json: ApiResponse<ComparisonResult>;
    try {
      json = await response.json();
    } catch {
      throw new Error(`Server returned invalid response (HTTP ${response.status}).`);
    }

    if (!response.ok || !json.success) {
      // Friendly message handling according to SPEC Section 28
      if (response.status === 429) {
        throw new Error(
          json.message || "Today's free comparison limit has been reached. Please try again later."
        );
      }
      if (response.status === 422) {
        throw new Error(json.message || 'Invalid comparison data. Add at least two valid pages.');
      }
      throw new Error(json.message || "Comparison couldn't be generated. Please try again.");
    }

    if (!json.data) {
      throw new Error('Received empty comparison data from AI engine.');
    }

    return json.data;
  }
}

