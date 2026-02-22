import '@/styles/globals.css';
import '@/styles/chatbot.css';
import '@/styles/pages.css';
import Script from 'next/script';
import Analytics from '@/components/Analytics';
import CookieBanner from '@/components/CookieBanner';
import ContactModal from '@/components/ContactModal';
import Chatbot from '@/components/Chatbot';

export const metadata = {
  title: 'jchowlabs',
  icons: {
    icon: '/static/images/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://www.google.com/recaptcha/api.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <Analytics />
        {children}
        <CookieBanner />
        <ContactModal />
        <Chatbot />
      </body>
    </html>
  );
}
