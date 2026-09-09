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
  cachedResult?: ComparisonResult | null;
  apiBaseUrl?: string;
}

export interface ExtractionResult {
  success: boolean;
  snapshot?: PageSnapshot;
  error?: string;
}

export interface ComparisonItem {
  id: string;
  displayName: string;
  shortDescription: string;
}

export interface CriterionValue {
  itemId: string;
  value: string;
  confidence: 'high' | 'medium' | 'low' | string;
}

export interface ComparisonCriterion {
  name: string;
  importance: 'high' | 'medium' | 'low' | string;
  values: CriterionValue[];
  winnerItemIds: string[];
}

export interface BestOverall {
  itemId: string | null;
  reason: string;
}

export interface BestForRecommendation {
  label: string;
  itemId: string | null;
  reason: string;
}

export interface MissingInfo {
  itemId: string;
  fields: string[];
}

export interface ComparisonResult {
  comparisonTitle: string;
  comparisonType: string;
  goal: string;
  items: ComparisonItem[];
  criteria: ComparisonCriterion[];
  bestOverall: BestOverall;
  bestFor: BestForRecommendation[];
  keyDifferences: string[];
  missingInformation: MissingInfo[];
}

export interface CompareRequest {
  installId: string;
  goal?: string;
  pages: PageSnapshot[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}
