'use client';

/**
 * LivenessDetection — Client-side face liveness verification demo
 *
 * Uses MediaPipe Face Landmarker (WASM, runs entirely in the browser)
 * to detect head pose (yaw) and guide the user through turn-left /
 * turn-right challenges. No data is stored or transmitted.
 *
 * States: idle → initializing → ready → challenge-left → challenge-right → result
 */

import { useState, useRef, useCallback, useEffect } from 'react';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// Yaw thresholds (degrees) — positive = turned right, negative = turned left
const YAW_THRESHOLD = 18;
// How many consecutive frames the pose must be held
const HOLD_FRAMES = 8;
// Depth variance threshold to reject flat images (photo attack)
const DEPTH_VARIANCE_MIN = 0.0004;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Estimate yaw from face landmarks using nose-tip vs cheek midpoints. */
function estimateYaw(landmarks) {
  // Landmark indices (MediaPipe Face Landmarker canonical):
  // 1 = nose tip, 234 = right cheek, 454 = left cheek
  const nose = landmarks[1];
  const rightCheek = landmarks[234];
  const leftCheek = landmarks[454];

  const midX = (rightCheek.x + leftCheek.x) / 2;
  const offset = nose.x - midX;
  const cheekDist = Math.abs(leftCheek.x - rightCheek.x);
  if (cheekDist < 0.001) return 0;

  // Normalise and convert to approximate degrees (empirical scaling)
  const yawRatio = offset / cheekDist;
  return yawRatio * 90; // rough mapping — 0.5 ratio ≈ 45°
}

/** Compute variance of z-coordinates to distinguish 3D face from flat photo. */
function zDepthVariance(landmarks) {
  const zValues = landmarks.map((l) => l.z);
  const mean = zValues.reduce((a, b) => a + b, 0) / zValues.length;
  const variance = zValues.reduce((a, z) => a + (z - mean) ** 2, 0) / zValues.length;
  return variance;
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
  const holdCountRef = useRef(0);
  const depthSamplesRef = useRef([]);

  const [phase, setPhase] = useState('idle');
  // idle | initializing | ready | challenge-left | challenge-right | result
  const [result, setResult] = useState(null); // 'live' | 'not-live'
  const [feedback, setFeedback] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  /* ---------------------------------------------------------- */
  /* Cleanup                                                     */
  /* ---------------------------------------------------------- */

  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  /* ---------------------------------------------------------- */
  /* Draw oval guide + landmarks on overlay canvas               */
  /* ---------------------------------------------------------- */

  const drawOverlay = useCallback((landmarks, width, height) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    // Semi-transparent dark mask with oval cutout
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

    // Oval border
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = landmarks ? 'rgba(74, 222, 128, 0.7)' : 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw small landmark dots when face is detected
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

    // Draw mirrored video to canvas
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

    try {
      const results = fl.detectForVideo(video, now);
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        landmarks = results.faceLandmarks[0];
      }
    } catch {
      // Occasional frame timing errors — skip
    }

    const currentPhase = phaseRef.current;

    if (!landmarks) {
      setFaceDetected(false);
      drawOverlay(null, width, height);
      if (currentPhase === 'ready') {
        setFeedback('Position your face in the oval');
      }
      holdCountRef.current = 0;
      rafRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    setFaceDetected(true);
    drawOverlay(landmarks, width, height);

    const yaw = estimateYaw(landmarks);
    const depthVar = zDepthVariance(landmarks);

    // Collect depth samples for final analysis
    depthSamplesRef.current.push(depthVar);

    if (currentPhase === 'ready') {
      // Waiting for face — auto-advance to first challenge
      setFeedback('Face detected — starting challenge');
      holdCountRef.current = 0;
      setTimeout(() => {
        setPhase('challenge-left');
        setFeedback('Turn your head to the LEFT');
      }, 800);
      rafRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    if (currentPhase === 'challenge-left') {
      // yaw negative = head turned to their left (mirrored)
      if (yaw > YAW_THRESHOLD) {
        holdCountRef.current++;
        setFeedback('Hold…');
        if (holdCountRef.current >= HOLD_FRAMES) {
          holdCountRef.current = 0;
          setPhase('challenge-right');
          setFeedback('Now turn your head to the RIGHT');
        }
      } else {
        holdCountRef.current = Math.max(0, holdCountRef.current - 1);
        setFeedback('Turn your head to the LEFT');
      }
    }

    if (currentPhase === 'challenge-right') {
      if (yaw < -YAW_THRESHOLD) {
        holdCountRef.current++;
        setFeedback('Hold…');
        if (holdCountRef.current >= HOLD_FRAMES) {
          // Evaluate liveness
          const avgDepth =
            depthSamplesRef.current.reduce((a, b) => a + b, 0) /
            depthSamplesRef.current.length;
          const isLive = avgDepth > DEPTH_VARIANCE_MIN;
          setResult(isLive ? 'live' : 'not-live');
          setPhase('result');
          setFeedback('');
          cleanup();
        }
      } else {
        holdCountRef.current = Math.max(0, holdCountRef.current - 1);
        setFeedback('Turn your head to the RIGHT');
      }
    }

    rafRef.current = requestAnimationFrame(runDetectionLoop);
  }, [drawOverlay, cleanup]);

  /* ---------------------------------------------------------- */
  /* Start                                                       */
  /* ---------------------------------------------------------- */

  const handleStart = useCallback(async () => {
    setPhase('initializing');
    setResult(null);
    setFeedback('Loading face detection model…');
    holdCountRef.current = 0;
    depthSamplesRef.current = [];

    try {
      // Dynamic import keeps the WASM out of the main bundle
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
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
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

      setPhase('ready');
      setFeedback('Position your face in the oval');

      // Start detection loop
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
    holdCountRef.current = 0;
    depthSamplesRef.current = [];
  }, [cleanup]);

  /* ---------------------------------------------------------- */
  /* Render                                                      */
  /* ---------------------------------------------------------- */

  const isActive = phase !== 'idle' && phase !== 'result';
  const showCamera = phase === 'initializing' || phase === 'ready' || phase === 'challenge-left' || phase === 'challenge-right';

  // Progress indicator
  const stepIndex =
    phase === 'challenge-left' ? 1 :
    phase === 'challenge-right' ? 2 :
    phase === 'result' ? 3 : 0;

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
            {/* Progress steps */}
            <div className="liveness-steps">
              <div className={`liveness-step ${stepIndex >= 1 ? 'active' : ''} ${stepIndex > 1 ? 'done' : ''}`}>
                <span className="liveness-step-num">{stepIndex > 1 ? '✓' : '1'}</span>
                <span className="liveness-step-label">Turn Left</span>
              </div>
              <div className="liveness-step-line" />
              <div className={`liveness-step ${stepIndex >= 2 ? 'active' : ''} ${stepIndex > 2 ? 'done' : ''}`}>
                <span className="liveness-step-num">{stepIndex > 2 ? '✓' : '2'}</span>
                <span className="liveness-step-label">Turn Right</span>
              </div>
            </div>

            {/* Camera viewport */}
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
              <div className={`liveness-result-icon ${result === 'live' ? 'success' : 'fail'}`}>
                {result === 'live' ? (
                  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ) : (
                  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                )}
              </div>
              <h4 className="liveness-result-title">
                {result === 'live' ? 'Liveness Confirmed' : 'Liveness Not Detected'}
              </h4>
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
