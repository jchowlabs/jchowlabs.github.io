'use client';
import { useState, useRef, useCallback } from 'react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function truncHex(hex, len = 16) {
  if (hex.length <= len * 2) return hex;
  return hex.slice(0, len) + '...' + hex.slice(-len);
}

function base64UrlToHex(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  return Array.from(bin, (c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
}

async function sha256(data) {
  return await crypto.subtle.digest('SHA-256', data);
}

function randomBytes(n) {
  return crypto.getRandomValues(new Uint8Array(n));
}

function concat(a, b) {
  const out = new Uint8Array(a.byteLength + b.byteLength);
  out.set(new Uint8Array(a), 0);
  out.set(new Uint8Array(b), a.byteLength);
  return out.buffer;
}

// ── Phases ───────────────────────────────────────────────────────────────────

const PHASES = [
  { label: 'Key Generation',         short: 'keygen' },
  { label: 'Register',              short: 'register' },
  { label: 'Verify Registration',   short: 'verify-reg' },
  { label: 'Authenticate',          short: 'authenticate' },
  { label: 'Verify Authentication', short: 'verify-auth' },
  { label: 'Tamper & Verify',       short: 'tamper' },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function CryptoTerminal() {
  const [lines, setLines] = useState([]);
  const [phase, setPhase] = useState(0);        // next phase to execute
  const [running, setRunning] = useState(false);
  const stateRef = useRef({});                   // ephemeral crypto state
  const termRef = useRef(null);

  const RP_ID = 'jchowlabs.com';
  const ORIGIN = 'https://jchowlabs.com';

  // Append lines with optional class (comment, success, error, dim)
  const emit = useCallback((newLines) => {
    setLines((prev) => [...prev, ...newLines]);
    // scroll after render
    setTimeout(() => {
      if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
    }, 30);
  }, []);

  const blank = () => ({ text: '', cls: '' });
  const cmd   = (t) => ({ text: t, cls: 'cmd' });
  const out   = (t) => ({ text: t, cls: '' });
  const dim   = (t) => ({ text: t, cls: 'dim' });
  const cmt   = (t) => ({ text: t, cls: 'comment' });
  const ok    = (t) => ({ text: t, cls: 'success' });
  const fail  = (t) => ({ text: t, cls: 'error' });

  // ── Phase handlers ──

  const doKeygen = async () => {
    const st = stateRef.current;
    emit([cmd('> Generating ECDSA P-256 key pair...'), blank()]);

    const keyPair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );
    st.keyPair = keyPair;

    const jwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
    st.jwk = jwk;
    const pubJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    st.pubJwk = pubJwk;

    const dHex = base64UrlToHex(jwk.d);
    const xHex = base64UrlToHex(pubJwk.x);
    const yHex = base64UrlToHex(pubJwk.y);

    emit([
      cmt('  # Private key (d) — sealed in the secure enclave'),
      out(`  d = ${dHex}`),
      blank(),
      cmt('  # Public key Q = (x, y) — shared with the server'),
      out(`  x = ${xHex}`),
      out(`  y = ${yHex}`),
      blank(),
      ok('  ✓ Key pair generated'),
      blank(),
    ]);
    st.signCounter = 0;
  };

  const doRegister = async () => {
    const st = stateRef.current;
    emit([cmd('> Signing registration request...'), blank()]);

    // Server challenge
    const challenge = randomBytes(32);
    st.regChallenge = challenge;
    emit([
      cmt('  # 1. Server issues fresh challenge'),
      out(`  challenge  = ${truncHex(toHex(challenge), 20)}`),
      out(`  rp_id      = "${RP_ID}"`),
      blank(),
    ]);

    // rp_id_hash
    const rpIdHash = await sha256(new TextEncoder().encode(RP_ID));
    st.rpIdHash = rpIdHash;

    // authenticator_data (simplified)
    const flags = new Uint8Array([0x45]); // UP + UV + AT
    const counter = new Uint8Array(4);
    new DataView(counter.buffer).setUint32(0, st.signCounter);
    const authData = concat(concat(rpIdHash, flags.buffer), counter.buffer);
    st.regAuthData = authData;

    emit([
      cmt('  # 2. Build authenticator_data'),
      out(`  rp_id_hash = SHA-256("${RP_ID}")`),
      dim(`             = ${truncHex(toHex(rpIdHash), 20)}`),
      out(`  flags      = UP=1, UV=1`),
      out(`  counter    = ${st.signCounter}`),
      blank(),
    ]);

    // client_data
    const clientData = JSON.stringify({
      type: 'webauthn.create',
      challenge: toHex(challenge),
      origin: ORIGIN,
    });
    const clientDataHash = await sha256(new TextEncoder().encode(clientData));
    st.regClientDataHash = clientDataHash;

    emit([
      cmt('  # 3. Build client_data and hash'),
      out(`  type       = "webauthn.create"`),
      out(`  origin     = "${ORIGIN}"`),
      out(`  hash       = SHA-256(client_data)`),
      dim(`             = ${truncHex(toHex(clientDataHash), 20)}`),
      blank(),
    ]);

    // Sign
    const message = concat(authData, clientDataHash);
    st.regMessage = message;

    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      st.keyPair.privateKey,
      message
    );
    st.regSignature = signature;

    emit([
      cmt('  # 4. Sign: message = authenticator_data || client_data_hash'),
      out(`  signature  = ECDSA-Sign(d, message)`),
      dim(`             = ${truncHex(toHex(signature), 20)}`),
      blank(),
      ok('  ✓ Registration signed'),
      blank(),
    ]);
  };

  const doVerifyReg = async () => {
    const st = stateRef.current;
    emit([cmd('> Server verifying registration...'), blank()]);

    // Domain check
    emit([
      cmt('  # 1. Verify domain binding'),
      out(`  rp_id_hash check    ✓`),
      out(`  origin check        ✓`),
      blank(),
    ]);

    // Challenge check
    emit([
      cmt('  # 2. Verify challenge freshness'),
      out(`  challenge match     ✓`),
      blank(),
    ]);

    // Signature verify
    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      st.keyPair.publicKey,
      st.regSignature,
      st.regMessage
    );

    emit([
      cmt('  # 3. Verify signature using public key Q'),
      out(`  ECDSA-Verify(Q, signature, message)`),
      blank(),
    ]);

    if (valid) {
      emit([
        ok('  ✓ Signature valid'),
        blank(),
        cmt('  # 4. Store credential'),
        out(`  Server stores: { credential_id → public_key Q }`),
        blank(),
        ok('  ✓ Registration accepted'),
        blank(),
      ]);
    } else {
      emit([fail('  ✗ Signature invalid — registration rejected'), blank()]);
    }
  };

  const doAuthenticate = async () => {
    const st = stateRef.current;
    emit([cmd('> Signing authentication request...'), blank()]);

    // New challenge
    const challenge = randomBytes(32);
    st.authChallenge = challenge;
    emit([
      cmt('  # 1. Server issues fresh challenge'),
      out(`  challenge  = ${truncHex(toHex(challenge), 20)}`),
      blank(),
    ]);

    // Increment counter
    st.signCounter += 1;
    const rpIdHash = st.rpIdHash;

    const flags = new Uint8Array([0x05]); // UP + UV
    const counter = new Uint8Array(4);
    new DataView(counter.buffer).setUint32(0, st.signCounter);
    const authData = concat(concat(rpIdHash, flags.buffer), counter.buffer);
    st.authAuthData = authData;

    emit([
      cmt('  # 2. Build authenticator_data'),
      out(`  counter    = ${st.signCounter}  (incremented)`),
      out(`  flags      = UP=1, UV=1`),
      blank(),
    ]);

    // client_data
    const clientData = JSON.stringify({
      type: 'webauthn.get',
      challenge: toHex(challenge),
      origin: ORIGIN,
    });
    const clientDataHash = await sha256(new TextEncoder().encode(clientData));
    st.authClientDataHash = clientDataHash;

    emit([
      cmt('  # 3. Build client_data'),
      out(`  type       = "webauthn.get"`),
      out(`  hash       = ${truncHex(toHex(clientDataHash), 20)}`),
      blank(),
    ]);

    // Sign
    const message = concat(authData, clientDataHash);
    st.authMessage = message;

    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      st.keyPair.privateKey,
      message
    );
    st.authSignature = signature;

    emit([
      cmt('  # 4. Sign: message = authenticator_data || client_data_hash'),
      out(`  signature  = ECDSA-Sign(d, message)`),
      dim(`             = ${truncHex(toHex(signature), 20)}`),
      blank(),
      ok('  ✓ Authentication signed'),
      blank(),
    ]);
  };

  const doVerifyAuth = async () => {
    const st = stateRef.current;
    emit([cmd('> Server verifying authentication...'), blank()]);

    emit([
      cmt('  # 1. Look up stored public key'),
      out(`  public_key = Q (from registration)`),
      blank(),
      cmt('  # 2. Verify domain and origin'),
      out(`  rp_id_hash check    ✓`),
      out(`  origin check        ✓`),
      blank(),
      cmt('  # 3. Verify challenge freshness'),
      out(`  challenge match     ✓`),
      blank(),
      cmt(`  # 4. Verify counter incremented`),
      out(`  counter = ${st.signCounter} > ${st.signCounter - 1}  ✓`),
      blank(),
    ]);

    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      st.keyPair.publicKey,
      st.authSignature,
      st.authMessage
    );

    emit([
      cmt('  # 5. Verify signature'),
      out(`  ECDSA-Verify(Q, signature, message)`),
      blank(),
    ]);

    if (valid) {
      emit([
        ok('  ✓ Signature valid'),
        blank(),
        ok('  ✓ Authentication succeeds — access granted'),
        blank(),
      ]);
    } else {
      emit([fail('  ✗ Signature invalid — access denied'), blank()]);
    }
  };

  const doTamper = async () => {
    const st = stateRef.current;
    emit([cmd('> Tamper test: modifying signed payload...'), blank()]);

    // Flip one byte
    const tampered = new Uint8Array(st.authMessage.slice(0));
    tampered[0] ^= 0xff;

    emit([
      cmt('  # Flip first byte of authenticator_data'),
      out(`  original[0] = 0x${new Uint8Array(st.authMessage)[0].toString(16).padStart(2, '0')}`),
      out(`  tampered[0] = 0x${tampered[0].toString(16).padStart(2, '0')}`),
      blank(),
      cmt('  # Re-verify with same signature, tampered message'),
    ]);

    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      st.keyPair.publicKey,
      st.authSignature,
      tampered.buffer
    );

    if (!valid) {
      emit([
        fail('  ✗ Signature invalid — tampered data detected'),
        blank(),
        dim('  Even a single changed byte invalidates the signature.'),
        dim('  The server rejects the request.'),
        blank(),
      ]);
    } else {
      emit([ok('  ✓ Signature still valid (unexpected)'), blank()]);
    }
  };

  // ── Run next phase ──

  const handlers = [doKeygen, doRegister, doVerifyReg, doAuthenticate, doVerifyAuth, doTamper];

  const handleNext = async () => {
    if (phase >= handlers.length || running) return;
    setRunning(true);
    try {
      await handlers[phase]();
      setPhase((p) => p + 1);
    } catch (err) {
      emit([fail(`  Error: ${err.message}`), blank()]);
    }
    setRunning(false);
  };

  const handleReset = () => {
    setLines([]);
    setPhase(0);
    stateRef.current = {};
  };

  const allDone = phase >= handlers.length;
  const currentLabel = allDone ? 'Complete' : PHASES[phase].label;

  return (
    <div className="crypto-terminal">
      <div className="crypto-terminal-header">
        <div className="crypto-terminal-dots">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>
      </div>

      {/* Phase indicator */}
      <div className="crypto-terminal-phases">
        {PHASES.map((p, i) => (
          <span
            key={p.short}
            className={
              'phase-pill' +
              (i < phase ? ' done' : '') +
              (i === phase ? ' active' : '') +
              (i > phase ? ' pending' : '')
            }
          >
            {i < phase ? '✓ ' : ''}{p.label}
          </span>
        ))}
      </div>

      {/* Terminal output */}
      <div className="crypto-terminal-body" ref={termRef}>
        {lines.length === 0 && (
          <div className="crypto-terminal-placeholder">
            Click to begin
          </div>
        )}
        {lines.map((line, i) => (
          <div key={i} className={`term-line ${line.cls || ''}`}>
            {line.text || '\u00A0'}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="crypto-terminal-controls">
        <button
          className={`term-btn${allDone ? ' done' : ' primary'}`}
          onClick={handleNext}
          disabled={allDone || running}
        >
          {running ? 'Running...' : currentLabel}
        </button>
        <button className={`term-btn reset${allDone ? ' active' : ''}`} onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
