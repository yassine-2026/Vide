export type AppPricingModel = 'Free' | 'Paid' | 'Freemium' | 'Open Source' | 'Trial';

export interface AppPlatforms {
  website: boolean;
  android: boolean;
  iphone: boolean;
  windows: boolean;
  mac: boolean;
  linux: boolean;
}

export interface AppAlternative {
  appName: string;
  confidence: number;
}

export interface AppAnalysisResult {
  success: boolean;
  confidence: number;
  appName: string;
  description: string;
  type: string;
  platforms: AppPlatforms;
  officialLink: string | null;
  storeLinks: {
    googlePlay: string | null;
    appStore: string | null;
  };
  usageSteps: string[];
  pricing: {
    model: AppPricingModel;
    limitations: string;
  };
  alternatives?: AppAlternative[];
}

export interface AnalyzeResponse {
  result?: AppAnalysisResult;
  error?: string;
}
