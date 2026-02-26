import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Biometric Data Consent Disclosure | jchowlabs',
  description: 'Biometric Data Consent Disclosure for jchowlabs, LLC — what biometric data is collected, how it is used, and your rights.',
};

export default function BiometricDataConsentPage() {
  const content = `<section class="article-content-section">
			<div class="article-container">
				<div class="article-header">
					<h1>Biometric Data Consent Disclosure</h1>
				</div>

				<div class="article-body">
					<p><strong>jchowlabs, LLC</strong><br>Effective Date: February 18, 2026</p>

					<blockquote>
						<p><strong>This disclosure is separate from the jchowlabs Privacy Policy and Terms of Service you acknowledged at account creation. Please read it carefully before proceeding. Biometric enrollment is entirely optional &mdash; you may use all other lab features without enrolling.</strong></p>
					</blockquote>

					<h2>What You Are About to Do</h2>
					<p>You have been granted access to jchowlabs, LLC&rsquo;s identity security demonstration lab as an invited user. By clicking <strong>&ldquo;I Agree &mdash; Enable Camera&rdquo;</strong> below, you are choosing to enroll your face as an authentication method in this lab environment. This will activate your device&rsquo;s camera and initiate the capture of your facial image.</p>
					<p>Biometric enrollment is not required. If you do not wish to proceed, click <strong>&ldquo;No Thanks&rdquo;</strong> and you will be returned to your dashboard with full access to all non-biometric lab features.</p>

					<h2>What Data Is Collected</h2>
					<p>If you proceed, the following data will be collected and processed:</p>
					<ul>
						<li><strong>Facial image(s):</strong> One or more still images of your face, captured via your device&rsquo;s camera at the moment you click &ldquo;Capture.&rdquo;</li>
						<li><strong>Biometric template:</strong> A mathematical representation of your facial geometry, derived from your image by AWS Rekognition (see below). This template is what is actually used for authentication &mdash; not the raw image.</li>
					</ul>
					<p>Biometric data is data that can be used to identify you based on your physical characteristics. It is considered sensitive personal information under California law and a biometric identifier or biometric information under the laws of Illinois, Texas, Washington, and other states.</p>

					<h2>Why We Collect It and How We Use It</h2>
					<p>Your biometric data is collected <strong>solely</strong> for the following purpose:</p>
					<ul>
						<li>To demonstrate how facial recognition-based authentication works as part of an educational security lab environment operated by jchowlabs, LLC.</li>
					</ul>
					<p>We do <strong>not</strong> use your biometric data for any of the following:</p>
					<ul>
						<li>Identity verification outside of this lab</li>
						<li>Advertising, marketing, or commercial profiling</li>
						<li>Sale, lease, or trade to any third party</li>
						<li>AI or machine learning model training</li>
						<li>Surveillance or tracking of any kind</li>
					</ul>

					<h2>Who Processes Your Data</h2>
					<p>Your facial image is transmitted over an encrypted connection to <strong>Amazon Web Services Rekognition</strong> (&ldquo;AWS Rekognition&rdquo;), a third-party facial recognition service operated by Amazon Web Services, Inc.</p>
					<p>AWS Rekognition processes your image to generate a biometric template and returns the result to the lab application. AWS acts as a data processor on our behalf and is subject to contractual restrictions on how it may use your data.</p>
					<p>AWS Rekognition&rsquo;s data handling practices are governed by the <a href="https://aws.amazon.com/privacy/" target="_blank" rel="noopener noreferrer">AWS Privacy Notice</a>.</p>
					<p>No other third party receives your facial image or biometric template.</p>

					<h2>How Long Your Data Is Retained</h2>

					<div class="grid-table retention-grid">
						<div class="grid-table-head">Data</div>
						<div class="grid-table-head">Retention Period</div>

						<div class="grid-table-cell">Facial image(s)</div>
						<div class="grid-table-cell">Deleted immediately after biometric template is generated</div>

						<div class="grid-table-cell">Biometric template</div>
						<div class="grid-table-cell">Deleted when your lab account is deleted; maximum 7 days on a rolling deletion cycle</div>

						<div class="grid-table-cell">Consent record (timestamp + user ID)</div>
						<div class="grid-table-cell">Retained for legal compliance purposes</div>
					</div>

					<p>You may request early deletion of your biometric data at any time by contacting <a href="mailto:privacy@jchowlabs.com">privacy@jchowlabs.com</a>.</p>

					<h2>Your Rights</h2>
					<p><strong>All users:</strong> You may decline enrollment at any time before clicking &ldquo;I Agree &mdash; Enable Camera.&rdquo; If you have already enrolled, you may request deletion of your biometric data by contacting us at <a href="mailto:privacy@jchowlabs.com">privacy@jchowlabs.com</a>.</p>
					<p><strong>Illinois residents (BIPA):</strong> Under the Illinois Biometric Information Privacy Act (740 ILCS 14), you have the right to receive this written disclosure before your biometric data is collected, to provide written consent, and to have your biometric data deleted in accordance with our published retention schedule. This disclosure and your affirmative consent below satisfy those requirements. You may request deletion at any time.</p>
					<p><strong>Residents of other states:</strong> If you are a resident of a state with a biometric privacy statute (including but not limited to Texas and Washington), you have rights regarding notice, consent, and deletion of biometric data. This disclosure is intended to satisfy those requirements. Contact <a href="mailto:privacy@jchowlabs.com">privacy@jchowlabs.com</a> to exercise your rights.</p>

					<h2>Consent</h2>
					<p>By checking the box and clicking <strong>&ldquo;I Agree &mdash; Enable Camera&rdquo;</strong> below, you confirm that:</p>
					<ol>
						<li>You are <strong>18 years of age or older</strong>.</li>
						<li>You have read and understood this Biometric Data Consent Disclosure.</li>
						<li>You <strong>voluntarily consent</strong> to the collection, processing, and temporary retention of your biometric data as described above.</li>
						<li>You understand this consent is for use in a <strong>security demonstration lab</strong> and for no other purpose.</li>
						<li>You understand you may request deletion of your biometric data at any time by contacting <a href="mailto:privacy@jchowlabs.com">privacy@jchowlabs.com</a>.</li>
					</ol>

					<p><em>A record of your consent, including timestamp and account identifier, will be logged for legal compliance purposes.</em></p>
					<p><em>Questions? Contact us at <a href="mailto:privacy@jchowlabs.com">privacy@jchowlabs.com</a></em></p>

					<p><strong>jchowlabs, LLC | California, United States</strong></p>
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
