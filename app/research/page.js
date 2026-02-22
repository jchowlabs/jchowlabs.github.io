import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ResearchPage() {
  return (
    <div className="page-wrapper content-page listing-page listing-research">
      <Header />
      <main>
        <div className="articles-layout">
          <Link href="/research/anatomy-phishing-attacks" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="article-featured">
              <div className="article-featured-img">
                <img src="/static/images/phishing.png" alt="Phishing" />
              </div>
              <div className="article-featured-body">
                <span className="tag">Featured</span>
                <h3>Anatomy of Phishing Attacks</h3>
                <p>A deep dive into how phishing attacks operate under the hood, from initial lure creation to credential and access token capture and replay. The article walks through how common phishing techniques—including real-time man-in-the-middle attacks—are deployed in practice, illustrating how attackers gain unauthorized access by replaying stolen session material. It also explores defensive controls and architectural patterns that prevent credential theft, session hijacking, and token replay.</p>
                <div className="article-tags">
                  <span className="article-tag">Man-in-the-Middle</span>
                  <span className="article-tag">Token Theft</span>
                  <span className="article-tag">Session Hijacking</span>
                </div>
              </div>
            </div>
          </Link>

          <div className="articles-grid">
            <Link href="/research/manipulating-factuality-llm" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="article-compact">
                <div className="article-compact-img">
                  <img src="/static/images/rome.png" alt="ROME" />
                </div>
                <div className="article-compact-content">
                  <h3>Manipulating Factuality in LLMs</h3>
                  <p>An exploration of how factual knowledge in large language models can be modified using Rank-One Model Editing (ROME). The article demonstrates how pairwise associations can be altered to change specific facts in generated responses, highlighting both corrective and adversarial use cases.</p>
                  <div className="article-compact-tags">
                    <span className="article-compact-tag">AI Security</span>
                    <span className="article-compact-tag">LLM</span>
                    <span className="article-compact-tag">Model Editing</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/research/reconstructing-biometric-data" style={{ textDecoration: 'none', color: 'inherit' }} aria-label="Read: Reconstructing Biometric Data">
              <div className="article-compact">
                <div className="article-compact-img">
                  <img src="/static/images/template-inversion.png" alt="Template Inversion" />
                </div>
                <div className="article-compact-content">
                  <h3>Reconstructing Biometric Data</h3>
                  <p>Exploring how attackers can reverse-engineer biometric templates to reconstruct original data. The article examines template inversion attacks and discusses the privacy and security risks associated with improperly protected biometric systems.</p>
                  <div className="article-compact-tags">
                    <span className="article-compact-tag">Biometrics</span>
                    <span className="article-compact-tag">Template Attack</span>
                    <span className="article-compact-tag">Privacy</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/research/golden-saml" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="article-compact">
                <div className="article-compact-img">
                  <img src="/static/images/golden-saml-icon.png" alt="Golden SAML" />
                </div>
                <div className="article-compact-content">
                  <h3>Golden SAML: Bypassing SSO</h3>
                  <p>Understanding how Golden SAML attacks forge authentication assertions to bypass identity providers. The article explains how compromised signing certificates enable attackers to mint legitimate authentication tokens that enable access across federated resources.</p>
                  <div className="article-compact-tags">
                    <span className="article-compact-tag">SAML</span>
                    <span className="article-compact-tag">SSO</span>
                    <span className="article-compact-tag">Token Forgery</span>
                  </div>
                </div>
              </div>
            </Link>

            <div style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="article-compact">
                <div className="article-compact-img">
                  <img src="/static/images/tool-poisoning.png" alt="Tool Poisoning" />
                </div>
                <div className="article-compact-content">
                  <h3>AI Agent Tool Poisoning</h3>
                  <p>As AI agents gain autonomy through tool and API integrations, the toolchain itself becomes an attack surface. This research analyzes how &ldquo;poisoned&rdquo; tools can influence agent decision-making and execution, resulting in unintended actions, lateral movement, or security breaches.</p>
                  <div className="article-compact-tags">
                    <span className="article-compact-tag">AI Agents</span>
                    <span className="article-compact-tag">Tool Poisoning</span>
                    <span className="article-compact-tag">Security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
