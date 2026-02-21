/**
 * jchowlabs Voice Assistant — Single Orb WebRTC Client
 *
 * Ultra-minimal UI: one pill that morphs between idle and active.
 * Idle:   [orb] Voice chat
 * Active: [ORB]  (breathing + glow, click to end)
 */
(function () {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================

  var VOICE_CHAT_ENABLED = true; // Enables Voice Chat on site (true / false toggle)

  var WORKER_URL = 'https://jchowlabs-chatbot.jchow-a27.workers.dev';
  var REALTIME_MODEL = 'gpt-4o-mini-realtime-preview-2024-12-17';
  var GREETING_INSTRUCTION =
    'Greet the user briefly. Say something like: Hi! I\'m the Jay Chow Labs assistant. ' +
    'I can help you find articles on AI and security topics, or connect you with Jason. ' +
    'What are you interested in?';

  var CONTINUE_INSTRUCTION =
    'The user just asked to visit an article and you navigated them here. ' +
    'Say something brief like: Here you go! Let me know if you have any other questions, ' +
    'or if there\'s anything else I can help you find.';

  // ============================================================
  // STATE
  // ============================================================

  var pc = null;
  var dc = null;
  var micStream = null;
  var micTrack = null;
  var audioEl = null;

  var isConnected = false;
  var pendingNavigate = null;
  var pendingContact = false;
  var sessionGreeting = null;

  // Idle timeout
  var IDLE_CHECK_IN_MS = 20000;   // 20s silence → "Still there?"
  var IDLE_FAREWELL_MS = 10000;   // 10s after check-in → auto-end
  var idleTimer = null;
  var idleCheckedIn = false;       // true after first check-in sent
  var pendingEnd = false;          // true after farewell sent, blocks timer resets
  var speechResponseTimeout = null; // detects silent chatbot after user speech
  var micUnmuteTimer = null;          // delay before re-enabling mic after bot speaks

  // Max session duration
  var SESSION_MAX_MS  = 300000;   // 5 minutes hard cap
  var SESSION_WARN_MS = 270000;   // 4:30 — 30s warning before cap
  var sessionWarnTimer = null;
  var sessionMaxTimer  = null;

  // DOM references
  var pill, pillOrb, pillLabel;

  // ============================================================
  // BOOT
  // ============================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  function boot() {
    if (!VOICE_CHAT_ENABLED) return; // Kill switch — pill never renders

    injectDOM();
    bindEvents();

    // Auto-open contact modal if redirected with ?contact=1
    if (window.location.search.indexOf('contact=1') !== -1) {
      setTimeout(function () {
        if (typeof window.openModal === 'function') {
          window.openModal({ preventDefault: function () {} });
        }
      }, 500);
    }

    // Continue session after page navigation
    var continuation = sessionStorage.getItem('va_continue');
    if (continuation) {
      sessionStorage.removeItem('va_continue');
      // Go straight to active orb and reconnect
      pill.classList.add('active', 'connecting');
      pill.setAttribute('aria-label', 'End voice assistant');
      startSession(CONTINUE_INSTRUCTION);
    }
  }

  // ============================================================
  // DOM INJECTION
  // ============================================================

  function injectDOM() {
    pill = document.createElement('div');
    pill.className = 'va-pill';
    pill.setAttribute('role', 'button');
    pill.setAttribute('aria-label', 'Open voice assistant');
    pill.innerHTML =
      '<div class="va-pill-orb"></div>' +
      '<span class="va-pill-label">Voice chat</span>';

    document.body.appendChild(pill);

    // Cache refs
    pillOrb = pill.querySelector('.va-pill-orb');
    pillLabel = pill.querySelector('.va-pill-label');
  }

  // ============================================================
  // EVENTS
  // ============================================================

  function bindEvents() {
    pill.addEventListener('click', handlePillClick);

    window.addEventListener('beforeunload', function () {
      if (isConnected) endSession(true);
    });
  }

  // ============================================================
  // PILL CLICK — TOGGLE SESSION
  // ============================================================

  function handlePillClick() {
    if (isConnected) {
      endSession();
    } else {
      // Transition to active state and start session
      pill.classList.add('active', 'connecting');
      pill.setAttribute('aria-label', 'End voice assistant');
      startSession(GREETING_INSTRUCTION);
    }
  }

  // ============================================================
  // SESSION LIFECYCLE (WebRTC → OpenAI Realtime API)
  // ============================================================

  function startSession(greetingInstruction) {
    sessionGreeting = greetingInstruction || GREETING_INSTRUCTION;

    // Check for pre-fetched token from navigation
    var prefetchedToken = sessionStorage.getItem('va_prefetch_token');
    var tokenPromise;

    if (prefetchedToken) {
      sessionStorage.removeItem('va_prefetch_token');
      tokenPromise = Promise.resolve({ token: prefetchedToken });
    } else {
      tokenPromise = fetch(WORKER_URL + '/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(function (res) {
          if (!res.ok) {
            return res.json().catch(function () { return {}; }).then(function (err) {
              throw new Error(err.message || 'Failed to get session token');
            });
          }
          return res.json();
        });
    }

    tokenPromise
      .then(function (sessionData) {
        return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
          return { token: sessionData.token, stream: stream };
        });
      })
      .then(function (ctx) {
        micStream = ctx.stream;
        micTrack = micStream.getTracks()[0];

        pc = new RTCPeerConnection();

        audioEl = document.createElement('audio');
        audioEl.autoplay = true;
        pc.ontrack = function (e) {
          audioEl.srcObject = e.streams[0];
        };

        pc.oniceconnectionstatechange = function () {
          if (pc && pc.iceConnectionState === 'failed') {
            endSession();
            showError();
          }
        };

        pc.addTrack(micTrack);

        dc = pc.createDataChannel('oai-events');
        dc.addEventListener('open', onChannelOpen);
        dc.addEventListener('message', onChannelMessage);
        dc.addEventListener('close', onChannelClose);

        return pc.createOffer().then(function (offer) {
          return pc.setLocalDescription(offer).then(function () {
            return fetch(
              'https://api.openai.com/v1/realtime?model=' + REALTIME_MODEL,
              {
                method: 'POST',
                headers: {
                  'Authorization': 'Bearer ' + ctx.token,
                  'Content-Type': 'application/sdp',
                },
                body: offer.sdp,
              }
            );
          });
        });
      })
      .then(function (sdpRes) {
        if (!sdpRes.ok) throw new Error('WebRTC negotiation failed');
        return sdpRes.text();
      })
      .then(function (answerSdp) {
        return pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
      })
      .catch(function (err) {
        console.error('Session start failed:', err);
        showError();
      });
  }

  function endSession(silent) {
    isConnected = false;
    pendingEnd = false;
    clearTimeout(speechResponseTimeout);
    clearTimeout(micUnmuteTimer);
    clearTimeout(sessionWarnTimer);
    clearTimeout(sessionMaxTimer);
    sessionWarnTimer = null;
    sessionMaxTimer = null;
    stopIdleTimer();

    if (dc) { try { dc.close(); } catch (_) {} dc = null; }
    if (pc) { try { pc.close(); } catch (_) {} pc = null; }
    if (micStream) {
      micStream.getTracks().forEach(function (t) { t.stop(); });
      micStream = null;
      micTrack = null;
    }
    if (audioEl) {
      audioEl.pause();
      audioEl.srcObject = null;
      audioEl = null;
    }

    pendingNavigate = null;
    pendingContact = false;

    if (!silent) {
      resetToIdle();
    }
  }

  function resetToIdle() {
    pill.classList.remove('active', 'connecting', 'speaking', 'error');
    pillLabel.textContent = 'Voice chat';
    pill.setAttribute('aria-label', 'Open voice assistant');
  }

  function showError() {
    pill.classList.remove('active', 'connecting', 'speaking');
    pill.classList.add('error');
    pillLabel.textContent = 'Unavailable';
    pill.setAttribute('aria-label', 'Voice assistant unavailable');
    setTimeout(function () {
      pill.classList.remove('error');
      pillLabel.textContent = 'Voice chat';
      pill.setAttribute('aria-label', 'Open voice assistant');
    }, 4000);
  }

  // ============================================================
  // IDLE TIMEOUT
  // ============================================================

  function resetIdleTimer() {
    if (pendingEnd) return;  // farewell in progress, don't restart
    clearTimeout(idleTimer);
    // Use the appropriate delay based on current phase
    var delay = idleCheckedIn ? IDLE_FAREWELL_MS : IDLE_CHECK_IN_MS;
    idleTimer = setTimeout(onIdleTick, delay);
  }

  function stopIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = null;
    idleCheckedIn = false;
    // NOTE: pendingEnd is intentionally NOT reset here.
    // Only endSession() should clear it.
  }

  function onIdleTick() {
    if (!isConnected || !dc || dc.readyState !== 'open') return;

    // Don't fire if the bot is currently speaking
    if (pill.classList.contains('speaking')) {
      idleTimer = setTimeout(onIdleTick, IDLE_CHECK_IN_MS);
      return;
    }

    if (!idleCheckedIn) {
      // First timeout — ask user if they need more help
      idleCheckedIn = true;
      dc.send(JSON.stringify({
        type: 'response.create',
        response: {
          modalities: ['text', 'audio'],
          instructions: 'The user has been quiet. Ask if there are any topics that interest them, or offer to give them a recommendation. Keep it to one short, natural sentence. Do NOT call any functions — just speak.',
        },
      }));
      // Start farewell timer
      idleTimer = setTimeout(onIdleTick, IDLE_FAREWELL_MS);
    } else {
      // Second timeout — say goodbye and end session
      pendingEnd = true;  // block any further idle timer resets
      stopIdleTimer();    // clear all timers
      dc.send(JSON.stringify({
        type: 'response.create',
        response: {
          modalities: ['text', 'audio'],
          instructions: 'The user is still silent. Say a brief goodbye, like: No worries, feel free to come back anytime. Do NOT call any functions — just speak.',
        },
      }));
      // Session will close when this response finishes (see response.done handler)
    }
  }

  // ============================================================
  // DATA CHANNEL
  // ============================================================

  function onChannelOpen() {
    isConnected = true;
    pill.classList.remove('connecting');
    // 'active' class already applied — orb is now breathing + glowing

    dc.send(JSON.stringify({
      type: 'response.create',
      response: {
        modalities: ['text', 'audio'],
        instructions: sessionGreeting,
      },
    }));

    // Start idle monitoring
    resetIdleTimer();

    // Start max session timers
    sessionWarnTimer = setTimeout(function () {
      if (isConnected && dc && dc.readyState === 'open') {
        dc.send(JSON.stringify({
          type: 'response.create',
          response: {
            modalities: ['text', 'audio'],
            instructions: 'Let the user know this session will wrap up in about 30 seconds. Ask if there\'s anything quick they need before it ends. Keep it to one or two short sentences. Do NOT call any functions — just speak.',
          },
        }));
      }
    }, SESSION_WARN_MS);

    sessionMaxTimer = setTimeout(function () {
      if (isConnected) endSession();
    }, SESSION_MAX_MS);
  }

  function onChannelMessage(e) {
    var event;
    try { event = JSON.parse(e.data); } catch (_) { return; }

    switch (event.type) {

      // User started speaking — reset idle timer to initial phase
      case 'input_audio_buffer.speech_started':
        idleCheckedIn = false;
        pendingEnd = false;
        resetIdleTimer();
        break;

      // Bot is generating audio — faster breathing + mute mic to prevent echo
      case 'response.audio.delta':
        pill.classList.add('speaking');
        clearTimeout(speechResponseTimeout);
        clearTimeout(micUnmuteTimer);
        // Mute mic while bot speaks to prevent audio bleed triggering VAD
        if (micTrack && micTrack.enabled) micTrack.enabled = false;
        // Pause idle timer while bot is actively speaking
        clearTimeout(idleTimer);
        break;

      case 'response.audio.done':
        pill.classList.remove('speaking');
        break;

      // Tool call
      case 'response.function_call_arguments.done':
        handleFunctionCall(event);
        break;

      // Response finished
      case 'response.done':
        pill.classList.remove('speaking');
        // Re-enable mic after a short delay to avoid speaker bleed
        clearTimeout(micUnmuteTimer);
        micUnmuteTimer = setTimeout(function () {
          if (micTrack) micTrack.enabled = true;
        }, 300);
        if (pendingEnd) {
          // Farewell audio just finished — close session now
          endSession();
        } else {
          resetIdleTimer();
          handleResponseDone();
        }
        break;

      // Errors
      case 'error':
        console.error('Realtime API error:', event.error);
        // If the error is unrecoverable, end session with error UI
        if (event.error && (event.error.code === 'session_expired' ||
            event.error.code === 'rate_limit_exceeded' ||
            event.error.code === 'server_error')) {
          endSession();
          showError();
        }
        break;

      // Input audio buffer cleared or speech stopped without response
      case 'input_audio_buffer.speech_stopped':
        // VAD detected end of speech — response should follow.
        // If none comes within 8s, something went wrong.
        clearTimeout(speechResponseTimeout);
        speechResponseTimeout = setTimeout(function () {
          if (isConnected && dc && dc.readyState === 'open') {
            // Nudge the API to respond
            dc.send(JSON.stringify({ type: 'response.create' }));
          }
        }, 8000);
        break;

      default:
        break;
    }
  }

  function handleFunctionCall(event) {
    var name = event.name;
    var args = {};
    try { args = JSON.parse(event.arguments || '{}'); } catch (_) {}

    if (dc && dc.readyState === 'open') {
      dc.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: event.call_id,
          output: JSON.stringify({ success: true }),
        },
      }));
      dc.send(JSON.stringify({ type: 'response.create' }));
    }

    if (name === 'navigate' && args.url) {
      pendingNavigate = args.url;
    }
    if (name === 'open_contact') {
      pendingContact = true;
    }
  }

  function handleResponseDone() {
    if (pendingNavigate) {
      var url = pendingNavigate;
      pendingNavigate = null;
      // Pre-fetch token before navigating so the new page connects faster
      fetch(WORKER_URL + '/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (data) {
          if (data && data.token) {
            sessionStorage.setItem('va_prefetch_token', data.token);
          }
          sessionStorage.setItem('va_continue', '1');
          endSession(true);
          window.location.href = url;
        })
        .catch(function () {
          sessionStorage.setItem('va_continue', '1');
          endSession(true);
          window.location.href = url;
        });
    }
    if (pendingContact) {
      pendingContact = false;
      openContact();
    }
  }

  function onChannelClose() {
    if (isConnected) {
      // Unexpected close (e.g. ephemeral token expired) — show error
      endSession();
      showError();
    }
  }

  // ============================================================
  // CONTACT HELPER
  // ============================================================

  function openContact() {
    var p = window.location.pathname;
    var onIndex = p === '/' || p === '/index.html' || p.endsWith('/index.html');

    if (onIndex && typeof window.openModal === 'function') {
      // On index page — just show the modal, keep session alive
      window.openModal({ preventDefault: function () {} });
      return;
    }

    // On a sub-page — navigate to index with contact flag (uses session continuity)
    var basePath = p.indexOf('/insights/') !== -1 ||
                   p.indexOf('/research/') !== -1 ||
                   p.indexOf('/lab/') !== -1
                   ? '../index.html' : 'index.html';

    var url = basePath + '?contact=1';

    fetch(WORKER_URL + '/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (data && data.token) {
          sessionStorage.setItem('va_prefetch_token', data.token);
        }
        sessionStorage.setItem('va_continue', '1');
        endSession(true);
        window.location.href = url;
      })
      .catch(function () {
        sessionStorage.setItem('va_continue', '1');
        endSession(true);
        window.location.href = url;
      });
  }

})();
