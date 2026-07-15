export interface AppDatabaseEntry {
  name: string;
  officialUrl: string;
  type: string;
  platforms: {
    website: boolean;
    android: boolean;
    iphone: boolean;
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  storeLinks: {
    googlePlay: string | null;
    appStore: string | null;
  };
  pricing: {
    model: 'Free' | 'Paid' | 'Freemium' | 'Open Source' | 'Trial';
    limitations: string;
  };
  description: string;
  keywords: string[];
}

export const appsDatabase: AppDatabaseEntry[] = [
  {
    name: 'ChatGPT',
    officialUrl: 'https://chatgpt.com',
    type: 'AI Tool',
    platforms: { website: true, android: true, iphone: true, windows: true, mac: true, linux: false },
    storeLinks: {
      googlePlay: 'https://play.google.com/store/apps/details?id=com.openai.chatgpt',
      appStore: 'https://apps.apple.com/us/app/chatgpt/id6448311069'
    },
    pricing: { model: 'Freemium', limitations: 'Advanced models and tools require Plus subscription.' },
    description: 'AI-powered language model by OpenAI.',
    keywords: ['chatgpt', 'openai', 'message chatgpt', 'gpt-4', 'gpt-3.5']
  },
  {
    name: 'Claude',
    officialUrl: 'https://claude.ai',
    type: 'AI Tool',
    platforms: { website: true, android: true, iphone: true, windows: false, mac: false, linux: false },
    storeLinks: {
      googlePlay: 'https://play.google.com/store/apps/details?id=com.anthropic.claude',
      appStore: 'https://apps.apple.com/us/app/claude-by-anthropic/id6473753684'
    },
    pricing: { model: 'Freemium', limitations: 'Pro plan for higher usage limits.' },
    description: 'AI assistant by Anthropic.',
    keywords: ['claude', 'anthropic', 'message claude']
  },
  {
    name: 'GitHub',
    officialUrl: 'https://github.com',
    type: 'Developer Tool',
    platforms: { website: true, android: true, iphone: true, windows: false, mac: false, linux: false },
    storeLinks: {
      googlePlay: 'https://play.google.com/store/apps/details?id=com.github.android',
      appStore: 'https://apps.apple.com/us/app/github/id1477376905'
    },
    pricing: { model: 'Freemium', limitations: 'Free for public/private repos; paid for advanced features.' },
    description: 'Hosting platform for version control and collaboration.',
    keywords: ['github', 'commit', 'pull request', 'repository', 'fork']
  },
  {
    name: 'VS Code',
    officialUrl: 'https://code.visualstudio.com/',
    type: 'IDE',
    platforms: { website: false, android: false, iphone: false, windows: true, mac: true, linux: true },
    storeLinks: { googlePlay: null, appStore: null },
    pricing: { model: 'Free', limitations: 'None. Extensions may have varying costs.' },
    description: 'Code editor developed by Microsoft.',
    keywords: ['vs code', 'visual studio code', 'microsoft', 'explorer', 'extensions']
  },
  {
    name: 'Figma',
    officialUrl: 'https://figma.com',
    type: 'Design Tool',
    platforms: { website: true, android: true, iphone: true, windows: true, mac: true, linux: false },
    storeLinks: {
      googlePlay: 'https://play.google.com/store/apps/details?id=com.figma.mirror',
      appStore: 'https://apps.apple.com/us/app/figma/id1152747299'
    },
    pricing: { model: 'Freemium', limitations: 'Limited files for free tier.' },
    description: 'Collaborative interface design tool.',
    keywords: ['figma', 'design', 'prototype', 'layers', 'assets']
  },
  {
    name: 'Notion',
    officialUrl: 'https://notion.so',
    type: 'Productivity',
    platforms: { website: true, android: true, iphone: true, windows: true, mac: true, linux: false },
    storeLinks: {
      googlePlay: 'https://play.google.com/store/apps/details?id=notion.id',
      appStore: 'https://apps.apple.com/us/app/notion-notes-docs-tasks/id1232780281'
    },
    pricing: { model: 'Freemium', limitations: 'Plus plan for unlimited blocks and team features.' },
    description: 'All-in-one workspace for notes and tasks.',
    keywords: ['notion', 'workspace', 'pages', 'blocks', 'database']
  },
  {
    name: 'YouTube',
    officialUrl: 'https://youtube.com',
    type: 'Video Streaming',
    platforms: { website: true, android: true, iphone: true, windows: false, mac: false, linux: false },
    storeLinks: {
      googlePlay: 'https://play.google.com/store/apps/details?id=com.google.android.youtube',
      appStore: 'https://apps.apple.com/us/app/youtube-watch-listen-stream/id544007664'
    },
    pricing: { model: 'Freemium', limitations: 'YouTube Premium removes ads.' },
    description: 'Video sharing platform by Google.',
    keywords: ['youtube', 'subscribe', 'shorts', 'library', 'history']
  },
  {
    name: 'Instagram',
    officialUrl: 'https://instagram.com',
    type: 'Social Media',
    platforms: { website: true, android: true, iphone: true, windows: false, mac: false, linux: false },
    storeLinks: {
      googlePlay: 'https://play.google.com/store/apps/details?id=com.instagram.android',
      appStore: 'https://apps.apple.com/us/app/instagram/id389801252'
    },
    pricing: { model: 'Free', limitations: 'Contains ads.' },
    description: 'Photo and video sharing social network.',
    keywords: ['instagram', 'reels', 'story', 'post', 'followers']
  }
];
