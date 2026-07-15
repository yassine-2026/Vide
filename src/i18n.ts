export const translations = {
  en: {
    title: 'Video App Finder',
    subtitle: 'Upload a video to identify the app or website being used.',
    dropzone: {
      dragText: 'Drag & drop a video file here, or click to select',
      orPasteUrl: 'Or paste a direct video URL below',
      analyzeBtn: 'Analyze Video',
      analyzingBtn: 'Analyzing...',
      cancelBtn: 'Cancel',
      supported: 'Supported formats: MP4, WebM (Max 50MB)'
    },
    progress: {
      uploading: 'Uploading video...',
      extracting: 'Extracting key frames...',
      analyzing: 'Analyzing UI and extracting text...',
      finishing: 'Finalizing results...'
    },
    results: {
      identified: 'Identified Application',
      notSure: 'Could not identify the application with enough confidence.',
      confidence: 'Confidence',
      type: 'Type',
      platforms: 'Platforms',
      links: 'Links',
      officialSite: 'Official Website',
      googlePlay: 'Google Play',
      appStore: 'App Store',
      usageSteps: 'How to Use (Based on video)',
      pricing: 'Pricing Model',
      limitations: 'Limitations / Notes',
      alternatives: 'Top Alternatives',
      retryBtn: 'Analyze Another Video'
    },
    platforms: {
      website: 'Website',
      android: 'Android',
      iphone: 'iPhone',
      windows: 'Windows',
      mac: 'Mac',
      linux: 'Linux'
    },
    errors: {
      noInput: 'Please provide a video file or URL.',
      fileTooLarge: 'File exceeds the 50MB limit.',
      serverError: 'An error occurred during analysis.',
      groqKeyMissing: 'GROQ_API_KEY is not configured on the server.'
    }
  },
  ar: {
    title: 'مكتشف التطبيقات بالفيديو',
    subtitle: 'قم برفع فيديو للتعرف على التطبيق أو الموقع المستخدم.',
    dropzone: {
      dragText: 'اسحب وأفلت ملف الفيديو هنا، أو انقر للاختيار',
      orPasteUrl: 'أو الصق رابط فيديو مباشر بالأسفل',
      analyzeBtn: 'تحليل الفيديو',
      analyzingBtn: 'جاري التحليل...',
      cancelBtn: 'إلغاء',
      supported: 'الصيغ المدعومة: MP4, WebM (الحد الأقصى 50MB)'
    },
    progress: {
      uploading: 'جاري رفع الفيديو...',
      extracting: 'استخراج الإطارات المهمة...',
      analyzing: 'تحليل واجهة المستخدم واستخراج النصوص...',
      finishing: 'إعداد النتائج...'
    },
    results: {
      identified: 'التطبيق المكتشف',
      notSure: 'تعذر التعرف على التطبيق بدرجة ثقة كافية.',
      confidence: 'نسبة الثقة',
      type: 'النوع',
      platforms: 'المنصات',
      links: 'الروابط',
      officialSite: 'الموقع الرسمي',
      googlePlay: 'جوجل بلاي',
      appStore: 'آب ستور',
      usageSteps: 'طريقة الاستخدام (بناءً على الفيديو)',
      pricing: 'نموذج التسعير',
      limitations: 'قيود / ملاحظات',
      alternatives: 'أفضل الاحتمالات البديلة',
      retryBtn: 'تحليل فيديو آخر'
    },
    platforms: {
      website: 'موقع إلكتروني',
      android: 'أندرويد',
      iphone: 'أيفون',
      windows: 'ويندوز',
      mac: 'ماك',
      linux: 'لينكس'
    },
    errors: {
      noInput: 'يرجى تقديم ملف فيديو أو رابط.',
      fileTooLarge: 'حجم الملف يتجاوز الحد الأقصى (50 ميجابايت).',
      serverError: 'حدث خطأ أثناء التحليل.',
      groqKeyMissing: 'مفتاح GROQ_API_KEY غير معد على الخادم.'
    }
  }
};

export type Language = 'en' | 'ar';
