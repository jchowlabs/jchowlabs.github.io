import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InlineVoiceDemo from '@/components/InlineVoiceDemo';

export const metadata = {
  title: 'Interactive Voice Assistant | jchowlabs',
  description: 'Explore what a voice assistant can really do — page awareness, configuration awareness, and free-text understanding — with interactive demos you can try as you read.',
};

export default function ArticlePage() {
  const contentIntro = `<section class="article-content-section">
			<div class="article-container">
				<div class="article-hero">
					<img src="/static/images/voice-concierge.png" alt="Interactive Voice Assistant" class="article-hero-img">
				</div>

				<div class="article-header">
					<h1>Interactive Voice Assistant</h1>
				</div>

				<div class="article-body">
					<p>If you&rsquo;ve spent any time on this site, you may have noticed the voice assistant in the bottom-right corner. It&rsquo;s not a chatbot. It&rsquo;s a conversational voice concierge that can help you explore the site, find articles, navigate between pages, and get in touch with me, all through natural speech.</p>
					<p>But this article isn&rsquo;t just about how that voice assistant was built. It&rsquo;s about what voice assistants like this one can actually <em>do</em>, and it&rsquo;s designed to let you try those capabilities yourself as you read.</p>
					<p>Voice agents are showing up everywhere: customer support, healthcare, fast food, travel. What stands out is how natural these interactions feel. They handle interruptions, maintain context, and respond in ways that increasingly feel human. But the real value isn&rsquo;t just conversation. It&rsquo;s awareness.</p>
					<p>A well-built voice assistant doesn&rsquo;t just talk to you. It knows where you are, what&rsquo;s on the screen, and what you&rsquo;ve done. That turns a voice interface from a novelty into something genuinely useful.</p>
					<p>Let&rsquo;s explore three capabilities that make this possible. To follow along, activate the voice assistant by clicking the pill in the bottom-right corner of the screen.</p>

					<h2>Page Awareness</h2>
					<p>The most basic form of context is knowing what page the user is on. When you ask this site&rsquo;s voice assistant a question, it checks your current location before responding. It knows whether you&rsquo;re on the home page, reading an article, or working through an interactive lab.</p>
					<p>This matters because it changes how the assistant responds. On the home page, it gives you an overview. On the passkeys demo, it tracks your progress and offers step-by-step guidance. Here, it knows you&rsquo;re reading about voice capabilities.</p>
					<p>Try it now. Activate the voice assistant and ask:</p>
					<div class="voice-prompt">
						<p>Try asking the assistant:</p>
						<p class="voice-prompt-question">&ldquo;What page am I on?&rdquo;</p>
					</div>
					<p>The assistant will tell you exactly where you are. Simple, but foundational. Every other capability builds on this awareness.</p>
				</div>
			</div>
		</section>`;

  const contentToggleIntro = `<section class="article-content-section">
			<div class="article-container">
				<div class="article-body">
					<h2>Configuration Awareness</h2>
					<p>Now let&rsquo;s go further. Imagine a dashboard with settings, toggles, and controls. A voice assistant that understands the page can also understand the state of interactive elements: whether a setting is enabled or disabled, what options are selected, what&rsquo;s changed since the last time it checked.</p>
					<p>This is what makes voice useful in complex interfaces. Think of a security console, an admin panel, or a deployment workflow. Instead of hunting through menus, a user can simply ask and get an immediate, accurate answer.</p>
					<p>Below is a simple toggle. Flip it yourself, or ask the voice assistant to change it for you.</p>
				</div>
			</div>
		</section>`;

  const contentAfterToggle = `<section class="article-content-section">
			<div class="article-container">
				<div class="article-body">
					<p>The voice assistant reads the live state of that toggle every time you ask, and it can change it too. Ask it to turn the toggle on or off. The assistant sees the current state, decides whether an action is needed, and confirms the result.</p>
					<p>In real-world applications, this pattern extends to any interactive element: dropdown selections, radio buttons, checkbox groups, slider positions. The assistant doesn&rsquo;t need to watch every change in real time. It checks the current state when asked, which is exactly how a human helper would work — they look at the screen when you ask them a question.</p>
				</div>
			</div>
		</section>`;

  const contentTextIntro = `<section class="article-content-section">
			<div class="article-container">
				<div class="article-body">
					<h2>Free-Text Awareness</h2>
					<p>Toggles and dropdowns have a fixed set of states. Text input is different. When a user types into a form field, the value is arbitrary. A voice assistant that can read and relay free-text input demonstrates a deeper level of screen awareness.</p>
					<p>This is useful for guided workflows where a user fills out forms and wants confirmation that they entered the right thing, or for accessibility scenarios where a user wants to hear back what they typed.</p>
					<p>Type your name below, then ask the voice assistant what you entered.</p>
				</div>
			</div>
		</section>`;

  const contentAfterText = `<section class="article-content-section">
			<div class="article-container">
				<div class="article-body">
					<p>The assistant reads back exactly what you typed. Change it, ask again, and it reflects the update. The input is intentionally simple here, a name field, but the pattern works for any text-based form element: search queries, configuration values, addresses, policy names.</p>

					<h2>Why This Matters</h2>
					<p>These three capabilities — page awareness, configuration awareness, and text-input awareness — are the building blocks for voice-assisted interfaces that are actually useful in professional settings.</p>
					<p>Consider a security operations center where an analyst sees an alert and asks the voice assistant what triggered it. Or an identity management console where an admin asks whether MFA enforcement is enabled. Or a deployment workflow where someone is setting up a new service and wants guidance on what to fill in next.</p>
					<p>In each case, the assistant doesn&rsquo;t just chat. It sees the screen, understands the current state, and provides relevant answers. That&rsquo;s the difference between a voice interface and a voice <em>assistant</em>.</p>

					<h2>How It Was Built</h2>
					<p>The voice assistant on this site is powered by ElevenLabs Conversational AI. The conversational logic, system prompt, voice settings, and tool definitions all live on the ElevenLabs platform. The client handles audio input and output and executes tool calls.</p>
					<p>The key mechanism behind screen awareness is a client tool called <em>get_current_page</em>. Each time the assistant needs context, it calls this tool, which reads the current page URL and any interactive state exposed by the page&rsquo;s components. The response gives the assistant a structured snapshot of what the user is looking at.</p>
					<p>Interactive elements on the page, like the toggle and text field above, sync their state to a shared JavaScript object. The tool reads from that object when called. No server is involved. No data is stored. The state lives in-browser for the duration of the session.</p>
					<p>Tuning the experience involved balancing conversational fluidity with accuracy. The assistant needs to check state before answering, not guess from a previous call. It needs to describe what it sees naturally, not read raw data. And it needs to know when the question is about the page and when it&rsquo;s a general query that doesn&rsquo;t require screen context.</p>

					<h2>Getting in Touch</h2>
					<p>If you&rsquo;re interested in adding voice capabilities to your own website or product, I&rsquo;d love to hear from you. Try it right now:</p>
					<div class="voice-prompt">
						<p>Try asking the assistant:</p>
						<p class="voice-prompt-question">&ldquo;Help me get in touch with Jason&rdquo;</p>
					</div>
					<p>Whether you&rsquo;re exploring voice for customer support, internal tools, or public-facing websites, the patterns in this article are a starting point. The technology is ready. The interesting work is in designing how it fits into the experience you want to create.</p>
					<p>And if you&rsquo;ve made it this far, say &ldquo;<strong>open sesame</strong>&rdquo; to the voice assistant and see what happens.</p>
				</div>
			</div>
		</section>`;

  return (
    <div className="page-wrapper content-page article-page">
      <Header />
      <main>
        <div dangerouslySetInnerHTML={{ __html: contentIntro }} />
        <div dangerouslySetInnerHTML={{ __html: contentToggleIntro }} />

        <section className="article-content-section">
          <div className="article-container">
            <div className="article-body">
              <InlineVoiceDemo variant="toggle" />
            </div>
          </div>
        </section>

        <div dangerouslySetInnerHTML={{ __html: contentAfterToggle }} />
        <div dangerouslySetInnerHTML={{ __html: contentTextIntro }} />

        <section className="article-content-section">
          <div className="article-container">
            <div className="article-body">
              <InlineVoiceDemo variant="text" />
            </div>
          </div>
        </section>

        <div dangerouslySetInnerHTML={{ __html: contentAfterText }} />
      </main>
      <Footer />
    </div>
  );
}
