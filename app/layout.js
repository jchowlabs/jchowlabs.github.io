import '@/styles/globals.css';
import '@/styles/chatbot.css';
import '@/styles/pages.css';
import '@/styles/liveness.css';
import '@/styles/inline-voice-demo.css';
import '@/styles/agent-chatlab.css';
import '@/styles/browser-fingerprint.css';
import Script from 'next/script';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import CookieBanner from '@/components/CookieBanner';
import ContactModal from '@/components/ContactModal';
import Chatbot from '@/components/Chatbot';

export const metadata = {
  title: 'jchowlabs',
  icons: {
    icon: '/static/images/favicon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="afterInteractive"
        />
        <AnalyticsTracker />
        {children}
        <CookieBanner />
        <ContactModal />
        <Chatbot />
      </body>
    </html>
  );
}
