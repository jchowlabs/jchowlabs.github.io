import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | jchowlabs',
  description: 'Privacy Policy for jchowlabs, LLC — how we collect, use, disclose, and protect your information.',
};

export default function PrivacyPolicyPage() {
  const content = `<section class="article-content-section">
			<div class="article-container">
				<div class="article-header">
					<h1>Privacy Policy</h1>
				</div>

				<div class="article-body">
					<p><strong>Effective Date:</strong> February 18, 2026</p>

					<p>jchowlabs, LLC (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a California single-member limited liability company providing AI, security, and technology advisory services, including educational content, interactive features, and experimental security labs.</p>

					<p>This Privacy Policy explains how we collect, use, disclose, and protect information when you access or use our websites, including:</p>

					<ul>
						<li>https://www.jchowlabs.com</li>
						<li>https://www.jchowlabs.me</li>
						<li>https://www.jchowlabs.chat</li>
						<li>https://www.jchowlabs.dev</li>
						<li>https://www.jchowlabs.ai</li>
						<li>https://www.jchowlabs.io</li>
					</ul>

					<p>(collectively, the &ldquo;Sites&rdquo;).</p>

					<p>By accessing or using the Sites, you acknowledge that you have read and understood this Privacy Policy.</p>

					<h2>1. Eligibility and Age Restriction</h2>
					<p>The Sites and all associated features are intended solely for individuals <strong>18 years of age or older</strong>.</p>
					<p>We do not knowingly collect, process, or store personal information, voice data, biometric data, or any other information from individuals under the age of 18. If we become aware that such data has been collected from a minor, we will promptly delete it.</p>
					<p>By using the Sites or registering for any lab environment, you represent and warrant that you are at least 18 years old.</p>

					<h2>2. Scope and Intended Audience</h2>
					<p>The Sites are directed at residents of the <strong>United States</strong>. While the Sites are accessible over the public internet and we do not restrict access by geography, our services, advisory offerings, and compliance posture are designed for a US-based audience.</p>
					<p>If you are accessing the Sites from outside the United States, including from the European Union or European Economic Area, please be aware:</p>
					<ul>
						<li>Your data will be processed and stored in the United States.</li>
						<li>We <strong>do not represent compliance</strong> with the EU General Data Protection Regulation (GDPR) or similar non-US data protection frameworks.</li>
						<li>You should independently assess whether accessing and using the Sites is appropriate given the data protection laws applicable in your jurisdiction.</li>
					</ul>

					<h2>3. Categories of Information We Collect</h2>

					<h3>A. Information You Provide Directly</h3>
					<p>You may voluntarily provide:</p>
					<ul>
						<li>Name or alias</li>
						<li>Email address (e.g., when contacting us or registering for a lab account)</li>
						<li>Messages or inquiries submitted through contact forms or email</li>
						<li>Account credentials for lab access</li>
					</ul>
					<p>Providing this information is optional; however, certain features may not be available without it.</p>

					<h3>B. Voice Concierge &mdash; Transcript Data (Optional)</h3>
					<p>If you choose to use the optional AI voice concierge feature:</p>
					<ul>
						<li>Your voice input is processed in real time by <strong>ElevenLabs</strong>, our voice AI provider.</li>
						<li>ElevenLabs retains both <strong>conversation transcripts</strong> and <strong>voice audio recordings</strong> on their infrastructure for <strong>30 days</strong>, after which both are permanently deleted. We have configured our ElevenLabs account to this retention period; ElevenLabs&rsquo; default retention is longer.</li>
						<li>We do not independently receive or store your audio recordings or transcripts on our own servers &mdash; this data resides solely on ElevenLabs&rsquo; infrastructure for the 30-day window.</li>
						<li>Before voice processing begins, ElevenLabs presents their own consent modal informing you that you are being recorded and that data may be shared with third parties as necessary to provide the service. Voice processing does not begin until you confirm that modal.</li>
						<li>The voice concierge is purely navigational &mdash; it does not ask for or collect your name, email, or any other personal information. Conversations are anonymous and not linked to any persistent identifier on our end.</li>
						<li>Transcripts and audio retained by ElevenLabs during the 30-day window do not contain directly identifying information based on our current configuration and use case.</li>
						<li>ElevenLabs&rsquo; handling of this data is governed by their own <a href="https://elevenlabs.io/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
					</ul>
					<p>Voice functionality is <strong>disabled by default</strong> and is only activated if you provide explicit consent through our privacy notice. If you decline, the voice concierge will not be available and no data is transmitted to ElevenLabs.</p>
					<p>We do not use voice or transcript data for advertising, voice cloning, or AI model training.</p>

					<h3>C. Biometric Information &mdash; Facial Recognition Labs (Invitation-Only)</h3>
					<p>The facial recognition authentication lab is accessible only to <strong>invited, operator-vetted users</strong>. Lab accounts are created directly by jchowlabs, LLC following a review process &mdash; there is no self-service registration for the biometric lab. This controlled access model allows us to manage who enrolls biometric data and ensure data is deleted promptly when a user&rsquo;s session or evaluation is complete.</p>
					<p>If you voluntarily choose to enroll in facial recognition:</p>
					<ul>
						<li>Facial images are captured by your device and transmitted to <strong>AWS Rekognition</strong>, Amazon Web Services&rsquo; facial recognition service, for processing.</li>
						<li>Biometric templates may be generated from your facial images for authentication testing purposes.</li>
						<li>Biometric data is used solely for <strong>educational and security demonstration purposes</strong> within the lab environment.</li>
					</ul>
					<p><strong>Important:</strong> Prior to any biometric data collection, you will be presented with a <strong>standalone Biometric Data Consent Disclosure</strong> that separately describes the data collected, its purpose, retention period, and third-party processors. Enrollment requires your affirmative acceptance of that disclosure. You may use lab environments without enrolling biometric data.</p>
					<p>Biometric data:</p>
					<ul>
						<li>Is <strong>not sold, licensed, or shared</strong> for advertising, commercial profiling, or any purpose other than operating the lab demonstration.</li>
						<li>Is deleted on a rolling basis, generally within <strong>7 days</strong> of collection or account deletion, whichever occurs first.</li>
						<li>Is subject to the data handling practices of AWS Rekognition, governed by <a href="https://aws.amazon.com/privacy/" target="_blank" rel="noopener noreferrer">AWS&rsquo;s Privacy Notice</a>.</li>
					</ul>

					<h3>D. Authentication Lab &mdash; Operational Logs</h3>
					<p>When you interact with the authentication lab environment, our servers automatically collect and log:</p>
					<ul>
						<li><strong>IP address</strong> of the connecting device</li>
						<li><strong>Log events</strong>, including: account creation, biometric enrollment (face ID creation), authentication attempts (face ID login), and related system events</li>
					</ul>
					<p>These logs are collected for <strong>operational integrity, abuse prevention, and security monitoring</strong> purposes. This is consistent with standard logging practices for any authentication system.</p>
					<p>Log data is retained for <strong>30 days</strong> and then deleted on a rolling basis.</p>
					<p>We do not use log data to build profiles, track behavior across other sites, or share with third parties except as required for security incident response or legal compliance.</p>

					<h3>E. Cookies and Tracking Technologies</h3>
					<p>We use a small number of cookies on the Sites. We do not use advertising cookies, retargeting pixels, or any third-party tracking technology beyond what is described below.</p>

					<h4>What Is a Cookie?</h4>
					<p>A cookie is a small text file placed on your device by a website. Cookies serve different purposes &mdash; some are essential to the operation of a site or feature, while others collect information about how you use the site.</p>

					<h4>Cookies We Set</h4>

					<p><strong>1. Consent Preference (localStorage)</strong></p>
					<ul>
						<li><strong>Set by:</strong> jchowlabs, LLC (first-party)</li>
						<li><strong>Storage mechanism:</strong> Browser localStorage, not a cookie. This entry never leaves your device and is never transmitted to any server.</li>
						<li><strong>Key:</strong> <code>cookieConsent</code></li>
						<li><strong>Purpose:</strong> Remembers your privacy banner selection (accepted or declined), including a timestamp of when you made your choice and a version number tied to our current Privacy Policy. This prevents the banner from reappearing on subsequent visits unless we make a material update to this policy.</li>
						<li><strong>Consent required:</strong> No &mdash; this entry is strictly functional. It is set regardless of whether you accept or decline, solely to honor your privacy choice. It contains no tracking data.</li>
						<li><strong>Retention:</strong> Persists until you clear your browser&rsquo;s site data for jchowlabs.com. Note that clearing cookies alone will not remove this entry &mdash; you must clear site data or localStorage specifically. The banner will reappear automatically if we update this policy to a new version.</li>
					</ul>

					<p><strong>2. Google Analytics Cookies</strong></p>
					<ul>
						<li><strong>Set by:</strong> Google (third-party)</li>
						<li><strong>Purpose:</strong> Collects anonymized information about pages visited, session duration, browser type, and device category. Used solely to understand which content, articles, and lab features visitors engage with so we can improve the Sites.</li>
						<li><strong>Consent required:</strong> Yes &mdash; these cookies are only set if you explicitly accept via the privacy banner. If you decline, Google Analytics is not activated and no data is transmitted to Google.</li>
						<li><strong>IP anonymization:</strong> Enabled. We do not collect precise location data.</li>
						<li><strong>Retention:</strong> Per Google Analytics default configuration (approximately 14 months).</li>
						<li><strong>Google&rsquo;s privacy policy:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></li>
					</ul>

					<h4>Cookies We Do NOT Set</h4>
					<p>We do not set or permit:</p>
					<ul>
						<li>Advertising or retargeting cookies</li>
						<li>Social media tracking pixels</li>
						<li>Cross-site tracking of any kind</li>
						<li>Any analytics or behavioral cookies without your prior consent</li>
					</ul>

					<h4>Managing Your Consent Preference</h4>
					<p>You may change your consent preference at any time by clearing your browser&rsquo;s site data for jchowlabs.com (Application &rarr; Storage &rarr; Clear site data in Chrome DevTools, or equivalent in your browser). Note that clearing cookies alone will not reset your preference &mdash; you must clear site data or localStorage specifically. Once cleared, the privacy banner will reappear on your next visit.</p>
					<p>You may also disable cookies entirely through your browser settings, which will prevent Google Analytics cookies from being set even if you have previously accepted.</p>

					<h2>4. How We Use Information</h2>
					<p>We use collected information only to:</p>
					<ul>
						<li>Operate and maintain the Sites and lab environments</li>
						<li>Provide and improve optional voice and biometric lab features</li>
						<li>Support security education and technology demonstrations</li>
						<li>Monitor system performance, detect abuse, and maintain security</li>
						<li>Respond to inquiries and communications</li>
						<li>Comply with applicable legal obligations</li>
					</ul>
					<p>We do <strong>not</strong> sell personal information. We do not use personal information for advertising or commercial profiling.</p>

					<h2>5. Consent and Feature Gating</h2>
					<p>We use layered consent:</p>
					<ul>
						<li>A <strong>privacy notice</strong> (displayed on first visit) controls activation of Google Analytics and the voice concierge. Declining consent disables both.</li>
						<li><strong>Lab registration</strong> requires acknowledgment of this Privacy Policy and our Terms of Service before an account can be created.</li>
						<li><strong>Biometric enrollment</strong> requires a separate, affirmative consent via a standalone Biometric Data Consent Disclosure presented at the point of enrollment. This consent is independent of the lab registration acknowledgment.</li>
					</ul>
					<p>Declining any layer of consent will not prevent access to informational content on the Sites.</p>

					<h2>6. Third-Party Service Providers</h2>
					<p>We use the following third-party providers to operate the Sites:</p>

					<div class="grid-table provider-grid">
						<div class="grid-table-head">Provider</div>
						<div class="grid-table-head">Purpose</div>
						<div class="grid-table-head">Data Involved</div>

						<div class="grid-table-cell">Amazon Web Services</div>
						<div class="grid-table-cell">Hosting and infrastructure</div>
						<div class="grid-table-cell">All data processed on our servers</div>

						<div class="grid-table-cell">Amazon Web Services Rekognition</div>
						<div class="grid-table-cell">Facial recognition processing</div>
						<div class="grid-table-cell">Facial images, biometric templates</div>

						<div class="grid-table-cell">ElevenLabs</div>
						<div class="grid-table-cell">Voice concierge processing</div>
						<div class="grid-table-cell">Voice input, conversation transcripts</div>

						<div class="grid-table-cell">Google Analytics</div>
						<div class="grid-table-cell">Site traffic analytics (consent-gated)</div>
						<div class="grid-table-cell">Anonymized page visit data</div>
					</div>

					<p>These providers act as service providers or data processors and are contractually limited in how they may use data. Their processing is subject to their respective privacy policies and, where applicable, data processing agreements.</p>
					<p>We do not authorize any service provider to use your information for their own independent marketing or commercial purposes.</p>

					<h2>7. Data Retention</h2>

					<div class="grid-table retention-grid">
						<div class="grid-table-head">Data Type</div>
						<div class="grid-table-head">Retention Period</div>

						<div class="grid-table-cell">Lab account credentials and profile</div>
						<div class="grid-table-cell">Rolling 7-day deletion cycle</div>

						<div class="grid-table-cell">Biometric templates (face ID)</div>
						<div class="grid-table-cell">Deleted with associated lab account; max 7 days</div>

						<div class="grid-table-cell">Authentication lab logs (IP, log events)</div>
						<div class="grid-table-cell">30 days, then deleted</div>

						<div class="grid-table-cell">Voice concierge transcripts and audio recordings</div>
						<div class="grid-table-cell">30 days on ElevenLabs infrastructure, then permanently deleted</div>

						<div class="grid-table-cell">Google Analytics data</div>
						<div class="grid-table-cell">Per Google Analytics default configuration (~14 months)</div>

						<div class="grid-table-cell">Contact form / email inquiries</div>
						<div class="grid-table-cell">Retained as needed for correspondence; deleted upon request</div>
					</div>

					<h2>8. Data Security</h2>
					<p>We implement reasonable administrative, technical, and organizational safeguards, including:</p>
					<ul>
						<li>Secure cloud infrastructure hosted on AWS</li>
						<li>Restricted administrative access to systems containing personal data</li>
						<li>Regular automated deletion cycles for time-limited data categories</li>
					</ul>
					<p>No system can guarantee complete security. In the event of a data breach affecting your personal information, we will notify affected individuals and relevant authorities as required under applicable law, including California Civil Code &sect;1798.82, within a reasonable timeframe.</p>

					<h2>9. California Privacy Rights (CCPA / CPRA)</h2>
					<p>If you are a California resident, you have the right to:</p>
					<ul>
						<li><strong>Know</strong> what personal information we collect, use, and disclose</li>
						<li><strong>Access</strong> a copy of your personal information</li>
						<li><strong>Correct</strong> inaccurate personal information</li>
						<li><strong>Delete</strong> your personal information (subject to limited exceptions)</li>
						<li><strong>Limit</strong> the use of sensitive personal information (including biometric data)</li>
						<li><strong>Non-discrimination</strong> for exercising your privacy rights</li>
					</ul>
					<p>We do <strong>not</strong> sell or share personal information as defined under the CCPA/CPRA.</p>
					<p><strong>To submit a request:</strong> Email <a href="mailto:privacy@jchowlabs.com">privacy@jchowlabs.com</a> with the subject line &ldquo;California Privacy Request&rdquo; and a description of your request. We will acknowledge receipt within <strong>10 business days</strong> and respond substantively within <strong>45 days</strong>. If additional time is required, we will notify you and may extend the response period by up to an additional 45 days as permitted by law.</p>
					<p>We will take reasonable steps to verify your identity before processing access or deletion requests.</p>

					<h2>10. Biometric-Specific State Rights</h2>
					<p>If you are a resident of <strong>Illinois, Texas, Washington</strong>, or another state with a biometric privacy statute, you may have additional rights regarding the collection, use, and retention of biometric data, including the right to:</p>
					<ul>
						<li>Receive notice before biometric data is collected</li>
						<li>Provide written consent prior to collection</li>
						<li>Request deletion of biometric data</li>
					</ul>
					<p>We address these rights through our standalone <strong>Biometric Data Consent Disclosure</strong>, presented at the point of enrollment. If you wish to request deletion of biometric data outside of that flow, please contact us at <a href="mailto:privacy@jchowlabs.com">privacy@jchowlabs.com</a>.</p>

					<h2>11. International Users</h2>
					<p>The Sites are operated from the United States. By accessing the Sites from outside the United States, you understand and acknowledge that:</p>
					<ul>
						<li>Your information will be transferred to and processed in the United States</li>
						<li>We do not represent compliance with the GDPR, UK GDPR, PIPEDA, or other non-US data protection frameworks</li>
						<li>US privacy law may provide different protections than those available in your jurisdiction</li>
					</ul>
					<p>If you are located in the EU/EEA or another jurisdiction with data transfer restrictions, we recommend you carefully consider whether to use the Sites or submit any personal information.</p>

					<h2>12. Changes to This Policy</h2>
					<p>We may update this Privacy Policy periodically. Updates will be posted with a revised effective date.</p>
					<p>For <strong>non-material changes</strong>, continued use of the Sites constitutes acceptance of the updated Policy.</p>
					<p>For <strong>material changes</strong> &mdash; particularly those affecting how we collect or use sensitive personal information, biometric data, or voice data &mdash; we will provide advance notice and, where required by applicable law, seek fresh consent before the changes take effect.</p>

					<h2>13. Contact Information</h2>
					<p><strong>jchowlabs, LLC</strong><br>California, United States<br>Privacy inquiries: <a href="mailto:privacy@jchowlabs.com">privacy@jchowlabs.com</a></p>
				</div>
			</div>
		</section>`;

  return (
    <div className="page-wrapper content-page article-page legal-page">
      <Header />
      <main dangerouslySetInnerHTML={{ __html: content }} />
      <Footer />
    </div>
  );
}
