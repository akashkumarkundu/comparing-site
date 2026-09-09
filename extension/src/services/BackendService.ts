import type { ApiResponse, CompareRequest, ComparisonResult } from '../models/types';
import { StorageService } from '../storage/StorageService';

export class BackendService {
  /**
   * Sends comparison request to the backend API endpoint
   */
  static async compare(request: CompareRequest): Promise<ComparisonResult> {
    const state = await StorageService.getState();
    const baseUrl = (state.apiBaseUrl || 'http://127.0.0.1:8000').replace(/\/+$/, '');
    const endpoint = `${baseUrl}/api/v1/compare`;

    let response: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          installId: request.installId,
          goal: request.goal || null,
          pages: request.pages,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Comparison timed out after 60 seconds. Please try again.');
      }
      throw new Error(
        'Backend server is unreachable. Please make sure the Laravel backend is running (php artisan serve).'
      );
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
