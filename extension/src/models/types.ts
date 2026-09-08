export interface PageSnapshot {
  id: string;
  url: string;
  domain: string;
  title: string;
  description: string;
  structuredData: string;
  importantText: string;
  capturedAt: string;
}

export interface StorageState {
  pages: PageSnapshot[];
  userGoal: string;
  installId: string;
}

export interface ExtractionResult {
  success: boolean;
  snapshot?: PageSnapshot;
  error?: string;
}
