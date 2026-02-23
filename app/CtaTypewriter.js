'use client';

import { useState, useEffect, useRef } from 'react';

const PHRASE = 'Need some help?';

export default function CtaTypewriter() {
  const [text, setText] = useState('');
  const charIndex = useRef(0);
  const isDeleting = useRef(false);
  const isPaused = useRef(false);

  useEffect(() => {
    let timer;

    function tick() {
      if (isPaused.current) {
        isPaused.current = false;
        timer = setTimeout(tick, 1500);
        return;
      }

      if (!isDeleting.current) {
        setText(PHRASE.substring(0, charIndex.current + 1));
        charIndex.current++;

        if (charIndex.current === PHRASE.length) {
          // Done — stay put with blinking cursor
          return;
        }
      } else {
        setText(PHRASE.substring(0, charIndex.current - 1));
        charIndex.current--;

        if (charIndex.current === 0) {
          isDeleting.current = false;
          isPaused.current = true;
          timer = setTimeout(tick, 80);
          return;
        }
      }

      timer = setTimeout(tick, isDeleting.current ? 50 : 100);
    }

    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, []);

  return <span id="cta-typewriter">{text}</span>;
}
