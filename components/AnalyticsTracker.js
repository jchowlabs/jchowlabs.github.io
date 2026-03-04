'use client';

/**
 * AnalyticsTracker — Fires a page_view event on every route change.
 * Renders nothing. Drop into layout.js alongside other global components.
 */

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  return null;
}
