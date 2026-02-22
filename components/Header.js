'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const openModal = (e) => {
    e.preventDefault();
    closeMenu();
    if (typeof window !== 'undefined' && window.openContactModal) {
      window.openContactModal();
    }
  };

  return (
    <header>
      <Link href="/" className="brand" aria-label="jchowlabs home">
        <img src="/static/images/jchowlabs-logo.png" alt="jchowlabs" />
      </Link>
      <button
        className={`hamburger${menuOpen ? ' active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav className={menuOpen ? 'active' : ''}>
        <ul>
          <li>
            <Link href="/" className={isActive('/') && pathname === '/' ? 'active' : ''} onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/insights" className={isActive('/insights') ? 'active' : ''} onClick={closeMenu}>
              Insights
            </Link>
          </li>
          <li>
            <Link href="/research" className={isActive('/research') ? 'active' : ''} onClick={closeMenu}>
              Research
            </Link>
          </li>
          <li>
            <Link href="/lab" className={isActive('/lab') ? 'active' : ''} onClick={closeMenu}>
              Lab
            </Link>
          </li>
          <li>
            <Link href="/events" className={isActive('/events') ? 'active' : ''} onClick={closeMenu}>
              Events
            </Link>
          </li>
          <li>
            <a href="#" onClick={openModal} className="contact-icon" aria-label="Contact">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
