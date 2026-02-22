import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LabPage() {
  return (
    <div className="page-wrapper content-page listing-page listing-lab">
      <Header />
      <main>
        <div className="articles-layout">
          <a href="/lab/passkey-demo.html" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="article-featured">
              <div className="article-featured-img">
                <img src="/static/images/passkey-icon.png" alt="Passkey Authentication" />
              </div>
              <div className="article-featured-body">
                <span className="tag">Featured</span>
                <h3>Passkeys: Interactive Demo</h3>
                <p>An interactive, step-by-step exploration of how passkey-based authentication works in practice. This lab visually breaks down passkey registration and authentication flows, showing on-device key generation, cryptographic challenge signing, and server-side verification as they occur. Rather than treating passkeys as a black box, the demo exposes the underlying operations and trust assumptions that replace passwords, helping practitioners understand why passkeys are phishing-resistant and how they fit into modern identity architectures.</p>
                <div className="article-tags">
                  <span className="article-tag">WebAuthn</span>
                  <span className="article-tag">Passkeys</span>
                  <span className="article-tag">Biometric Auth</span>
                </div>
              </div>
            </div>
          </a>

          <div className="articles-grid">
            <Link href="/lab/identity-provider-internals" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="article-compact">
                <div className="article-compact-img">
                  <img src="/static/images/idp.png" alt="Identity Provider" />
                </div>
                <div className="article-compact-content">
                  <h3>Identity Provider Internals</h3>
                  <p>Build a lightweight identity provider from scratch to explore how modern identity systems work under the hood. This lab covers the core building blocks behind dentity platforms used by large global enterprises, including directories, authentication flows, federation engines, and threat protection mechanisms.</p>
                  <div className="article-compact-tags">
                    <span className="article-compact-tag">Directory</span>
                    <span className="article-compact-tag">SAML</span>
                    <span className="article-compact-tag">Passkeys</span>
                    <span className="article-compact-tag">Biometrics</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/lab/password-vault-internals" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="article-compact">
                <div className="article-compact-img">
                  <img src="/static/images/password-vault.png" alt="Password Manager" />
                </div>
                <div className="article-compact-content">
                  <h3>Password Vault Internals</h3>
                  <p>A browser extension–based password management solution built from scratch, featuring end-to-end encryption, pseudo-random secret generation, and multi-factor authentication. This lab explores the architecture and security principles behind modern password vaults and how these systems operate in practice.</p>
                  <div className="article-compact-tags">
                    <span className="article-compact-tag">Encryption</span>
                    <span className="article-compact-tag">Security</span>
                    <span className="article-compact-tag">Password Vault</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/lab/face-verification-internals" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="article-compact">
                <div className="article-compact-img">
                  <img src="/static/images/facial-recognition.png" alt="Facial Recognition" />
                </div>
                <div className="article-compact-content">
                  <h3>Face Verification Internals</h3>
                  <p>Build a facial verification system from scratch to explore how identity verification systems work under the hood. This interactive lab examines biometric matching, liveness detection, and deepfake defenses, similar to those used in enterprise-grade identity verification platforms.</p>
                  <div className="article-compact-tags">
                    <span className="article-compact-tag">Biometrics</span>
                    <span className="article-compact-tag">Deepfake</span>
                    <span className="article-compact-tag">Liveness</span>
                  </div>
                </div>
              </div>
            </Link>

            <div style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="article-compact">
                <div className="article-compact-img">
                  <img src="/static/images/policy-guardrails.png" alt="AI Agent Guardrails" />
                </div>
                <div className="article-compact-content">
                  <h3>AI Agent Guardrails Internals</h3>
                  <p>Build guardrails for AI agents to understand how control and governance work in autonomous systems. This lab examines how agent instructions, tool access, and permissions translate into real capabilities, surfacing potential risk paths and unintended behavior before execution.</p>
                  <div className="article-compact-tags">
                    <span className="article-compact-tag">Governance</span>
                    <span className="article-compact-tag">Policy Engine</span>
                    <span className="article-compact-tag">AI Safety</span>
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
