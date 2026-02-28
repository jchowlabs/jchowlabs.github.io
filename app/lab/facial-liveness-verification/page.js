import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LivenessDetection from '@/components/LivenessDetection';

export const metadata = {
  title: 'Facial Liveness Verification | jchowlabs',
  description:
    'An interactive lab exploring how facial verification systems distinguish a live human from a spoofed image, video, or mask using client-side liveness detection.',
};

export default function FacialLivenessVerificationPage() {
  const articleHtml = `<section class="article-content-section">
      <div class="article-container">
        <div class="article-hero">
          <img src="/static/images/facial-liveness-verification.png" alt="Facial Liveness Verification" class="article-hero-img">
        </div>

        <div class="article-header">
          <h1>Facial Liveness Verification</h1>
        </div>

        <div class="article-body">
          <p>Facial verification systems are increasingly common, from unlocking phones to verifying identity for financial services. But how do these systems know they&rsquo;re looking at a real person and not a printed photo, a video replay, or a sophisticated mask?</p>

          <p>The answer is <strong>liveness detection</strong> — a set of techniques designed to confirm that the face presented to a camera belongs to a live human who is physically present. Without liveness checks, facial verification is vulnerable to <strong>presentation attacks</strong>: an adversary could hold up a photo, play a video on a screen, or wear a 3D-printed mask to impersonate someone else.</p>

          <p>Liveness detection generally falls into two categories:</p>

          <p><strong>Passive liveness</strong> analyzes properties of the captured image or video without requiring the user to do anything specific. This might include examining texture patterns (skin vs. paper), checking for micro-movements like blinking or subtle muscle contractions, or analyzing 3D depth characteristics that distinguish a real face from a flat surface.</p>

          <p><strong>Active liveness</strong> asks the user to perform specific actions — turn their head, blink, smile, or follow an on-screen prompt. By verifying that the face responds to randomized challenges in real time, the system can confirm that a live, cooperative person is present.</p>

          <p>The interactive demo below implements a simplified <strong>active liveness check</strong> using randomized challenges. It runs entirely in your browser via WebAssembly — no images or data leave your device. Each session picks three challenges at random from a pool of head turns, blinks, smiles, and nods, then evaluates your responses to produce a confidence score.</p>

          <h2>Try It Yourself</h2>
          <p>Click the button below to start the liveness check. You&rsquo;ll be guided through three randomized challenges using your device&rsquo;s camera. The system tracks your face, measures how quickly and accurately you respond, and analyzes passive micro-expression activity to produce an overall liveness confidence score.</p>
        </div>
      </div>
    </section>`;

  return (
    <div className="page-wrapper content-page article-page">
      <Header currentPage="lab" />
      <main>
        <div dangerouslySetInnerHTML={{ __html: articleHtml }} />

        {/* Interactive liveness detection demo */}
        <section className="article-content-section">
          <div className="article-container">
            <LivenessDetection />

            <div className="article-body" style={{ marginTop: '3rem' }}>
              <h2>How It Works</h2>
              <p>When you start the liveness check, the following happens entirely in your browser:</p>

              <p><strong>1. Face Detection &amp; Tracking</strong> — A face detection model loads via WebAssembly, begins tracking facial landmarks and blendshape coefficients in real time from your camera feed, and renders an oval guide overlay.</p>

              <p><strong>2. Randomized Challenges</strong> — Three challenges are selected at random from a pool of five: turn left, turn right, blink, smile, and nod. Each challenge monitors the relevant signal — head pose angles for turns and nods, eye-blink blendshapes for blinks, and mouth-smile blendshapes for smiles. A challenge is passed when the signal exceeds its threshold and is held for a minimum number of frames.</p>

              <p><strong>3. Micro-expression Analysis</strong> — Throughout the session, the system passively samples a set of facial blendshape coefficients (eye blinks, cheek squints, brow raises) and computes their variance. A live face produces natural micro-movements; a static image or replay produces near-zero variance.</p>

              <p><strong>4. Confidence Scoring</strong> — After all three challenges complete, the system produces a combined confidence score weighted across three factors: challenge peak accuracy (50%), response time (20%), and passive micro-expression variance (30%). Liveness is confirmed when the confidence score meets the threshold and all individual challenges have passed.</p>

              <h2>Limitations</h2>
              <p>This is an educational demonstration, not a production-grade biometric system. It provides basic protection against printed photo attacks and static screen replays, but it is not designed to defeat sophisticated attacks like high-quality deepfake video or 3D masks. Production systems typically combine multiple signals — infrared depth sensors, texture analysis, additional challenge randomization, and server-side ML models — to achieve higher assurance levels.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
