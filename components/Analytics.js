'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Analytics() {
  const pathname = usePathname();

  // Load GA on mount if consent exists
  useEffect(() => {
    const consent = JSON.parse(localStorage.getItem('cookieConsent') || 'null');
    if (consent && consent.analytics === true) {
      loadGA();
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-GBHGE9LDVJ', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}

function loadGA() {
  if (document.querySelector('script[src*="googletagmanager"]')) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-GBHGE9LDVJ';
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', 'G-GBHGE9LDVJ');
}

// Expose globally so CookieBanner can trigger it
if (typeof window !== 'undefined') {
  window.loadGoogleAnalytics = loadGA;
}
