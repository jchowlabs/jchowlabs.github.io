'use client';

/**
 * jchowlabs Voice Assistant — ElevenLabs Conversational AI
 *
 * Single-orb pill UI with volume-reactive animation.
 * States: idle → connecting → listening / speaking → idle
 * Error state: "Unavailable" (auto-recovers after 4s)
 *
 * Agent configuration (system prompt, voice, tools, LLM) lives
 * entirely on the ElevenLabs dashboard — no server/proxy needed.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

const AGENT_ID = 'agent_9901kj9dzjy3esqvjfs4z9xm5dfv';

export default function Chatbot() {
  const router = useRouter();
  const conversationRef = useRef(null);
  const animFrameRef = useRef(null);
  const currentScaleRef = useRef(1);
  const orbRef = useRef(null);
  const endingRef = useRef(false);

  const [consentGranted, setConsentGranted] = useState(false);
  const [status, setStatus] = useState('idle');
  // idle | connecting | listening | speaking | error

  /* ---------------------------------------------------------- */
  /* Cookie consent gate                                        */
  /* ---------------------------------------------------------- */

  useEffect(() => {
    try {
      const consent = JSON.parse(localStorage.getItem('cookieConsent') || 'null');
      if (consent?.analytics === true) setConsentGranted(true);
    } catch {}

    const onConsent = () => setConsentGranted(true);
    window.addEventListener('analytics-consent-granted', onConsent);
    return () => window.removeEventListener('analytics-consent-granted', onConsent);
  }, []);

  /* ---------------------------------------------------------- */
  /* Volume-reactive orb (rAF loop)                             */
  /* ---------------------------------------------------------- */

  const startVolumeMonitor = useCallback(() => {
    currentScaleRef.current = 1;

    const tick = () => {
      const conv = conversationRef.current;
      const orb = orbRef.current;
      if (!conv || !orb) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      let volume = 0;
      try {
        const out = typeof conv.getOutputVolume === 'function' ? conv.getOutputVolume() : 0;
        const inp = typeof conv.getInputVolume === 'function' ? conv.getInputVolume() : 0;
        volume = Math.max(out, inp);
      } catch {}

      // Subtle baseline breathing (sine wave ≈ 0.97 – 1.03)
      const breathing = 0.03 * Math.sin(Date.now() / 400);
      // Volume-driven boost (0 – 0.25)
      const boost = volume * 0.25;
      const target = 1 + breathing + boost;

      // Smooth interpolation toward target
      currentScaleRef.current += (target - currentScaleRef.current) * 0.18;
      orb.style.transform = `scale(${currentScaleRef.current.toFixed(4)})`;

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const stopVolumeMonitor = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (orbRef.current) {
      orbRef.current.style.transform = '';
    }
    currentScaleRef.current = 1;
  }, []);

  /* ---------------------------------------------------------- */
  /* End session                                                 */
  /* ---------------------------------------------------------- */

  const endSession = useCallback(async () => {
    stopVolumeMonitor();
    const conv = conversationRef.current;
    conversationRef.current = null;
    endingRef.current = false;
    if (conv) {
      try { await conv.endSession(); } catch {}
    }
    setStatus('idle');
  }, [stopVolumeMonitor]);

  /* ---------------------------------------------------------- */
  /* Start session                                               */
  /* ---------------------------------------------------------- */

  const startSession = useCallback(async () => {
    if (conversationRef.current) return;
    setStatus('connecting');
    endingRef.current = false;

    try {
      // Dynamic import avoids SSR issues with audio APIs
      const { Conversation } = await import('@elevenlabs/client');

      const conversation = await Conversation.startSession({
        agentId: AGENT_ID,

        onConnect: () => {
          setStatus('listening');
          startVolumeMonitor();
        },

        onDisconnect: () => {
          // Server-side or agent-initiated disconnect.
          // If the agent was speaking, delay cleanup so buffered audio
          // finishes playing instead of cutting off mid-word.
          const wasSpeaking = conversationRef.current &&
            (document.querySelector('.va-pill.speaking') !== null);

          const cleanup = () => {
            conversationRef.current = null;
            stopVolumeMonitor();
            setStatus('idle');
          };

          if (wasSpeaking) {
            // Keep audio alive briefly so the final sentence completes
            setTimeout(cleanup, 2500);
          } else {
            cleanup();
          }
        },

        onModeChange: ({ mode }) => {
          // mode: 'speaking' (agent talking) | 'listening' (agent listening)
          setStatus(mode === 'speaking' ? 'speaking' : 'listening');

          // If agent just finished speaking its farewell, end the session
          if (mode === 'listening' && endingRef.current) {
            endSession();
          }
        },

        onStatusChange: ({ status: s }) => {
          if (s === 'connecting') setStatus('connecting');
        },

        onError: (message) => {
          console.error('ElevenLabs error:', message);
          conversationRef.current = null;
          stopVolumeMonitor();
          setStatus('error');
          setTimeout(() => setStatus('idle'), 4000);
        },

        clientTools: {
          navigate: async ({ url }) => {
            // Close contact modal if open before navigating
            if (typeof window.closeContactModal === 'function') {
              window.closeContactModal();
            }
            let clean = url.replace(/\.html$/, '');
            if (clean === '/index') clean = '/';
            // Hash routes (e.g. /#insights, /#labs) — use client-side nav
            // to avoid full page reload which kills the voice session
            if (clean.includes('#')) {
              const [path, hash] = clean.split('#');
              const target = path || '/';
              // Navigate to the page first (client-side), then scroll to anchor
              router.push(target);
              setTimeout(() => {
                const el = document.getElementById(hash);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 300);
            } else {
              router.push(clean);
            }
            return 'Navigated successfully';
          },

          open_contact: async () => {
            if (typeof window.openContactModal === 'function') {
              window.openContactModal();
            }
            return 'Contact form opened';
          },

          end_session: async () => {
            // Mark session as ending; actual disconnect happens in onModeChange
            // once the agent finishes speaking its farewell
            endingRef.current = true;
            // Safety fallback in case onModeChange never fires
            setTimeout(() => {
              if (endingRef.current) endSession();
            }, 8000);
            return 'Session ending';
          },
        },
      });

      conversationRef.current = conversation;
    } catch (err) {
      console.error('Failed to start voice session:', err);
      stopVolumeMonitor();
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  }, [router, startVolumeMonitor, stopVolumeMonitor, endSession]);

  /* ---------------------------------------------------------- */
  /* Cleanup on unmount                                          */
  /* ---------------------------------------------------------- */

  useEffect(() => {
    return () => {
      stopVolumeMonitor();
      if (conversationRef.current) {
        conversationRef.current.endSession().catch(() => {});
        conversationRef.current = null;
      }
    };
  }, [stopVolumeMonitor]);

  /* ---------------------------------------------------------- */
  /* Handlers                                                    */
  /* ---------------------------------------------------------- */

  const handlePillClick = useCallback(() => {
    if (status === 'idle') startSession();
  }, [status, startSession]);

  const handleClose = useCallback((e) => {
    e.stopPropagation();
    endSession();
  }, [endSession]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePillClick();
    }
  }, [handlePillClick]);

  /* ---------------------------------------------------------- */
  /* Render                                                      */
  /* ---------------------------------------------------------- */

  // Don't render pill until cookie consent is granted
  if (!consentGranted) return null;

  const isActive = status === 'listening' || status === 'speaking';
  const isConnecting = status === 'connecting';

  const pillClass = [
    'va-pill',
    (isActive || isConnecting) ? 'active' : '',
    isConnecting ? 'connecting' : '',
    status === 'speaking' ? 'speaking' : '',
    status === 'error' ? 'error' : '',
  ].filter(Boolean).join(' ');

  const label = {
    idle: 'Voice chat',
    connecting: 'Connecting…',
    listening: 'Listening…',
    speaking: 'Speaking…',
    error: 'Unavailable',
  }[status];

  return (
    <div
      className={pillClass}
      role="button"
      tabIndex={0}
      aria-label={
        isActive ? 'Voice assistant active' :
        status === 'error' ? 'Voice assistant unavailable' :
        'Open voice assistant'
      }
      onClick={handlePillClick}
      onKeyDown={handleKeyDown}
    >
      <div className="va-pill-orb" ref={orbRef} />
      <span className="va-pill-label">{label}</span>
      <button
        className="va-pill-close"
        onClick={handleClose}
        aria-label="End session"
      >
        &times;
      </button>
    </div>
  );
}
