'use client';

import { useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

const labs = [
  {
    href: '/lab/passkey-demo',
    img: '/static/images/passkey-icon.png',
    alt: 'Passkey Authentication',
    title: 'Passkeys: Interactive Demo',
    summary:
      'An interactive, step-by-step exploration of how passkey-based authentication works in practice. This lab visually breaks down passkey registration and authentication flows, showing on-device key generation, cryptographic challenge signing, and server-side verification as they occur.',
    tags: ['WebAuthn', 'Passkeys', 'Biometric Auth'],
  },
  {
    href: '/lab/identity-provider-internals',
    img: '/static/images/idp.png',
    alt: 'Identity Provider',
    title: 'Identity Provider Internals',
    summary:
      'Build a lightweight identity provider from scratch to explore how modern identity systems work under the hood. This lab covers the core building blocks behind identity platforms used by large global enterprises, including directories, authentication flows, federation engines, and threat protection mechanisms.',
    tags: ['Directory', 'SAML', 'Passkeys', 'Biometrics'],
  },
  {
    href: '/lab/password-vault-internals',
    img: '/static/images/password-vault.png',
    alt: 'Password Manager',
    title: 'Password Vault Internals',
    summary:
      'A browser extension\u2013based password management solution built from scratch, featuring end-to-end encryption, pseudo-random secret generation, and multi-factor authentication. This lab explores the architecture and security principles behind modern password vaults and how these systems operate in practice.',
    tags: ['Encryption', 'Security', 'Password Vault'],
  },
  {
    href: '/lab/face-verification-internals',
    img: '/static/images/facial-recognition.png',
    alt: 'Facial Recognition',
    title: 'Face Verification Internals',
    summary:
      'Build a facial verification system from scratch to explore how identity verification systems work under the hood. This interactive lab examines biometric matching, liveness detection, and deepfake defenses, similar to those used in enterprise-grade identity verification platforms.',
    tags: ['Biometrics', 'Deepfake', 'Liveness'],
  },
  {
    href: null,
    img: '/static/images/policy-guardrails.png',
    alt: 'AI Agent Guardrails',
    title: 'AI Agent Guardrails Internals',
    summary:
      'Build guardrails for AI agents to understand how control and governance work in autonomous systems. This lab examines how agent instructions, tool access, and permissions translate into real capabilities, surfacing potential risk paths and unintended behavior before execution.',
    tags: ['Governance', 'Policy Engine', 'AI Safety'],
    imgStyle: { maxWidth: '110px', maxHeight: '110px' },
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
            <Link
              key={lab.title}
              href={lab.href}
              className="home-lab-card"
            >
              {inner}
            </Link>
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
