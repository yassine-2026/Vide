import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Languages } from 'lucide-react';
import { DropzoneArea } from './components/DropzoneArea';
import { ResultCard } from './components/ResultCard';
import { Language, translations } from './i18n';
import { AnalyzeResponse, AppAnalysisResult, JobResponse, JobStatus } from './types';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [result, setResult] = useState<AppAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Apply dark mode & rtl
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [theme, lang]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLang = () => setLang(prev => prev === 'en' ? 'ar' : 'en');

  const pollJob = async (jobId: string, controller: AbortController) => {
    while (!controller.signal.aborted) {
      try {
        const response = await fetch(`/api/job/${jobId}`, {
          signal: controller.signal
        });
        const data: JobResponse = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || translations[lang].errors.serverError);
        }

        if (data.job) {
          setJobStatus(data.job.status);
          if (data.job.status === 'completed') {
            if (data.job.result) {
              setResult(data.job.result);
            } else {
              throw new Error(translations[lang].errors.serverError);
            }
            break;
          } else if (data.job.status === 'failed') {
            throw new Error(data.job.error || translations[lang].errors.serverError);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          throw err;
        }
        break;
      }
      
      // Wait 2 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const handleAnalyze = async (file: File | null, url: string) => {
    setError(null);
    setResult(null);
    setIsProcessing(true);
    setJobStatus('uploading');

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const formData = new FormData();
    if (file) {
      formData.append('video', file);
    } else if (url) {
      formData.append('url', url);
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        signal: abortController.signal
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(translations[lang].errors.serverError + ` (Status: ${response.status})`);
      }

      const data: AnalyzeResponse = await response.json();

      if (!response.ok || !data.success || !data.jobId) {
        throw new Error(data.error || translations[lang].errors.serverError);
      }

      // Start polling
      await pollJob(data.jobId, abortController);
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Analysis cancelled');
      } else {
        setError(err.message || 'Unknown error occurred.');
      }
    } finally {
      setIsProcessing(false);
      setJobStatus(null);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      setJobStatus(null);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setError(null);
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200">
      
      {/* Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              VF
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              {t.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleLang}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 flex items-center gap-2"
              title="Toggle Language"
            >
              <Languages className="w-5 h-5" />
              <span className="text-sm font-medium">{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        {!result && (
          <div className="text-center max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              {t.title}
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10">
              {t.subtitle}
            </p>

            <DropzoneArea 
              lang={lang} 
              onAnalyze={handleAnalyze} 
              isProcessing={isProcessing} 
              jobStatus={jobStatus}
              onCancel={handleCancel}
            />

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800/30 text-sm font-medium">
                {error}
              </div>
            )}
          </div>
        )}

        {result && (
          <ResultCard 
            result={result} 
            lang={lang} 
            onRetry={handleRetry} 
          />
        )}
      </main>

    </div>
  );
}
