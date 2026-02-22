import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'AI Agent Tool Poisoning (Coming Soon) | jchowlabs',
};

export default function ArticlePage() {
  const content = `<section class="article-content-section">
			<div class="article-container">
				<div class="article-hero">
					<img src="/static/images/tool-poisoning.png" alt="Tool Poisoning" class="article-hero-img">
				</div>

				<div class="article-header">
					<h1>AI Agent Tool Poisoning (Coming Soon)</h1>
				</div>

				<div class="article-body">
					<p>This research article is currently being developed and will be published soon. Please check back later for the full content on AI Agent Tool Poisoning.</p>
				</div>
			</div>
		</section>`;

  return (
    <div className="page-wrapper content-page article-page">
      <Header />
      <main dangerouslySetInnerHTML={{ __html: content }} />
      <Footer />
    </div>
  );
}
