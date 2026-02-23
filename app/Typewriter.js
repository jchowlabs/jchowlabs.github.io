'use client';

import { useState, useEffect, useRef } from 'react';

const WORDS = ['Accelerating AI Adoption', 'Modernizing Security', 'Vendor Agnostic'];

export default function Typewriter() {
  const [text, setText] = useState('');
  const wordIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);
  const isPaused = useRef(false);

  useEffect(() => {
    // Also wire up the CTA buttons to open the contact modal
    const cta = document.getElementById('home-cta');
    if (cta) {
      cta.onclick = (e) => {
        e.preventDefault();
        if (window.openContactModal) window.openContactModal();
      };
    }
    const ctaBtn = document.getElementById('cta-btn');
    if (ctaBtn) {
      ctaBtn.onclick = (e) => {
        e.preventDefault();
        if (window.openContactModal) window.openContactModal();
      };
    }

    let timer;

    function tick() {
      const currentWord = WORDS[wordIndex.current];

      if (isPaused.current) {
        isPaused.current = false;
        timer = setTimeout(tick, 1200);
        return;
      }

      if (!isDeleting.current) {
        setText(currentWord.substring(0, charIndex.current + 1));
        charIndex.current++;

        if (charIndex.current === currentWord.length) {
          isDeleting.current = true;
          isPaused.current = true;
          timer = setTimeout(tick, 1500);
          return;
        }
        timer = setTimeout(tick, 60);
      } else {
        setText(currentWord.substring(0, charIndex.current - 1));
        charIndex.current--;

        if (charIndex.current === 0) {
          isDeleting.current = false;
          wordIndex.current = (wordIndex.current + 1) % WORDS.length;
          timer = setTimeout(tick, 500);
          return;
        }
        timer = setTimeout(tick, 30);
      }
    }

    timer = setTimeout(tick, 1000);
    return () => clearTimeout(timer);
  }, []);

  return <span id="typewriter">{text}</span>;
}
