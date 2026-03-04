'use client';

import { useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

const labs = [
  {
    href: '/lab/passkey-demo',
    img: '/static/images/passkey-icon.png',
    alt: 'Passkey Authentication',
    title: 'Passkeys: Interactive Demo',
    status: 'live',
    summary:
      'An interactive, step-by-step exploration of how passkey-based authentication works in practice. This lab visually breaks down passkey registration and authentication flows, showing on-device key generation, cryptographic challenge signing, and server-side verification as they occur.',
    tags: ['WebAuthn', 'Passkeys', 'Biometric Auth'],
  },
  {
    href: '/lab/securing-chatbots',
    img: '/static/images/policy-guardrails.png',
    alt: 'Securing AI Chatbots',
    title: 'Securing AI Chatbots',
    status: 'live',
    summary:
      'An interactive lab featuring a vulnerable and a secured AI support chatbot. Explore how LLM-powered agents can be manipulated through enumeration, social engineering, and cross-account attacks — then see how backend guardrails like input scanning, tool-level authorization, and output filtering defend against the same exploits.',
    tags: ['AI Safety', 'LLM Security', 'Guardrails'],
    imgStyle: { maxWidth: '110px', maxHeight: '110px' },
  },
  {
    href: '/lab/interactive-voice-assistant',
    img: '/static/images/voice-concierge.png',
    alt: 'Interactive Voice Assistant',
    title: 'Interactive Voice Assistant',
    status: 'live',
    summary:
      'Build an autonomous voice concierge that helps users understand and navigate a website through natural conversation. This lab covers real-time speech synthesis, intent recognition, contextual response generation, and seamless integration with site content and navigation.',
    tags: ['Voice AI', 'Speech', 'Conversational UI'],
  },
  {
    href: '/lab/facial-liveness-verification',
    img: '/static/images/facial-liveness-verification.png',
    alt: 'Facial Liveness Verification',
    title: 'Facial Liveness Verification',
    status: 'live',
    summary:
      'An interactive lab exploring how facial verification systems distinguish a live human from a spoofed image, video, or mask. This lab covers passive and active liveness techniques, depth estimation, challenge-response prompts, and texture analysis used to defend against presentation attacks.',
    tags: ['Biometrics', 'Liveness', 'Anti-Spoofing'],
  },
  {
    href: '/lab/browser-exposure',
    img: '/static/images/finger-printing.png',
    alt: 'Browser Exposure Report',
    title: 'Browser Exposure Report',
    status: 'live',
    summary:
      'See what your browser silently reveals to every website you visit. Run an instant audit of your digital fingerprint, network identity, and tracking surface — covering canvas and audio fingerprints, installed fonts, GPU details, permissions, and more. Adjust your settings and run it again to see what changed.',
    tags: ['Fingerprinting', 'Privacy', 'Client Security'],
  },
  {
    href: null,
    img: '/static/images/caep.png',
    alt: 'CAEP Interactive Demo',
    title: 'CAEP: Interactive Demo',
    status: 'coming-soon',
    summary:
      'An interactive introduction to the Continuous Access Evaluation Protocol (CAEP) and how it enables real-time session revocation across applications. This lab walks through CAEP event flows and lets you trigger a live credential-change event that instantly terminates an active session on a paired application.',
    tags: ['CAEP', 'Session Security', 'Zero Trust'],
  },
];

export default function HomeLabs() {
  const trackRef = useRef(null);
  const timerRef = useRef(null);
  const stoppedRef = useRef(false);   // true once user clicks an arrow

  const scroll = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.firstElementChild?.offsetWidth ?? 360;
    track.scrollBy({ left: dir * (cardWidth + 34), behavior: 'smooth' });
  };

  // Soft scroll with custom easing (easeInOutCubic, ~800ms)
  const smoothScrollTo = useCallback((track, targetLeft) => {
    const start = track.scrollLeft;
    const distance = targetLeft - start;
    const duration = 800;
    let startTime = null;

    const ease = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      track.scrollLeft = start + distance * ease(progress);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, []);

  const autoAdvance = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    // If at (or near) the end, rewind to start
    if (track.scrollLeft >= maxScroll - 5) {
      smoothScrollTo(track, 0);
    } else {
      const cardWidth = track.firstElementChild?.offsetWidth ?? 360;
      smoothScrollTo(track, track.scrollLeft + cardWidth + 34);
    }
  }, [smoothScrollTo]);

  const startTimer = useCallback(() => {
    if (stoppedRef.current) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(autoAdvance, 5000);
  }, [autoAdvance]);

  const pauseTimer = useCallback(() => {
    clearInterval(timerRef.current);
  }, []);

  // Start auto-scroll when component mounts (desktop only)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    if (mq.matches) return;           // stacked on mobile, no auto-scroll

    startTimer();

    const track = trackRef.current;
    if (track) {
      track.addEventListener('mouseenter', pauseTimer);
      track.addEventListener('mouseleave', startTimer);
    }

    const handleResize = () => {
      if (mq.matches) pauseTimer();
      else startTimer();
    };
    mq.addEventListener('change', handleResize);

    return () => {
      clearInterval(timerRef.current);
      if (track) {
        track.removeEventListener('mouseenter', pauseTimer);
        track.removeEventListener('mouseleave', startTimer);
      }
      mq.removeEventListener('change', handleResize);
    };
  }, [startTimer, pauseTimer]);

  const handleArrowClick = (dir) => {
    stoppedRef.current = true;        // permanently stop auto-scroll
    clearInterval(timerRef.current);
    scroll(dir);
  };

  return (
    <div className="home-labs-wrapper">
      <button
        className="home-labs-arrow prev"
        onClick={() => handleArrowClick(-1)}
        aria-label="Scroll left"
      >
        &#8249;
      </button>

      <div className="home-labs-track" ref={trackRef}>
        {labs.map((lab) => {
          const inner = (
            <>
              <div className="home-lab-card-img">
                <img src={lab.img} alt={lab.alt} style={lab.imgStyle || {}} />
              </div>
              <div className="home-lab-card-body">
                {lab.status === 'live' && (
                  <span className="lab-status-badge live">Live</span>
                )}
                {lab.status === 'coming-soon' && (
                  <span className="lab-status-badge coming-soon">Coming Soon</span>
                )}
                <h3>{lab.title}</h3>
                <p>{lab.summary}</p>
                <div className="home-lab-card-tags">
                  {lab.tags.map((t) => (
                    <span key={t} className="home-lab-card-tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </>
          );

          return lab.href ? (
            lab.external ? (
              <a
                key={lab.title}
                href={lab.href}
                target="_blank"
                rel="noopener noreferrer"
                className="home-lab-card"
              >
                {inner}
              </a>
            ) : (
              <Link
                key={lab.title}
                href={lab.href}
                className="home-lab-card"
              >
                {inner}
              </Link>
            )
          ) : (
            <div
              key={lab.title}
              className="home-lab-card"
              style={{ cursor: 'default' }}
            >
              {inner}
            </div>
          );
        })}
      </div>

      <button
        className="home-labs-arrow next"
        onClick={() => handleArrowClick(1)}
        aria-label="Scroll right"
      >
        &#8250;
      </button>
    </div>
  );
}
