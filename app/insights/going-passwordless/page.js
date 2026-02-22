import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AudioPlayerInit from '@/components/AudioPlayerInit';

export const metadata = {
  title: 'A Practitioner\'s Guide to Going Passwordless | jchowlabs',
  description: 'A practitioner\'s guide to enterprise passwordless adoption: risk, reality, and a practical framework for phased rollout, recovery, and privileged access.',
};

export default function ArticlePage() {
  const content = `<section class="article-content-section">
			<div class="article-container">
				<div class="article-hero">
					<img src="/static/images/going-passwordless.png" alt="Going Passwordless" class="article-hero-img">
				</div>

				<div class="article-audio">
					<div class="custom-audio-player">
						<audio id="audioElement">
							<source src="/static/audio/going-passwordless.mp3" type="audio/mpeg">
							Your browser does not support the audio element.
						</audio>
						
						<div class="audio-controls">
							<button id="playPauseBtn" class="play-pause-btn">
								<svg class="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<polygon points="5,3 19,12 5,21"></polygon>
								</svg>
								<svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
									<rect x="6" y="4" width="4" height="16"></rect>
									<rect x="14" y="4" width="4" height="16"></rect>
								</svg>
							</button>
							
							<div class="progress-container">
								<span class="time-display" id="currentTime">0:00</span>
								<div class="progress-bar" id="progressBar">
									<div class="progress" id="progress"></div>
									<div class="progress-handle" id="progressHandle"></div>
								</div>
								<span class="time-display" id="duration">0:00</span>
							</div>
							
							<div class="audio-right-controls">
								<div class="volume-control">
									<button id="muteBtn" class="mute-btn">
										<svg class="volume-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
											<path class="volume-waves" d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
										</svg>
										<svg class="mute-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
											<polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
											<line x1="23" y1="9" x2="17" y2="15"></line>
											<line x1="17" y1="9" x2="23" y2="15"></line>
										</svg>
									</button>
									<div class="volume-slider-container">
										<input type="range" id="volumeSlider" class="volume-slider" min="0" max="100" value="100" orient="vertical">
									</div>
								</div>
								
								<div class="speed-control">
									<button id="speedBtn" class="speed-btn">1x</button>
									<div class="speed-menu" id="speedMenu">
										<button data-speed="0.5">0.5x</button>
										<button data-speed="0.75">0.75x</button>
										<button data-speed="1" class="active">1x</button>
										<button data-speed="1.25">1.25x</button>
										<button data-speed="1.5">1.5x</button>
										<button data-speed="2">2x</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="article-header">
					<h1>A Practitioner's Guide to Going Passwordless</h1>
				</div>

				<div class="article-body">
					<p>Imagine this...</p>
					<p>It&rsquo;s 3 a.m. on a Saturday morning. Your team is on a call. The production deployment that was supposed to take a couple of hours is now in its tenth. The help desk is taking calls from users who can&rsquo;t log in. Someone is suggesting a rollback. Everyone on the call is exhausted, stressed, and probably responding to recruiters on LinkedIn.</p>
					<p>This scenario is more common in passwordless deployments than most people expect. And it almost never happens because the technology itself didn&rsquo;t work. It happens because somewhere between planning, vendor selection, testing, and cutover, gaps accumulated.</p>
					<p>A flow that worked in the test environment behaves differently in production.<br>
					A user persona nobody accounted for suddenly can&rsquo;t authenticate.<br>
					A non-standard device no one planned for blocks an entire group of users from getting in.</p>
					<p>Over the years, I&rsquo;ve had the privilege of designing, building, deploying, and supporting identity security solutions across hundreds of organizations, large and small. That kind of repetition teaches you things a single deployment &mdash; or even a handful of deployments &mdash; never could. Patterns emerge: what works, what fails quietly, and what fails spectacularly.</p>
					<p>Most practitioners working on a passwordless initiative will experience one, maybe two deployments. Often, they&rsquo;ll only see a slice of the whole thing. This article is an attempt to compress the pattern recognition from hundreds of end-to-end deployments into something useful &mdash; whether you&rsquo;re just getting started, already in the middle of a rollout, or trying to understand why things aren&rsquo;t going the way you expected.</p>
					<p>This isn&rsquo;t a theory article. It&rsquo;s not a vendor pitch. It&rsquo;s a practitioner&rsquo;s guide, written the same way I&rsquo;d talk through it if we were sitting across from each other.</p>

					<h2>Redefine Success</h2>
					<p>The wrong success metric for a passwordless initiative is eliminating every credential across the organization. It sounds right. It feels ambitious. But it&rsquo;s an impossible goal &mdash; and framing success that way creates problems before the project even gets off the ground.</p>
					<p>Here&rsquo;s the reality. Organizations run on thousands of applications, devices, services, and infrastructure components. Users need access to dozens of systems just to do their daily jobs. Add contractors, partners, and third-party integrations, and the credential landscape becomes enormous. Some of those credentials are never going away.</p>
					<p>Service accounts, API keys, local administrator credentials, and infrastructure secrets are baked into how systems communicate and operate. Expecting them to disappear guarantees a project that never ends, because you&rsquo;ll always be chasing the last few exceptions.</p>
					<p>The better question isn&rsquo;t <em>&ldquo;How do we eliminate every password?&rdquo;</em></p>
					<p>It&rsquo;s <em>&ldquo;How much credential exposure do we really have?&rdquo;</em></p>
					<p>Credential exposure is about how many authentication secrets exist that an attacker can realistically steal and reuse to gain access to your environment.</p>
					<p>Think about what happens when a password is compromised today. Most enterprise applications are web-based. There&rsquo;s a URL, a username, and a password. If an attacker obtains those &mdash; through phishing, malware, or social engineering &mdash; they can replay them from anywhere, on any device, with no link to the legitimate user. That single exposed credential becomes a durable entry point into the organization.</p>
					<p>Passwordless authentication changes this dynamic fundamentally. When you replace passwords with cryptographic credentials bound to a specific device &mdash; such as FIDO-based passkeys &mdash; there&rsquo;s nothing reusable for an attacker to steal. The private key never leaves the device. It can&rsquo;t be phished. It can&rsquo;t be replayed. It can&rsquo;t be handed over to a help desk agent or typed into a fake login page.</p>
					<p>Attackers may still try, but the number of usable credentials exposed to them is dramatically smaller.</p>
					<p>So reframe the goal.</p>
					<p>The metric isn&rsquo;t zero credentials. It&rsquo;s a steady, meaningful reduction in credential exposure &mdash; fewer secrets that can be stolen, fewer authentication flows that can be replayed, and fewer entry points into the organization that don&rsquo;t involve the legitimate user and their device.</p>
					<p>That framing makes a passwordless initiative achievable. It keeps teams focused on changes that actually reduce real-world risk, rather than chasing an abstract notion of perfection.</p>

					<h2>Know Your Environment</h2>
					<p>Before you change anything, you need a clear picture of your environment. Most organizations think they have one, until they actually do the exercise. Then they&rsquo;re surprised by what they find.</p>
					<p>The inventory has four parts: devices, applications, infrastructure, and users. It sounds straightforward. In practice, it rarely is.</p>
					<p>Devices are a good example. You probably have strong visibility into your managed laptops and desktops. But what about the tablet mounted on a manufacturing floor? The shared terminal in a warehouse? The mobile device a field technician uses that IT doesn&rsquo;t officially support? These systems often don&rsquo;t meet the baseline requirements for modern passwordless authentication, and they surface as blockers halfway through a deployment if you haven&rsquo;t accounted for them upfront.</p>
					<p>Applications are similar. Everyone knows the core productivity tools. What gets missed is the long tail &mdash; applications different teams have adopted over time, some IT-approved, some not. Which brings us to shadow IT.</p>
					<p>Shadow IT is a permanent fixture in most organizations. People spin up tools to get their jobs done. It happens in small companies and large ones alike. Larger organizations may have more policy and tooling to detect it, but they also have far more surface area. The honest truth is that even good controls don&rsquo;t eliminate shadow IT, because the pressure to move fast never goes away. The goal isn&rsquo;t to eliminate it before you start &mdash; it&rsquo;s to accept that your application inventory will never be perfectly complete and design your approach accordingly.</p>
					<p>The user picture matters just as much. Not only full-time employees, but remote workers, global users, contractors, and partners. These are the personas most likely to be overlooked during planning &mdash; and the ones most likely to surface as blockers during deployment. We&rsquo;ll come back to this.</p>
					<p>Taking stock of all of this upfront isn&rsquo;t a bureaucratic exercise. It&rsquo;s the foundation for everything that follows. The teams that skip it or rush through it are almost always the ones making late-night incident calls later on.</p>

					<h2>Focus On Real Risks</h2>
					<p>Once you understand what you have, the next step is deciding what to focus on first. Not all credentials carry the same risk, and not all systems are equally attractive to attackers. Treating them as if they are leads to slow progress and wasted effort.</p>
					<p>Threat modeling doesn&rsquo;t have to be complicated. The core question is simple: <em>where would a compromised credential do the most damage, and where is compromise most likely?</em></p>
					<p>High-frequency, broadly accessible applications are the obvious starting point. Email, collaboration tools, and core productivity platforms are used multiple times a day, often from multiple devices &mdash; sometimes personal ones. They&rsquo;re also prime targets for phishing campaigns. A single compromised account here can cascade quickly through integrations, shared content, and downstream access.</p>
					<p>But this is where many organizations stop looking. And that&rsquo;s a mistake.</p>
					<p>The highest risk is often at the edges.</p>
					<p>Remote and global employees. Third-party contractors. Partners with access to internal systems. These users are frequently underrepresented in planning discussions and overrepresented in breach investigations. They tend to use a wider variety of devices, operate under more variable network conditions, and receive less security training than full-time employees.</p>
					<p>The device edge matters too. A managed corporate laptop using Windows Hello with a secure enclave has a very different risk profile than an unmanaged tablet in a field environment or a shared terminal on a factory floor.</p>
					<p>Peripheral biometric readers are worth calling out specifically. They introduce attack vectors that native, platform-level biometrics do not. An IR camera built into a device and protected by a secure enclave is fundamentally different from an external USB fingerprint reader. If you&rsquo;re designing a biometric-based authentication flow, native platform biometrics are the right choice. Peripherals tend to create more problems than they solve.</p>
					<p>Threat modeling also enables more honest conversations about sequencing. Some high-value systems will be relatively easy to modernize. Others will be business-critical and difficult. Understanding that distinction early lets you build momentum on early wins while developing a realistic plan for the hard parts &mdash; instead of discovering those challenges mid-deployment.</p>

					<h2>Measure Twice, Cut-Over Once</h2>
					<p>Once you understand your environment and your risk landscape, you need a plan. That sounds obvious, but it&rsquo;s where many organizations shortchange themselves. They move from discovery to deployment too quickly, and the gaps don&rsquo;t show up until the system is under real pressure.</p>
					<p>There are a few strategic decisions worth thinking through carefully before you get into configuration.</p>
					<p><strong>Build versus buy.</strong></p>
					<p>In almost every organization I&rsquo;ve worked with, the right answer has been to buy. Identity security is a specialized discipline, and unless you have a truly unique requirement that no vendor on the market addresses, building your own solution is a distraction from your core business. The cost isn&rsquo;t just the initial development &mdash; it&rsquo;s ongoing maintenance, security updates, and engineering time that could be spent elsewhere.</p>
					<p><strong>Startup versus established vendor.</strong></p>
					<p>Larger organizations with complex infrastructure tend toward established vendors, and for good reason. Established platforms are built for scale, support broad integration ecosystems, and have already encountered many of the edge cases newer products haven&rsquo;t.</p>
					<p>Startups can be the right choice when you need cutting-edge capabilities that established vendors haven&rsquo;t prioritized yet. They&rsquo;re often more focused, more flexible, and more directly engaged with their customers. The tradeoff is execution risk: the product is still maturing, and the company itself is still proving it can scale.</p>
					<p><strong>Centralization.</strong></p>
					<p>One of the most impactful strategic decisions is moving toward a centralized identity layer &mdash; an identity provider that becomes the primary place authentication decisions are made. This isn&rsquo;t just an architectural preference. It&rsquo;s what makes it possible to introduce passwordless authentication once and apply it broadly, instead of solving the same problem application by application.</p>
					<p>Centralization also enables consistent policy enforcement and visibility across the environment. The caveat is that it isn&rsquo;t instant, and it isn&rsquo;t total. Not every application will federate cleanly, especially legacy systems. The goal is to standardize where it makes sense and use alternative approaches for the exceptions.</p>

					<h2>Sequence Does Matter</h2>
					<p>Sequence matters. Not because doing things out of order will necessarily break something, but because the right order creates a natural progression that maps to how users actually move through their day.</p>
					<p><strong>Start with devices.</strong> When a user sits down in the morning, the first thing they do is log into their workstation. That device is the entry point for everything that follows. Making sure devices are managed, modern, and capable of native biometric authentication sets the foundation. This means devices with secure enclaves and built-in biometric readers &mdash; Windows Hello, Touch ID, Face ID. If devices can&rsquo;t support this, your options narrow to mobile authenticators or security keys, which work but create a less seamless experience.</p>
					<p><strong>Move to applications.</strong> Once devices are handled, the focus shifts to the applications users access throughout the day. Modern applications that support federation can be integrated with your identity provider directly &mdash; this is the cleanest path. For legacy applications that don&rsquo;t support modern protocols, you have a few options.</p>
					<p>The first preference is modernization. If it&rsquo;s a third-party app, file an RFE with the vendor to add SAML or OIDC support. If it&rsquo;s an internally developed app, work with your internal team to add it. This takes time but produces the cleanest long-term result.</p>
					<p>If modernization isn&rsquo;t feasible, a middleware layer can bridge the gap. The user authenticates passwordlessly to the middleware, which then replays a complex credential to the legacy application behind the scenes. The user never touches a password. The vulnerability surface shrinks, even though the legacy app still uses one under the hood.</p>
					<p>If neither of those is an option in the near term, vault the credential. Users log into a password manager passwordlessly, check out a complex, rotating credential for the legacy application, and return it when done. Not perfect, but meaningfully better than a static password the user manages themselves.</p>
					<p><strong>Infrastructure is its own category.</strong> Service accounts, API keys, local admin credentials &mdash; these are not going passwordless in the same way human authentication does. They&rsquo;re also not something to ignore. Infrastructure credentials tend to be highly privileged, long-lived, and poorly governed. That combination is exactly what attackers look for. The right approach here is a privileged access management solution: vault the credentials, require checkout with approvals for access, set time-bound windows, and rotate automatically on check-in. The goal isn&rsquo;t elimination. It&rsquo;s control. A short-lived, audited credential that expires after use is dramatically less valuable to an attacker than a standing credential that&rsquo;s been sitting in a config file for two years.</p>
					<p>Apps and infrastructure can be worked in parallel. But always start with devices.</p>

					<h2>The Dangerous Flows</h2>
					<p>Here&rsquo;s something that doesn&rsquo;t get enough attention: enrollment and account recovery are not operational details. They are authentication pathways. And in many deployments, they&rsquo;re the most vulnerable ones.</p>
					<p>Think about what enrollment actually involves. A user is setting up their passwordless credential for the first time. Their identity has to be verified. The device has to be trusted. The authenticator has to be bound to the account. If any of those steps are handled inconsistently &mdash; weak identity proofing, insufficient device verification, unclear binding logic &mdash; an attacker can insert themselves into the process before the user ever completes their first login.</p>
					<p>Recovery is the same problem, amplified.</p>
					<p>If a user loses access to their authenticator, they need a way back in. That recovery path, if it&rsquo;s easier to exploit than the primary authentication flow, becomes the attacker&rsquo;s default target. Social engineering the help desk is a classic example. An attacker calls in, impersonates an employee, and uses the recovery process to enroll their own device. At that point, the strength of the primary authentication method no longer matters.</p>
					<p>The fix isn&rsquo;t to make recovery impossible. Users genuinely lose devices and need to regain access. The fix is to design enrollment and recovery with the same rigor as primary authentication &mdash; clear identity verification requirements, strong linkage between identity and device, and consistent enforcement across all user personas.</p>
					<p>And those personas matter.</p>
					<p>Full-time employees on managed corporate devices are the easy case. Contractors on personal devices, remote employees in different countries, users on mobile devices or shared terminals &mdash; this is where the edge cases live. These users are almost always underrepresented in early design and testing, and they&rsquo;re often where deployments break under real-world conditions.</p>
					<p>Which leads to another common issue: the gap between test and production environments.</p>
					<p>Test environments are clean, controlled, and populated with a small set of well-understood users. Production environments are none of those things. Personas are more varied. Devices are more diverse. Network conditions are less predictable. Flows that work smoothly in test can behave very differently when exposed to real users at scale.</p>
					<p>Building enrollment and recovery scenarios that reflect your actual user population &mdash; including the edges &mdash; is one of the most valuable investments you can make before a production rollout.</p>

					<h2>The Hidden Costs</h2>
					<p>Most organizations budget for the obvious costs: vendor licensing, professional services, and infrastructure. What consistently gets underestimated is internal employee time.</p>
					<p>A passwordless deployment pulls people in across the organization &mdash; security architects, IT leads, project managers, application owners, help desk staff. These aren&rsquo;t people sitting idle waiting for a new initiative. They already have full plates: monitoring systems, patching vulnerabilities, responding to incidents, supporting other projects. When they&rsquo;re pulled into a passwordless deployment, something else doesn&rsquo;t get done.</p>
					<p>Think of it like a meeting. You invite twenty senior people to a one-hour session. That meeting doesn&rsquo;t appear as a line item in the budget, but it&rsquo;s still an expensive hour when you account for the fully loaded cost of everyone in the room. A passwordless deployment works the same way &mdash; except it&rsquo;s stretched across months. The salaries are already on the books, so the time feels &ldquo;free.&rdquo; The opportunity cost is real, and it&rsquo;s usually invisible.</p>
					<p>This blind spot feeds directly into timeline problems. Organizations underestimate scope, commit to aggressive dates, and then start cutting corners to hit them. And the corners that get cut are almost always the ones that matter most: thorough testing, edge-case coverage, and user training. Those shortcuts have a habit of resurfacing later &mdash; usually on a Friday night.</p>
					<p>The practical takeaway is simple but uncomfortable: budget internal time explicitly. Identify who will be pulled in, estimate their hours honestly, and make sure leadership understands what other work will slow down or stop during that period. It&rsquo;s a harder conversation upfront &mdash; but it&rsquo;s far easier than explaining a rollback at midnight.</p>

					<h2>What Good Looks Like</h2>
					<p>Success in a passwordless program doesn&rsquo;t announce itself with a dashboard showing zero passwords across the organization. It shows up in quieter, more practical ways.</p>
					<p>The help desk stops being buried in password reset requests. Password resets are among the most common support calls in any organization &mdash; users locked out, credentials forgotten, accounts needing intervention. When passwordless is working well, those calls largely disappear. The team that once spent a significant portion of its time on credential management gets that time back.</p>
					<p>Users stop complaining about logging in. In mature programs, you often hear the opposite: users complain when they <em>do</em> have to use a password for a legacy application. That friction stands out precisely because it&rsquo;s no longer the norm. It&rsquo;s a good sign. It means passwordless has become the expectation, not the exception.</p>
					<p>The organization is more resilient. Phishing campaigns still happen, but they&rsquo;re less effective because there are fewer passwords to steal &mdash; especially for the applications that matter most. Even when attackers gain an initial foothold, lateral movement is harder. Credential reuse is no longer the shortcut it once was.</p>
					<p>The work, however, is never truly finished.</p>
					<p>Legacy applications still need deliberate handling. Infrastructure credentials still exist and still require governance. New applications are added regularly, and each one is a decision point: introduce passwordless from the start, or create another exception to manage later. The most mature programs recognize this and treat passwordless as an operating model, not a project. Identity is designed with credential exposure in mind from the beginning &mdash; not retrofitted after the fact.</p>
					<p>The goal is reduction, not perfection.</p>
					<p>An organization that has meaningfully reduced the number of human-handled credentials, tightened controls around the ones that remain, and built enrollment and recovery flows that don&rsquo;t introduce new vulnerabilities is in a fundamentally stronger position than one that simply tried to check a box.</p>
					<p>Measure twice, cut-over once. Teams that take the upfront work seriously &mdash; inventory, threat modeling, persona coverage, and flow design &mdash; are the ones that make it through deployment without the midnight phone call. Teams that rush it tend to do the work twice. The second time is always more expensive.</p>
					<p>This space will continue to evolve. Infrastructure credentials that require vaulting today may have more elegant solutions tomorrow. New authentication standards will emerge. Threat actors will adapt. The organizations that approach passwordless as a journey rather than a destination are the ones that stay ahead of it.</p>
				</div>
			</div>
		</section>`;

  return (
    <div className="page-wrapper content-page article-page">
      <Header />
      <main dangerouslySetInnerHTML={{ __html: content }} />
      <AudioPlayerInit />
      <Footer />
    </div>
  );
}
