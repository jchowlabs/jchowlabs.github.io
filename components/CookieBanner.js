'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = JSON.parse(localStorage.getItem('cookieConsent') || 'null');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleConsent = (accepted) => {
    const consent = {
      analytics: accepted,
      timestamp: Date.now(),
      version: 1,
    };
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    setVisible(false);

    if (accepted) {
      if (typeof window.loadGoogleAnalytics === 'function') {
        window.loadGoogleAnalytics();
      }
      // Notify Chatbot component that consent was granted
      window.dispatchEvent(new CustomEvent('analytics-consent-granted'));
    }
  };

  return (
    <div className={`cookie-banner${visible ? ' show' : ''}`} id="cookieBanner">
      <div className="cookie-banner-content">
        <div className="cookie-banner-text">
          <p><strong>Privacy notice:</strong> This site uses basic analytics and optional interactive features.</p>
        </div>
        <div className="cookie-banner-actions">
          <button className="cookie-btn cookie-btn-decline" onClick={() => handleConsent(false)}>
            Decline
          </button>
          <button className="cookie-btn cookie-btn-accept" onClick={() => handleConsent(true)}>
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
