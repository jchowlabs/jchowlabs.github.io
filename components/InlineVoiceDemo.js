'use client';

/**
 * InlineVoiceDemo — Lightweight inline demo for the Interactive Voice
 * Assistant article.  Accepts a `variant` prop:
 *   "toggle" — renders a centred toggle switch (notifications)
 *   "text"   — renders a centred name input field
 *
 * Each instance syncs its own piece of window.__voiceDemo so the voice
 * assistant can read live values via the get_current_page client tool.
 */

import { useState, useEffect } from 'react';

const NAME_MAX_LENGTH = 50;

export default function InlineVoiceDemo({ variant }) {
  const [toggleOn, setToggleOn] = useState(false);
  const [nameValue, setNameValue] = useState('');

  /* ---- sanitize free-text input ---- */
  const handleNameChange = (e) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/[^a-zA-Z\s\-']/g, '').slice(0, NAME_MAX_LENGTH);
    setNameValue(cleaned);
  };

  /* ---- sync own slice to window.__voiceDemo ---- */
  useEffect(() => {
    if (!window.__voiceDemo) window.__voiceDemo = {};

    if (variant === 'toggle') {
      window.__voiceDemo.notificationsToggle = toggleOn ? 'on' : 'off';
    }
    if (variant === 'text') {
      window.__voiceDemo.textInput = nameValue.trim() || '';
    }

    return () => {
      if (window.__voiceDemo) {
        if (variant === 'toggle') delete window.__voiceDemo.notificationsToggle;
        if (variant === 'text') delete window.__voiceDemo.textInput;
        if (Object.keys(window.__voiceDemo).length === 0) {
          delete window.__voiceDemo;
        }
      }
    };
  }, [variant, toggleOn, nameValue]);

  /* ---- Toggle variant ---- */
  if (variant === 'toggle') {
    return (
      <div className="ivd-card">
        <div className="ivd-setting-row">
          <div className="ivd-setting-label">
            <span className="ivd-setting-title">Notifications</span>
            <span className={`ivd-setting-status ${toggleOn ? 'ivd-state-on' : 'ivd-state-off'}`}>
              {toggleOn ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <button
            className={`ivd-toggle ${toggleOn ? 'ivd-toggle-on' : 'ivd-toggle-off'}`}
            onClick={() => setToggleOn((v) => !v)}
            aria-pressed={toggleOn}
            role="switch"
          >
            <span className="ivd-toggle-knob" />
          </button>
        </div>
        <p className="ivd-prompt">
          Try asking the assistant: <em>&ldquo;Is the toggle on or off?&rdquo;</em>
        </p>
      </div>
    );
  }

  /* ---- Text variant ---- */
  if (variant === 'text') {
    return (
      <div className="ivd-card">
        <div className="ivd-field">
          <input
            id="ivd-name-input"
            className="ivd-text-input"
            type="text"
            placeholder="Type your name..."
            maxLength={NAME_MAX_LENGTH}
            value={nameValue}
            onChange={handleNameChange}
            autoComplete="off"
          />
        </div>
        <p className="ivd-prompt">
          Try asking the assistant: <em>&ldquo;What did I type?&rdquo;</em>
        </p>
      </div>
    );
  }

  return null;
}
