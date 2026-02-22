import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Typewriter from './Typewriter';

export default function HomePage() {
  return (
    <div className="page-wrapper home">
      <Header />
      <main>
        <h1>
          AI &amp; Security Advisory
          <br />
          <span className="subtitle">
            <Typewriter />
            <span className="cursor">_</span>
          </span>
        </h1>
        <a href="#" className="btn-main" id="home-cta">
          Get in touch
        </a>
      </main>
      <Footer />
    </div>
  );
}
