'use client';

/**
 * LivenessDetection — Client-side face liveness verification demo
 *
 * Uses MediaPipe Face Landmarker (WASM, runs entirely in the browser)
 * with blendshapes and transformation matrices to run randomized
 * multi-step liveness challenges: turn-left, turn-right, blink, smile, nod.
 * Produces a confidence score based on challenge performance, response
 * time, and passive micro-expression variance.
 *
 * States: idle → initializing → ready → challenge → result
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { trackLabUsage } from '@/lib/analytics';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const YAW_THRESHOLD = 18;
const PITCH_THRESHOLD = 12;
const BLINK_THRESHOLD = 0.4;
const BLINK_OPEN_THRESHOLD = 0.2;
const SMILE_THRESHOLD = 0.45;
const MOUTH_OPEN_THRESHOLD = 0.45;
const NOD_DOWN_BLEND = 0.25;
const NOD_NEUTRAL_BLEND = 0.10;
const HOLD_FRAMES = 8;
const CHALLENGE_TIMEOUT_MS = 8000;

const CHALLENGE_POOL = [
  { id: 'turn-left', label: 'Turn Left', group: 'turn' },
  { id: 'turn-right', label: 'Turn Right', group: 'turn' },
  { id: 'blink', label: 'Blink', group: 'expression' },
  { id: 'smile', label: 'Smile', group: 'expression' },
  { id: 'nod', label: 'Nod', group: 'head' },
  { id: 'mouth-open', label: 'Open Mouth', group: 'mouth' },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function estimateYaw(landmarks) {
  const nose = landmarks[1];
  const rightCheek = landmarks[234];
  const leftCheek = landmarks[454];
  const midX = (rightCheek.x + leftCheek.x) / 2;
  const offset = nose.x - midX;
  const cheekDist = Math.abs(leftCheek.x - rightCheek.x);
  if (cheekDist < 0.001) return 0;
  return (offset / cheekDist) * 90;
}

function estimatePitch(landmarks) {
  const nose = landmarks[1];
  const forehead = landmarks[10];
  const chin = landmarks[152];
  const faceHeight = Math.abs(chin.y - forehead.y);
  if (faceHeight < 0.001) return 0;
  const midY = (forehead.y + chin.y) / 2;
  const offset = nose.y - midY;
  return (offset / faceHeight) * 120;
}

function getBlendshape(blendshapes, name) {
  if (!blendshapes || !blendshapes[0]) return 0;
  const cat = blendshapes[0].categories.find((c) => c.categoryName === name);
  return cat ? cat.score : 0;
}

function pickRandomChallenges() {
  const pool = [...CHALLENGE_POOL];
  const picked = [];
  const usedGroups = new Set();
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  for (const c of pool) {
    if (picked.length >= 3) break;
    // Allow max 1 from 'turn' group, but others can repeat group
    if (c.group === 'turn' && usedGroups.has('turn')) continue;
    picked.push(c);
    usedGroups.add(c.group);
  }
  return picked;
}

function strengthLabel(score) {
  if (score >= 0.8) return 'Strong';
  if (score >= 0.5) return 'Moderate';
  return 'Weak';
}

function strengthClass(score) {
  if (score >= 0.8) return 'strong';
  if (score >= 0.5) return 'moderate';
  return 'weak';
}

function microLabel(variance) {
  if (variance >= 0.015) return 'Normal';
  if (variance >= 0.005) return 'Low';
  return 'Suspicious';
}

function microClass(variance) {
  if (variance >= 0.015) return 'normal';
  if (variance >= 0.005) return 'low';
  return 'suspicious';
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function LivenessDetection() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  const [phase, setPhase] = useState('idle');
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeResults, setChallengeResults] = useState([]);
  const [confidence, setConfidence] = useState(0);
  const [microExpr, setMicroExpr] = useState(0);

  const phaseRef = useRef(phase);
  const challengeIndexRef = useRef(0);
  const challengesRef = useRef([]);
  const holdCountRef = useRef(0);
  const challengeStartRef = useRef(0);
  const peakScoreRef = useRef(0);
  const blinkStateRef = useRef('open'); // open | closed
  const nodStateRef = useRef('neutral'); // neutral | down
  const blendshapeSamplesRef = useRef([]);
  const challengeResultsRef = useRef([]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { challengeIndexRef.current = challengeIndex; }, [challengeIndex]);
  useEffect(() => { challengesRef.current = challenges; }, [challenges]);

  /* ---------------------------------------------------------- */
  /* Cleanup                                                     */
  /* ---------------------------------------------------------- */

  const cleanup = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  /* ---------------------------------------------------------- */
  /* Draw overlay                                                */
  /* ---------------------------------------------------------- */

  const drawOverlay = useCallback((landmarks, width, height) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height * 0.44;
    const rx = width * 0.32;
    const ry = height * 0.40;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = landmarks ? 'rgba(74, 222, 128, 0.7)' : 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    if (landmarks) {
      ctx.fillStyle = 'rgba(74, 222, 128, 0.35)';
      const subset = [1, 4, 5, 6, 10, 33, 61, 133, 152, 159, 195, 234, 263, 291, 362, 386, 454];
      for (const i of subset) {
        if (landmarks[i]) {
          ctx.beginPath();
          ctx.arc(landmarks[i].x * width, landmarks[i].y * height, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, []);

  /* ---------------------------------------------------------- */
  /* Compute final scores                                        */
  /* ---------------------------------------------------------- */

  const computeResults = useCallback((results) => {
    // Per-challenge score average
    const avgChallenge = results.reduce((s, r) => s + r.score, 0) / results.length;

    // Response time score: 0.5s–5s window, faster = better
    const avgTime = results.reduce((s, r) => {
      const t = clamp(1 - (r.responseMs - 500) / 4500, 0, 1);
      return s + t;
    }, 0) / results.length;

    // Micro-expression: std deviation of blendshape samples
    const samples = blendshapeSamplesRef.current;
    let microVar = 0;
    if (samples.length > 10) {
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      microVar = Math.sqrt(samples.reduce((a, v) => a + (v - mean) ** 2, 0) / samples.length);
    }
    const passiveLiveness = clamp((microVar - 0.003) / 0.04, 0, 1);

    const totalConfidence = Math.round(
      (avgChallenge * 0.50 + avgTime * 0.20 + passiveLiveness * 0.30) * 100
    );

    const isLive = totalConfidence >= 50 && results.every((r) => r.passed);

    setMicroExpr(microVar);
    setConfidence(totalConfidence);
    setChallengeResults(results);
    setResult(isLive ? 'live' : 'not-live');
    setPhase('result');
    cleanup();
  }, [cleanup]);

  /* ---------------------------------------------------------- */
  /* Advance to next challenge or finish                         */
  /* ---------------------------------------------------------- */

  const advanceChallenge = useCallback((passed, peakScore, responseMs) => {
    const cList = challengesRef.current;
    const idx = challengeIndexRef.current;
    const entry = {
      id: cList[idx].id,
      label: cList[idx].label,
      passed,
      score: clamp(peakScore, 0, 1),
      responseMs,
    };
    const updated = [...challengeResultsRef.current, entry];
    challengeResultsRef.current = updated;

    if (idx + 1 >= cList.length) {
      computeResults(updated);
    } else {
      const next = idx + 1;
      challengeIndexRef.current = next;
      setChallengeIndex(next);
      holdCountRef.current = 0;
      peakScoreRef.current = 0;
      blinkStateRef.current = 'open';
      nodStateRef.current = 'neutral';
      challengeStartRef.current = performance.now();
      setPhase('challenge');
    }
  }, [computeResults]);

  /* ---------------------------------------------------------- */
  /* Detection loop                                              */
  /* ---------------------------------------------------------- */

  const runDetectionLoop = useCallback(() => {
    const fl = faceLandmarkerRef.current;
    const video = videoRef.current;

    if (!fl || !video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -width, 0, width, height);
      ctx.restore();
    }

    const now = performance.now();
    let landmarks = null;
    let blendshapes = null;

    try {
      const results = fl.detectForVideo(video, now);
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        landmarks = results.faceLandmarks[0];
      }
      if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
        blendshapes = results.faceBlendshapes;
      }
    } catch {
      // skip frame
    }

    const currentPhase = phaseRef.current;

    if (!landmarks) {
      drawOverlay(null, width, height);
      if (currentPhase === 'ready') {
        setFeedback('Position your face in the oval');
      }
      holdCountRef.current = 0;
      rafRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    drawOverlay(landmarks, width, height);

    // Passive micro-expression sampling — track blendshape activity
    if (blendshapes && blendshapes[0]) {
      const tracked = ['eyeBlinkLeft', 'eyeBlinkRight', 'mouthSmileLeft', 'mouthSmileRight', 'browInnerUp', 'cheekSquintLeft'];
      let sum = 0;
      for (const name of tracked) {
        sum += getBlendshape(blendshapes, name);
      }
      blendshapeSamplesRef.current.push(sum / tracked.length);
    }

    if (currentPhase === 'ready') {
      setFeedback('Face detected — starting challenges');
      holdCountRef.current = 0;
      challengeStartRef.current = now + 800;
      setTimeout(() => {
        setPhase('challenge');
      }, 800);
      rafRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    if (currentPhase === 'challenge') {
      const cList = challengesRef.current;
      const idx = challengeIndexRef.current;
      if (!cList[idx]) {
        rafRef.current = requestAnimationFrame(runDetectionLoop);
        return;
      }

      const elapsed = now - challengeStartRef.current;
      const challengeId = cList[idx].id;

      // Timeout
      if (elapsed > CHALLENGE_TIMEOUT_MS) {
        advanceChallenge(false, peakScoreRef.current, CHALLENGE_TIMEOUT_MS);
        rafRef.current = requestAnimationFrame(runDetectionLoop);
        return;
      }

      const yaw = estimateYaw(landmarks);
      const pitch = estimatePitch(landmarks);
      const blinkL = getBlendshape(blendshapes, 'eyeBlinkLeft');
      const blinkR = getBlendshape(blendshapes, 'eyeBlinkRight');
      const smileL = getBlendshape(blendshapes, 'mouthSmileLeft');
      const smileR = getBlendshape(blendshapes, 'mouthSmileRight');

      let detected = false;

      if (challengeId === 'turn-left') {
        const score = Math.abs(yaw) / 45;
        if (yaw > YAW_THRESHOLD) {
          peakScoreRef.current = Math.max(peakScoreRef.current, score);
          holdCountRef.current++;
          detected = holdCountRef.current >= HOLD_FRAMES;
        } else {
          holdCountRef.current = Math.max(0, holdCountRef.current - 1);
        }
      } else if (challengeId === 'turn-right') {
        const score = Math.abs(yaw) / 45;
        if (yaw < -YAW_THRESHOLD) {
          peakScoreRef.current = Math.max(peakScoreRef.current, score);
          holdCountRef.current++;
          detected = holdCountRef.current >= HOLD_FRAMES;
        } else {
          holdCountRef.current = Math.max(0, holdCountRef.current - 1);
        }
      } else if (challengeId === 'blink') {
        const avgBlink = (blinkL + blinkR) / 2;
        if (blinkStateRef.current === 'open' && avgBlink > BLINK_THRESHOLD) {
          blinkStateRef.current = 'closed';
          peakScoreRef.current = Math.max(peakScoreRef.current, avgBlink);
        } else if (blinkStateRef.current === 'closed' && avgBlink < BLINK_OPEN_THRESHOLD) {
          detected = true;
          peakScoreRef.current = Math.max(peakScoreRef.current, 1.0);
        }
      } else if (challengeId === 'smile') {
        const avgSmile = (smileL + smileR) / 2;
        peakScoreRef.current = Math.max(peakScoreRef.current, avgSmile / 0.8);
        if (avgSmile > SMILE_THRESHOLD) {
          holdCountRef.current++;
          detected = holdCountRef.current >= HOLD_FRAMES;
        } else {
          holdCountRef.current = Math.max(0, holdCountRef.current - 1);
        }
      } else if (challengeId === 'nod') {
        // Use multiple signals: blendshape headNodDown + landmark pitch for robustness
        const nodBlend = Math.max(
          getBlendshape(blendshapes, 'headDown'),
          getBlendshape(blendshapes, 'headNodDown')
        );
        // Combine blendshape signal with landmark pitch
        const pitchSignal = Math.abs(pitch) / 30;
        const combinedSignal = nodBlend > 0.01 ? (nodBlend + pitchSignal) / 2 : pitchSignal;

        if (nodStateRef.current === 'neutral') {
          // Detect downward nod via blendshape or pitch
          if (nodBlend > NOD_DOWN_BLEND || pitch > PITCH_THRESHOLD) {
            nodStateRef.current = 'down';
            peakScoreRef.current = Math.max(peakScoreRef.current, combinedSignal);
          }
        } else if (nodStateRef.current === 'down') {
          // Return to neutral: blendshape drops and pitch returns
          if ((nodBlend < NOD_NEUTRAL_BLEND) && pitch < 4) {
            detected = true;
            peakScoreRef.current = Math.max(peakScoreRef.current, 1.0);
          }
        }
      } else if (challengeId === 'mouth-open') {
        const jawOpen = getBlendshape(blendshapes, 'jawOpen');
        peakScoreRef.current = Math.max(peakScoreRef.current, jawOpen / 0.8);
        if (jawOpen > MOUTH_OPEN_THRESHOLD) {
          holdCountRef.current++;
          detected = holdCountRef.current >= HOLD_FRAMES;
        } else {
          holdCountRef.current = Math.max(0, holdCountRef.current - 1);
        }
      }

      if (detected) {
        const responseMs = elapsed;
        advanceChallenge(true, peakScoreRef.current, responseMs);
      }
    }

    rafRef.current = requestAnimationFrame(runDetectionLoop);
  }, [drawOverlay, advanceChallenge]);

  /* ---------------------------------------------------------- */
  /* Start                                                       */
  /* ---------------------------------------------------------- */

  const handleStart = useCallback(async () => {
    const picked = pickRandomChallenges();
    setChallenges(picked);
    challengesRef.current = picked;
    setChallengeIndex(0);
    challengeIndexRef.current = 0;
    setChallengeResults([]);
    challengeResultsRef.current = [];
    setConfidence(0);
    setMicroExpr(0);
    holdCountRef.current = 0;
    peakScoreRef.current = 0;
    blinkStateRef.current = 'open';
    nodStateRef.current = 'neutral';
    blendshapeSamplesRef.current = [];

    setPhase('initializing');
    setResult(null);
    setFeedback('Loading face detection model…');
    trackLabUsage('facial-liveness-verification');

    try {
      const vision = await import('@mediapipe/tasks-vision');
      const { FaceLandmarker, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(WASM_CDN);

      const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
      });

      faceLandmarkerRef.current = faceLandmarker;

      setFeedback('Requesting camera access…');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();

      challengeStartRef.current = performance.now();

      setPhase('ready');
      setFeedback('Position your face in the oval');

      runDetectionLoop();
    } catch (err) {
      console.error('Liveness detection init failed:', err);
      setFeedback('Could not start camera or load model. Please allow camera access and try again.');
      setPhase('idle');
    }
  }, [runDetectionLoop]);

  /* ---------------------------------------------------------- */
  /* Reset                                                       */
  /* ---------------------------------------------------------- */

  const handleReset = useCallback(() => {
    cleanup();
    setPhase('idle');
    setResult(null);
    setFeedback('');
    setChallenges([]);
    setChallengeIndex(0);
    setChallengeResults([]);
    setConfidence(0);
    setMicroExpr(0);
    holdCountRef.current = 0;
    blendshapeSamplesRef.current = [];
    challengeResultsRef.current = [];
  }, [cleanup]);

  /* ---------------------------------------------------------- */
  /* Render                                                      */
  /* ---------------------------------------------------------- */

  const showCamera = phase === 'initializing' || phase === 'ready' || phase === 'challenge';

  return (
    <div className="liveness-demo">
      <div className="liveness-demo-card">
        <h3 className="liveness-demo-title">Liveness Detection</h3>

        {phase === 'idle' && (
          <div className="liveness-idle">
            <div className="liveness-viewport-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.35">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <button className="liveness-btn liveness-btn-start" onClick={handleStart}>
              Start Liveness Check
            </button>
          </div>
        )}

        {showCamera && (
          <div className="liveness-camera-section">
            {/* Dynamic step indicators */}
            <div className="liveness-steps">
              {challenges.map((c, i) => (
                <div key={c.id} className="liveness-step-group">
                  {i > 0 && <div className="liveness-step-line" />}
                  <div className={`liveness-step ${challengeIndex >= i && phase === 'challenge' ? 'active' : ''} ${challengeIndex > i ? 'done' : ''}`}>
                    <span className="liveness-step-num">
                      {challengeIndex > i ? '✓' : i + 1}
                    </span>
                    <span className="liveness-step-label">{c.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="liveness-viewport">
              {phase === 'initializing' && (
                <div className="liveness-loading-overlay">
                  <div className="liveness-spinner" />
                </div>
              )}
              <video ref={videoRef} playsInline muted className="liveness-video" />
              <canvas ref={canvasRef} className="liveness-canvas" />
              <canvas ref={overlayCanvasRef} className="liveness-overlay" />
            </div>

            <button className="liveness-btn liveness-btn-start" onClick={handleReset}>
              Cancel
            </button>
          </div>
        )}

        {phase === 'result' && (
          <div className="liveness-result">
            <div className="liveness-viewport-placeholder liveness-result-box">
              {/* Icon + title */}
              <div className={`liveness-result-icon ${result === 'live' ? 'success' : 'fail'}`}>
                {result === 'live' ? (
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ) : (
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                )}
              </div>
              <h4 className="liveness-result-title">
                {result === 'live' ? `Liveness Confidence: ${confidence}%` : `Liveness Failed: ${confidence}%`}
              </h4>

              {/* Challenge breakdown */}
              <div className="liveness-breakdown">
                {challengeResults.map((cr) => (
                  <div key={cr.id} className="liveness-breakdown-row">
                    <span className={`liveness-breakdown-icon ${cr.passed ? 'pass' : 'fail'}`}>
                      {cr.passed ? '✓' : '✗'}
                    </span>
                    <span className="liveness-breakdown-label">{cr.label}</span>
                    <span className={`liveness-breakdown-strength ${strengthClass(cr.score)}`}>
                      {cr.passed ? strengthLabel(cr.score) : (cr.responseMs >= CHALLENGE_TIMEOUT_MS ? 'Timeout' : 'Weak')}
                    </span>
                    <span className="liveness-breakdown-time">
                      {(cr.responseMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                ))}

                <div className="liveness-breakdown-sep" />

                <div className="liveness-breakdown-row">
                  <span className={`liveness-breakdown-icon ${microClass(microExpr) === 'suspicious' ? 'fail' : 'pass'}`}>
                    {microClass(microExpr) === 'suspicious' ? '✗' : '✓'}
                  </span>
                  <span className="liveness-breakdown-label">Micro-expression</span>
                  <span className={`liveness-breakdown-strength ${microClass(microExpr)}`}>
                    {microLabel(microExpr)}
                  </span>
                  <span className="liveness-breakdown-time" />
                </div>
              </div>
            </div>

            <button className="liveness-btn liveness-btn-start" onClick={handleReset}>
              Done
            </button>
          </div>
        )}

        <div className="liveness-demo-notice">
          <div className="liveness-notice-icon">i</div>
          <p>This liveness demo runs entirely in your browser. No images, video, or biometric data are stored or sent to any server. Refer to <a href="/privacy-policy" className="liveness-notice-link">Privacy Policy</a> for additional details.</p>
        </div>
      </div>
    </div>
  );
}
