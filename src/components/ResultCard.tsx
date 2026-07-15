import React from 'react';
import { AppAnalysisResult } from '../types';
import { translations, Language } from '../i18n';
import { ExternalLink, CheckCircle2, XCircle, Monitor, Smartphone, Globe, Apple, MonitorPlay } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResultCardProps {
  result: AppAnalysisResult;
  lang: Language;
  onRetry: () => void;
}

export function ResultCard({ result, lang, onRetry }: ResultCardProps) {
  const t = translations[lang].results;
  const tp = translations[lang].platforms;
  const isRtl = lang === 'ar';

  if (!result.success) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center text-center space-y-4">
          <XCircle className="w-16 h-16 text-amber-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.notSure}</h2>
          
          {result.alternatives && result.alternatives.length > 0 && (
            <div className="w-full mt-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 text-start">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t.alternatives}</h3>
              <ul className="space-y-3">
                {result.alternatives.map((alt, i) => (
                  <li key={i} className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="font-medium text-slate-900 dark:text-white">{alt.appName}</span>
                    <span className="text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-md">
                      {t.confidence}: {alt.confidence}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={onRetry} className="mt-8 px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity">
            {t.retryBtn}
          </button>
        </div>
      </div>
    );
  }

  const { platforms } = result;
  
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative">
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{t.confidence}: {result.confidence}%</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{result.appName}</h1>
        <p className="text-blue-100 text-lg max-w-2xl">{result.description}</p>
        
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium">
            {t.type}: {result.type}
          </span>
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium">
            {result.pricing.model}
          </span>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MonitorPlay className="w-5 h-5 text-blue-500" />
              {t.platforms}
            </h3>
            <div className="flex flex-wrap gap-2">
              {platforms.website && <PlatformBadge icon={<Globe className="w-4 h-4"/>} label={tp.website} />}
              {platforms.android && <PlatformBadge icon={<Smartphone className="w-4 h-4"/>} label={tp.android} />}
              {platforms.iphone && <PlatformBadge icon={<Smartphone className="w-4 h-4"/>} label={tp.iphone} />}
              {platforms.windows && <PlatformBadge icon={<Monitor className="w-4 h-4"/>} label={tp.windows} />}
              {platforms.mac && <PlatformBadge icon={<Apple className="w-4 h-4"/>} label={tp.mac} />}
              {platforms.linux && <PlatformBadge icon={<Monitor className="w-4 h-4"/>} label={tp.linux} />}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-500" />
              {t.links}
            </h3>
            <div className="space-y-3">
              {result.officialLink && (
                <a href={result.officialLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{t.officialSite}</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                </a>
              )}
              {result.storeLinks?.googlePlay && (
                <a href={result.storeLinks.googlePlay} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{t.googlePlay}</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                </a>
              )}
              {result.storeLinks?.appStore && (
                <a href={result.storeLinks.appStore} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{t.appStore}</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                </a>
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t.usageSteps}</h3>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
              <ol className="space-y-4">
                {result.usageSteps.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t.pricing}</h3>
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-5 border border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-amber-900 dark:text-amber-200 text-lg">{result.pricing.model}</span>
              </div>
              <p className="text-amber-800 dark:text-amber-400/80 text-sm">
                <span className="font-medium mr-1">{t.limitations}:</span>
                {result.pricing.limitations}
              </p>
            </div>
          </section>
        </div>

      </div>

      <div className="bg-slate-50 dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-800 flex justify-center">
        <button onClick={onRetry} className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
          {t.retryBtn}
        </button>
      </div>

    </div>
  );
}

function PlatformBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium">
      {icon}
      {label}
    </span>
  );
}
