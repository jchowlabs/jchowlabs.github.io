import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Typewriter from './Typewriter';
import CtaTypewriter from './CtaTypewriter';
import HomeLabs from './HomeLabs';

export default function HomePage() {
  return (
    <div className="page-wrapper home">
      <Header />

      {/* Hero */}
      <main data-nav-section="home">
        <h1>
          AI &amp; Security Advisory
          <br />
          <span className="subtitle">
            <Typewriter />
            <span className="cursor">_</span>
          </span>
        </h1>
        <a href="#" className="btn-main" id="home-cta">
          Get in touch
        </a>
      </main>

      {/* Insights + Research: 3x3 grid */}
      <section id="insights" data-nav-section="insights" className="home-section">
        <h2 className="home-section-title">Insights</h2>
        <hr className="home-section-divider" />
        <div className="home-insights-grid">

          <Link className="home-card" href="/insights/going-passwordless">
            <div className="home-card-img">
              <img src="/static/images/going-passwordless.png" alt="Going Passwordless" />
            </div>
            <div className="home-card-content">
              <h3>Passwordless in the Enterprise</h3>
              <p>Going passwordless isn&apos;t about eliminating every password. It&apos;s about reducing credential exposure by redesigning identity across the organization — focusing on real users and devices, sequencing deployments correctly, and treating enrollment and recovery as first-class authentication flows.</p>
              <div className="home-card-tags">
                <span className="home-card-tag">Passwordless</span>
                <span className="home-card-tag">Strategy</span>
                <span className="home-card-tag">Identity</span>
              </div>
            </div>
          </Link>

          <Link className="home-card" href="/insights/id-verification-ai-era">
            <div className="home-card-img">
              <img src="/static/images/deepfake.png" alt="Deepfake" />
            </div>
            <div className="home-card-content">
              <h3>Identity Verification in the AI Era</h3>
              <p>Deepfakes and AI-driven impersonation are eroding the assumptions traditional identity verification relies on. This article examines how organizations must rethink identity proofing, authentication, and trust when voice, video, documents, and digital presence can no longer be assumed real.</p>
              <div className="home-card-tags">
                <span className="home-card-tag">Identity</span>
                <span className="home-card-tag">Deepfake</span>
                <span className="home-card-tag">Trust</span>
              </div>
            </div>
          </Link>

          <Link className="home-card" href="/insights/risk-reward-agents">
            <div className="home-card-img">
              <img src="/static/images/ai-agent.png" alt="AI Agents" />
            </div>
            <div className="home-card-content">
              <h3>The Risk-Reward of AI Agents</h3>
              <p>AI agents promise real productivity gains, but introduce new risks around identity, access, and control. This article examines why agentic systems must be treated as identities, and what guardrails are required as agent adoption accelerates faster than security can keep up.</p>
              <div className="home-card-tags">
                <span className="home-card-tag">Zero Trust</span>
                <span className="home-card-tag">Observability</span>
                <span className="home-card-tag">Guardrails</span>
              </div>
            </div>
          </Link>

          <Link className="home-card" href="/insights/manipulating-factuality-llm">
            <div className="home-card-img">
              <img src="/static/images/rome.png" alt="ROME" />
            </div>
            <div className="home-card-content">
              <h3>Manipulating Factuality in LLMs</h3>
              <p>An exploration of how factual knowledge in large language models can be modified using Rank-One Model Editing (ROME). The article demonstrates how pairwise associations can be altered to change specific facts in generated responses, highlighting both corrective and adversarial use cases.</p>
              <div className="home-card-tags">
                <span className="home-card-tag">AI Security</span>
                <span className="home-card-tag">LLM</span>
                <span className="home-card-tag">Model Editing</span>
              </div>
            </div>
          </Link>

          <Link className="home-card" href="/insights/anatomy-phishing-attacks">
            <div className="home-card-img">
              <img src="/static/images/phishing.png" alt="Phishing" />
            </div>
            <div className="home-card-content">
              <h3>Anatomy of Phishing Attacks</h3>
              <p>A deep technical walkthrough of how modern phishing attacks actually succeed in the real world. This article breaks down phishing as a system-level failure rather than a user mistake, showing how attackers exploit legitimate authentication flows to capture and replay credentials, session cookies, and access tokens.</p>
              <div className="home-card-tags">
                <span className="home-card-tag">MitM</span>
                <span className="home-card-tag">Token Theft</span>
                <span className="home-card-tag">Defense</span>
              </div>
            </div>
          </Link>

          <Link className="home-card" href="/insights/shadow-ai-data-leakage">
            <div className="home-card-img">
              <img src="/static/images/data-leakage.png" alt="Data Leakage" />
            </div>
            <div className="home-card-content">
              <h3>Shadow AI is the new Data Leak</h3>
              <p>Unsanctioned AI usage and widespread LLM adoption are creating new data leakage paths for enterprises. This article explains how everyday AI workflows turn prompts into data egress points, which types of data are most at risk, and how organizations can restore visibility and control.</p>
              <div className="home-card-tags">
                <span className="home-card-tag">AI</span>
                <span className="home-card-tag">Data</span>
                <span className="home-card-tag">Governance</span>
              </div>
            </div>
          </Link>

          <Link className="home-card" href="/insights/reconstructing-biometric-data">
            <div className="home-card-img">
              <img src="/static/images/template-inversion.png" alt="Template Inversion" />
            </div>
            <div className="home-card-content">
              <h3>Reconstructing Biometric Data</h3>
              <p>Exploring how attackers can reverse-engineer biometric templates to reconstruct original data. The article examines template inversion attacks and discusses the privacy and security risks associated with improperly protected biometric systems.</p>
              <div className="home-card-tags">
                <span className="home-card-tag">Biometrics</span>
                <span className="home-card-tag">Template Attack</span>
                <span className="home-card-tag">Privacy</span>
              </div>
            </div>
          </Link>

          <Link className="home-card" href="/insights/golden-saml">
            <div className="home-card-img">
              <img src="/static/images/golden-saml-icon.png" alt="Golden SAML" />
            </div>
            <div className="home-card-content">
              <h3>Golden SAML: Bypassing SSO</h3>
              <p>Understanding how Golden SAML attacks forge authentication assertions to bypass identity providers. The article explains how compromised signing certificates enable attackers to mint legitimate authentication tokens that enable access across federated resources.</p>
              <div className="home-card-tags">
                <span className="home-card-tag">SAML</span>
                <span className="home-card-tag">SSO</span>
                <span className="home-card-tag">Token Forgery</span>
              </div>
            </div>
          </Link>

          <div className="home-card" style={{ cursor: 'default' }}>
            <div className="home-card-img">
              <img src="/static/images/tool-poisoning.png" alt="Tool Poisoning" />
            </div>
            <div className="home-card-content">
              <h3>AI Agent Tool Poisoning</h3>
              <p>As AI agents gain autonomy through tool and API integrations, the toolchain itself becomes an attack surface. This research analyzes how &ldquo;poisoned&rdquo; tools can influence agent decision-making and execution, resulting in unintended actions, lateral movement, or security breaches.</p>
              <div className="home-card-tags">
                <span className="home-card-tag">AI Agents</span>
                <span className="home-card-tag">Tool Poisoning</span>
                <span className="home-card-tag">Security</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Labs: horizontal carousel */}
      <section id="labs" data-nav-section="labs" className="home-section">
        <h2 className="home-section-title">Labs</h2>
        <hr className="home-section-divider" />
        <HomeLabs />
      </section>

      {/* CTA */}
      <section id="cta" className="home-section home-cta-section">
        <h2 className="home-cta-heading">
          <CtaTypewriter />
          <span className="cursor">_</span>
        </h2>
        <a href="#" className="btn-main" id="cta-btn">
          Get in touch
        </a>
      </section>

      <Footer />
    </div>
  );
}
