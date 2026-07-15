import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Link as LinkIcon, Loader2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { translations, Language } from '../i18n';

interface DropzoneProps {
  lang: Language;
  onAnalyze: (file: File | null, url: string) => void;
  isProcessing: boolean;
  onCancel: () => void;
}

export function DropzoneArea({ lang, onAnalyze, isProcessing, onCancel }: DropzoneProps) {
  const t = translations[lang].dropzone;
  const [url, setUrl] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && !isProcessing) {
      onAnalyze(acceptedFiles[0], '');
    }
  }, [onAnalyze, isProcessing]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
    disabled: isProcessing
  });

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isProcessing) {
      onAnalyze(null, url.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 flex flex-col gap-6">
      {/* File Dropzone */}
      <div 
        {...getRootProps()} 
        className={cn(
          "relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200",
          isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50",
          isProcessing && "opacity-50 pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
        <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
          {t.dragText}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          {t.supported}
        </p>
        
        {fileRejections.length > 0 && (
          <p className="text-red-500 text-sm mt-4 font-medium">
            {translations[lang].errors.fileTooLarge}
          </p>
        )}
      </div>

      {/* URL Input */}
      <div className="flex items-center gap-4 my-2">
        <hr className="flex-1 border-slate-200 dark:border-slate-700" />
        <span className="text-sm text-slate-500 font-medium px-2">{lang === 'ar' ? 'أو' : 'OR'}</span>
        <hr className="flex-1 border-slate-200 dark:border-slate-700" />
      </div>

      <form onSubmit={handleUrlSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="url" 
            placeholder={t.orPasteUrl}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isProcessing}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
        {!isProcessing ? (
          <button 
            type="submit"
            disabled={!url.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {t.analyzeBtn}
          </button>
        ) : (
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            {t.cancelBtn}
          </button>
        )}
      </form>
      
      {/* Progress */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-3 text-blue-600 dark:text-blue-400 mt-4 bg-blue-50 dark:bg-blue-900/20 py-4 px-6 rounded-lg animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">{translations[lang].progress.analyzing}</span>
        </div>
      )}
    </div>
  );
}
