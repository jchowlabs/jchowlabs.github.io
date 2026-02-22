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

    if (accepted && typeof window.loadGoogleAnalytics === 'function') {
      window.loadGoogleAnalytics();
    }
  };

  return (
    <div className={`cookie-banner${visible ? ' show' : ''}`} id="cookieBanner">
      <div className="cookie-banner-content">
        <div className="cookie-banner-text">
          <p><strong>Privacy Notice:</strong> We use analytics to understand how visitors use site.</p>
        </div>
        <div className="cookie-banner-actions">
          <button className="cookie-btn cookie-btn-decline" onClick={() => handleConsent(false)}>
            Decline
          </button>
          <button className="cookie-btn cookie-btn-accept" onClick={() => handleConsent(true)}>
            Allow Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
