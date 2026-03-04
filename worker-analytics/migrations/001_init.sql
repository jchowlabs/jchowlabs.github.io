-- Migration: 001_init.sql
-- Creates the analytics schema and pre-seeds tracked content

-- ============================================================
-- Events table — stores every page view and lab usage event
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,            -- 'page_view' or 'lab_usage'
    slug TEXT NOT NULL,                  -- '/insights/passkeys-101' or 'passkey-demo'
    session_id TEXT,                     -- anonymous session identifier
    ip_country TEXT,                     -- from CF headers, no raw IP stored
    referrer TEXT,                       -- where they came from
    user_agent TEXT,                     -- for bot detection
    is_bot INTEGER DEFAULT 0,           -- 1 if detected as bot
    bot_category TEXT,                   -- 'ai_agent', 'crawler', 'headless_browser', null
    timestamp INTEGER NOT NULL,          -- Unix ms
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_bot ON events(is_bot);

-- ============================================================
-- Tracked content — manages which pages/labs appear on dashboard
-- ============================================================
CREATE TABLE IF NOT EXISTS tracked_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_type TEXT NOT NULL,          -- 'page' or 'lab'
    slug TEXT NOT NULL UNIQUE,           -- URL path or lab identifier
    title TEXT NOT NULL,                 -- Display name
    status TEXT DEFAULT 'active',        -- 'active', 'archived'
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    archived_at DATETIME
);

CREATE INDEX idx_tracked_content_type ON tracked_content(content_type);
CREATE INDEX idx_tracked_content_status ON tracked_content(status);

-- ============================================================
-- Pre-seed: All current pages
-- ============================================================

-- Home
INSERT INTO tracked_content (content_type, slug, title) VALUES
  ('page', '/', 'Home');

-- Events
INSERT INTO tracked_content (content_type, slug, title) VALUES
  ('page', '/events', 'Events');

-- Insights
INSERT INTO tracked_content (content_type, slug, title) VALUES
  ('page', '/insights/2026-security-trends', '6 Security Trends Shaping 2026'),
  ('page', '/insights/ai-agent-tool-poisoning', 'AI Agent Tool Poisoning'),
  ('page', '/insights/anatomy-phishing-attacks', 'Anatomy of a Phishing Attack'),
  ('page', '/insights/face-verification-internals', 'Face Verification System Internals'),
  ('page', '/insights/going-passwordless', 'Passwordless in the Enterprise'),
  ('page', '/insights/golden-saml', 'Golden SAML: Bypassing SSO'),
  ('page', '/insights/id-verification-ai-era', 'Identity Verification in the AI Era'),
  ('page', '/insights/identity-provider-internals', 'Identity Provider Internals'),
  ('page', '/insights/manipulating-factuality-llm', 'Manipulating Factuality in LLMs Using ROME'),
  ('page', '/insights/password-vault-internals', 'Password Vault Internals'),
  ('page', '/insights/reconstructing-biometric-data', 'Reconstructing Biometric Data'),
  ('page', '/insights/risk-reward-agents', 'Risk and Reward of AI Agents'),
  ('page', '/insights/shadow-ai-data-leakage', 'Shadow AI is the new Data Leak');

-- Lab pages (as pages — they have page views)
INSERT INTO tracked_content (content_type, slug, title) VALUES
  ('page', '/lab/passkey-demo', 'Passkey Playground'),
  ('page', '/lab/cryptography-behind-passkeys', 'Passkey Cryptography'),
  ('page', '/lab/facial-liveness-verification', 'Facial Liveness Verification'),
  ('page', '/lab/browser-fingerprinting', 'Browser Fingerprinting'),
  ('page', '/lab/interactive-voice-assistant', 'Interactive Voice Assistant'),
  ('page', '/lab/securing-chatbots', 'Securing AI Chatbots'),
  ('page', '/lab/aftercheck', 'The Story Behind AfterCheck'),
  ('page', '/lab/openbounty', 'Building a Pricing Engine from Scratch');

-- Labs (as lab entries — they track lab_usage events)
INSERT INTO tracked_content (content_type, slug, title) VALUES
  ('lab', 'passkey-demo', 'Passkey Playground'),
  ('lab', 'cryptography-behind-passkeys', 'Passkey Cryptography'),
  ('lab', 'facial-liveness-verification', 'Facial Liveness Verification'),
  ('lab', 'browser-fingerprinting', 'Browser Fingerprinting'),
  ('lab', 'interactive-voice-assistant', 'Interactive Voice Assistant'),
  ('lab', 'vulnerable-chatbot', 'Vulnerable Chatbot'),
  ('lab', 'secured-chatbot', 'Secured Chatbot');
