import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="footer-legal">
        <Link href="/privacy-policy">Privacy</Link>
        <span className="footer-legal-dot">&middot;</span>
        <Link href="/terms-of-service">Terms</Link>
        <span className="footer-legal-dot">&middot;</span>
        <Link href="/biometric-data-consent">Biometrics</Link>
      </div>
    </footer>
  );
}
