export type AppPricingModel = 'Free' | 'Paid' | 'Freemium' | 'Open Source' | 'Trial' | 'Unknown';

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
  requirements?: {
    accountNeeded: boolean | "Unknown";
  };
  failureReason?: string;
  evidence?: {
    detectedText: string[];
    detectedLogos: string[];
    uiElements: string[];
    detectedSpeech?: string;
  };
  alternatives?: AppAlternative[];
}

export type JobStatus = 'uploading' | 'extracting' | 'analyzing' | 'completed' | 'failed';

export interface Job {
  id: string;
  status: JobStatus;
  result?: AppAnalysisResult;
  error?: string;
  createdAt: number;
}

export interface AnalyzeResponse {
  success: boolean;
  jobId?: string;
  error?: string;
}

export interface JobResponse {
  success: boolean;
  job?: Job;
  error?: string;
}
