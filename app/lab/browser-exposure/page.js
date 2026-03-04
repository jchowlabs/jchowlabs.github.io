import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BrowserFingerprint from '@/components/BrowserFingerprint';

export const metadata = {
  title: 'Browser Exposure Report | jchowlabs',
  description:
    'See what your browser silently reveals to every website you visit. Run an instant audit of your digital fingerprint, network identity, and tracking surface.',
};

export default function BrowserExposurePage() {
  const introHtml = `<section class="article-content-section">
      <div class="article-container">
        <div class="article-hero">
          <img src="/static/images/finger-printing.png" alt="Browser Exposure Report" class="article-hero-img">
        </div>

        <div class="article-header">
          <h1>Browser Exposure Report</h1>
        </div>

        <div class="article-body">
          <p>Do you know how much information your browser leaks?</p>

          <p>Every time you visit a website, your browser quietly shares information about you before you type a single character. Your operating system, screen size, GPU, timezone, installed fonts, language preferences, and more are all accessible to any page you load.</p>

          <p>Individually, these details seem harmless. Combined, they form a <strong>digital fingerprint</strong> that can uniquely identify your device across the web — even without cookies, logins, or tracking scripts.</p>

          <p>This technique is known as <strong>browser fingerprinting</strong>, and it is used by advertisers, analytics platforms, and fraud detection systems to recognize and follow users across sites. Unlike cookies, a fingerprint cannot be easily cleared. It is derived from your device's natural characteristics.</p>

          <p>Click the button below to see exactly what your browser is revealing right now. Nothing is stored or transmitted beyond this page. Try running it again after enabling a VPN, switching browsers, or turning on privacy settings to see what changes.</p>

          <h2>Run Your Report</h2>
        </div>
      </div>
    </section>`;

  const afterHtml = `<section class="article-content-section">
      <div class="article-container">
        <div class="article-body">
          <h2>Reducing Your Exposure</h2>

          <p>There is no single fix, but several steps meaningfully reduce how much your browser reveals:</p>

          <ul>
            <li><strong>Use a VPN</strong> — masks your IP address and approximate location.</li>
            <li><strong>Enable browser privacy settings</strong> — Firefox&rsquo;s &ldquo;resist fingerprinting&rdquo; mode and Brave&rsquo;s shields actively reduce fingerprint surface area.</li>
            <li><strong>Keep software updated</strong> — outdated user-agent strings are more distinctive.</li>
            <li><strong>Use Tor Browser</strong> — aggressively normalizes all signals so every user looks identical.</li>
            <li><strong>Limit browser extensions</strong> — extensions can modify behavior in detectable ways.</li>
          </ul>

          <p>Perfect anonymity is difficult to achieve without trade-offs. The goal is awareness — understanding what you are sharing so you can make informed decisions about when and how to reduce it.</p>
        </div>
      </div>
    </section>`;

  return (
    <div className="page-wrapper content-page article-page">
      <Header currentPage="lab" />
      <main>
        <div dangerouslySetInnerHTML={{ __html: introHtml }} />

        <section className="article-content-section">
          <div className="article-container">
            <BrowserFingerprint />
          </div>
        </section>

        <div dangerouslySetInnerHTML={{ __html: afterHtml }} />
      </main>
      <Footer />
    </div>
  );
}
