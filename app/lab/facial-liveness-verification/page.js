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
          <p>Facial verification systems are now part of everyday digital life. We use them to unlock phones, login to applications, and approve financial transactions.</p>

          <p><strong>But here is an important question.</strong></p>

          <p>How do you know the person behind the camera is real, and not a printed photo, video replay or a well-constructed mask?</p>

          <p>That is where liveness detection comes in.</p>

          <p>Liveness detection is a set of techniques designed to confirm that the face presented to a camera belongs to a live human being who is physically present and interacting in real time. Without it, facial verification systems are vulnerable to what&rsquo;s known as presentation attacks. An attacker could simply hold up a photo, replay a video, or use a high quality mask to impersonate someone else.</p>

          <p>As AI-generated media becomes more accessible, so does the importance of strong liveness verification techniques.</p>

          <h2>Two Approaches to Liveness</h2>

          <p>There are generally two categories of liveness detection.</p>

          <p><strong>Passive liveness</strong> analyzes images or video feed without requiring the user to do anything specific. The system might look at texture differences between skin and paper, detect subtle micro-movements like blinking or muscle activity, or analyze depth characteristics that distinguish a real face from a flat surface.</p>

          <p><strong>Active liveness</strong> requires the user to respond to specific prompts. The system might ask you to turn your head, blink, smile, or nod. Because the actions are randomized and verified in real time, it becomes much harder to rely on pre-recorded content.</p>

          <p>Most production systems, including the demo, combine both elements.</p>

          <h2>Try It Yourself</h2>
        </div>
      </div>
    </section>`;

  const afterHtml = `<section class="article-content-section">
      <div class="article-container">
        <div class="article-body">
          <h2>How It Works</h2>

          <p>When you start the session, several things happen:</p>

          <p><strong>1. Face Detection and Tracking</strong></p>
          <p>A face detection model loads and begins tracking facial landmarks and blendshape coefficients from your camera feed. An oval overlay helps the user correctly position their head for this detection model.</p>

          <p><strong>2. Randomized Challenges</strong></p>
          <p>Three random challenges are selected from a pool of challenges: turn left, turn right, blink, smile, head nod and others. Each challenge monitors a specific signal. Head pose angles are used for turns and nods. Eye-blink blendshapes are used for blinks. Mouth-smile coefficients are used for smiles. A challenge is passed only when the signal exceeds its threshold and remains stable for a minimum number of frames.</p>

          <p><strong>3. Micro-Expression Sampling</strong></p>
          <p>Throughout the session, the system samples blink, cheek, and brow-related blendshape coefficients and computes variance. A live face produces natural, low-level motion. Static images and simple replays tend to produce near-zero variance.</p>

          <p><strong>4. Confidence Scoring</strong></p>
          <p>After all three challenges complete, a combined confidence score is calculated. The weighting is distributed across challenge peak accuracy, response time, and passive micro-movement variance. Liveness is confirmed when both the individual challenges and the overall score meet defined thresholds.</p>

          <p>The demo illustrates the layered logic behind real-world systems.</p>

          <h2>A Practical Takeaway</h2>

          <p>Liveness detection shifts facial verification from simple matching to real-time assurance.</p>

          <p>It adds an important layer of confidence in environments where automated systems are making identity decisions without human oversight.</p>

          <p>If your organization relies on facial verification for onboarding, authentication, or transaction approval, understanding how liveness works is no longer optional. It is part of building durable digital trust.</p>
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
          </div>
        </section>

        <div dangerouslySetInnerHTML={{ __html: afterHtml }} />
      </main>
      <Footer />
    </div>
  );
}
