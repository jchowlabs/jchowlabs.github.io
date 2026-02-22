'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export default function Chatbot() {
  const router = useRouter();

  useEffect(() => {
    // Expose Next.js router navigation for chatbot.js
    window.__nextNavigate = (url) => {
      // Strip .html extension for Next.js routes
      let cleanUrl = url.replace(/\.html$/, '');
      // /index → /
      if (cleanUrl === '/index') cleanUrl = '/';
      router.push(cleanUrl);
    };

    return () => {
      delete window.__nextNavigate;
    };
  }, [router]);

  return (
    <Script src="/static/chatbot.js" strategy="afterInteractive" />
  );
}
