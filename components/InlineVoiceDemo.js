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

import { useState, useEffect, useCallback } from 'react';

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

  /* ---- expose toggle control for voice assistant ---- */
  const flipToggle = useCallback(
    (desired) => {
      if (variant !== 'toggle') return { success: false, reason: 'not a toggle instance' };
      const next =
        desired === 'on' ? true : desired === 'off' ? false : !toggleOn;
      setToggleOn(next);
      return { success: true, newState: next ? 'on' : 'off' };
    },
    [variant, toggleOn],
  );

  useEffect(() => {
    if (variant !== 'toggle') return;
    if (!window.__voiceDemoActions) window.__voiceDemoActions = {};
    window.__voiceDemoActions.setToggle = flipToggle;
    return () => {
      if (window.__voiceDemoActions) {
        delete window.__voiceDemoActions.setToggle;
        if (Object.keys(window.__voiceDemoActions).length === 0) {
          delete window.__voiceDemoActions;
        }
      }
    };
  }, [variant, flipToggle]);

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
        <div className="voice-steps voice-steps-inline">
          <div className="voice-step">
            <span className="voice-step-num">1</span>
            <span className="voice-step-label">Ask what position the toggle is in</span>
          </div>
          <div className="voice-step">
            <span className="voice-step-num">2</span>
            <span className="voice-step-label">Flip the toggle, then ask again</span>
          </div>
          <div className="voice-step">
            <span className="voice-step-num">3</span>
            <span className="voice-step-label">Ask the assistant to turn the toggle on</span>
          </div>
        </div>
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
        <div className="voice-steps voice-steps-inline">
          <div className="voice-step">
            <span className="voice-step-num">1</span>
            <span className="voice-step-label">Type your name in the field above</span>
          </div>
          <div className="voice-step">
            <span className="voice-step-num">2</span>
            <span className="voice-step-label">Ask the assistant what you typed</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
