import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function InsightsPage() {
  return (
    <div className="page-wrapper content-page listing-page listing-insights">
      <Header />
      <main>
        <div className="articles-layout">
          <Link href="/insights/going-passwordless" aria-label="Read: The Enterprise Guide to Going Passwordless">
            <div className="article-featured">
              <div className="article-featured-img">
                <img src="/static/images/going-passwordless.png" alt="Going Passwordless" />
              </div>
              <div className="article-featured-body">
                <span className="tag">Featured</span>
                <h3>The Practioner&apos;s Guide to Going Passwordless</h3>
                <p>When organizations pursue passwordless authentication, success is often framed as eliminating every password across the enterprise — an unrealistic goal that frequently leads to stalled or failed deployments. In practice, going passwordless is about reducing credential exposure by redesigning identity end-to-end: understanding real users and devices, focusing on where risk actually lives, sequencing deployments correctly, and treating enrollment and recovery as first-class authentication flows. Drawing on lessons from hundreds of real-world implementations, this practitioner&apos;s guide focuses on what works in production, where teams get tripped up, and how to approach passwordless as an ongoing operating model rather than a one-time technology rollout.</p>
                <div className="article-tags">
                  <span className="article-tag">Passwordless</span>
                  <span className="article-tag">Strategy</span>
                  <span className="article-tag">Governance</span>
                  <span className="article-tag">Risk</span>
                  <span className="article-tag">Transformation</span>
                </div>
              </div>
            </div>
          </Link>

          <div className="articles-grid">
            <Link className="article-compact" href="/insights/id-verification-ai-era" aria-label="Read: ID Verification in the AI Era">
              <div className="article-compact-img">
                <img src="/static/images/deepfake.png" alt="Deepfake" />
              </div>
              <div className="article-compact-content">
                <h3>Identity Verification in the AI Era</h3>
                <p>Deepfakes and AI-driven impersonation are eroding the assumptions traditional identity verification relies on. This article examines how organizations must rethink identity proofing, authentication, and trust when voice, video, documents, and digital presence can no longer be assumed real.</p>
                <div className="article-compact-tags">
                  <span className="article-compact-tag">Identity</span>
                  <span className="article-compact-tag">Deepfake</span>
                  <span className="article-compact-tag">Trust</span>
                </div>
              </div>
            </Link>

            <Link className="article-compact" href="/insights/risk-reward-agents" aria-label="Read: The Risk-Reward of AI Agents">
              <div className="article-compact-img">
                <img src="/static/images/ai-agent.png" alt="AI Agents" />
              </div>
              <div className="article-compact-content">
                <h3>The Risk-Reward of AI Agents</h3>
                <p>AI agents promise real productivity gains, but introduce new risks around identity, access, and control. This article examines why agentic systems must be treated as identities, and what guardrails are required as agent adoption accelerates faster than security can keep up.</p>
                <div className="article-compact-tags">
                  <span className="article-compact-tag">Zero Trust</span>
                  <span className="article-compact-tag">Observability</span>
                  <span className="article-compact-tag">Guardrails</span>
                </div>
              </div>
            </Link>

            <Link className="article-compact" href="/insights/shadow-ai-data-leakage" aria-label="Read: Shadow AI &amp; Data Leakage">
              <div className="article-compact-img">
                <img src="/static/images/data-leakage.png" alt="Data Leakage" />
              </div>
              <div className="article-compact-content">
                <h3>Shadow AI is the new Data Leak</h3>
                <p>Unsanctioned AI usage and widespread LLM adoption are creating new data leakage paths for enterprises. This article explains how everyday AI workflows turn prompts into data egress points, which types of data are most at risk, and how organizations can restore visibility and control.</p>
                <div className="article-compact-tags">
                  <span className="article-compact-tag">AI</span>
                  <span className="article-compact-tag">Data</span>
                  <span className="article-compact-tag">Governance</span>
                </div>
              </div>
            </Link>

            <Link className="article-compact" href="/insights/2026-security-trends" aria-label="Read: 5 Security Trends Shaping 2026">
              <div className="article-compact-img">
                <img src="/static/images/trends.png" alt="Security Trends" />
              </div>
              <div className="article-compact-content">
                <h3>6 Security Trends Shaping 2026</h3>
                <p>Key security trends reshaping how organizations think about identity, AI, resilience, and risk in 2026. This article explores why architecture, automation, and governance matter more than individual tools and what leaders should prioritize in 2026 and the years ahead.</p>
                <div className="article-compact-tags">
                  <span className="article-compact-tag">AI</span>
                  <span className="article-compact-tag">Identity</span>
                  <span className="article-compact-tag">Architecture</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
