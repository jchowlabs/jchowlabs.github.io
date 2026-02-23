'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  // On home page, observe sections to set active nav highlight
  useEffect(() => {
    if (!isHome) { setActiveSection(null); return; }
    const sections = document.querySelectorAll('[data-nav-section]');
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute('data-nav-section'));
          }
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [isHome]);

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const scrollTo = (e, id) => {
    e.preventDefault();
    closeMenu();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const openModal = (e) => {
    e.preventDefault();
    closeMenu();
    if (typeof window !== 'undefined' && window.openContactModal) {
      window.openContactModal();
    }
  };

  // Determine active state for nav items
  const homeActive = isHome && (!activeSection || activeSection === 'home');
  const insightsActive = isHome ? activeSection === 'insights' : isActive('/insights');
  const labActive = isHome ? activeSection === 'labs' : isActive('/lab');

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
            {isHome ? (
              <a href="#" className={homeActive ? 'active' : ''} onClick={(e) => { e.preventDefault(); closeMenu(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Home
              </a>
            ) : (
              <Link href="/" className={homeActive ? 'active' : ''} onClick={closeMenu}>
                Home
              </Link>
            )}
          </li>
          <li>
            {isHome ? (
              <a href="#insights" className={insightsActive ? 'active' : ''} onClick={(e) => scrollTo(e, 'insights')}>
                Insights
              </a>
            ) : (
              <Link href="/#insights" className={insightsActive ? 'active' : ''} onClick={closeMenu}>
                Insights
              </Link>
            )}
          </li>
          <li>
            {isHome ? (
              <a href="#labs" className={labActive ? 'active' : ''} onClick={(e) => scrollTo(e, 'labs')}>
                Labs
              </a>
            ) : (
              <Link href="/#labs" className={labActive ? 'active' : ''} onClick={closeMenu}>
                Labs
              </Link>
            )}
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
