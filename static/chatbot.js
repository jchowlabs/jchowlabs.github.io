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
    'IMPORTANT: This is a CONTINUATION of an existing conversation — the user already spoke with you ' +
    'and you navigated them to this page. Do NOT give a site overview. Do NOT describe what the site offers. ' +
    'Do NOT suggest articles. Just say something brief like: Here you go! Let me know if you have any ' +
    'other questions, or if there\'s anything else I can help you find.';

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
  var sessionTimerInterval = null;    // 1s interval for updating timer display
  var botSpeaking = false;            // true while bot is generating/playing audio

  // Max session duration
  var SESSION_MAX_MS  = 300000;   // 5 minutes hard cap
  var SESSION_WARN_MS = 270000;   // 4:30 — 30s warning before cap
  var sessionWarnTimer = null;
  var sessionMaxTimer  = null;

  // DOM references
  var pill, pillOrb, pillLabel, pillClose;

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

    // Detect continuation before DOM injection so pill renders in the right state
    var continuation = sessionStorage.getItem('va_continue');
    var isContinuation = !!continuation;

    injectDOM(isContinuation);
    bindEvents();

    // Clean up stale session start time if no continuation pending
    if (!isContinuation) {
      sessionStorage.removeItem('va_session_start');
    }

    // Auto-open contact modal if redirected with ?contact=1
    if (window.location.search.indexOf('contact=1') !== -1) {
      setTimeout(function () {
        if (typeof window.openModal === 'function') {
          window.openModal({ preventDefault: function () {} });
        }
      }, 500);
    }

    // Continue session after page navigation
    if (isContinuation) {
      sessionStorage.removeItem('va_continue');
      var navDest = sessionStorage.getItem('va_nav_dest') || '';
      sessionStorage.removeItem('va_nav_dest');
      // Build a contextual continuation instruction
      var instruction = CONTINUE_INSTRUCTION;
      if (navDest) {
        instruction += ' The page you navigated them to is: ' + navDest + '.';
      }
      // Pill already rendered in active state by injectDOM — just start session
      startSession(instruction);
    }
  }

  // ============================================================
  // DOM INJECTION
  // ============================================================

  function injectDOM(activeState) {
    pill = document.createElement('div');
    pill.className = activeState ? 'va-pill active connecting' : 'va-pill';
    pill.setAttribute('role', 'button');
    pill.setAttribute('aria-label', activeState ? 'End voice assistant' : 'Open voice assistant');

    // For continuations, show timer immediately; otherwise show label
    var startTime = activeState ? parseInt(sessionStorage.getItem('va_session_start'), 10) : 0;
    var labelText = 'Voice chat';
    if (activeState && startTime) {
      var elapsed = Math.floor((Date.now() - startTime) / 1000);
      var mins = Math.floor(elapsed / 60);
      var secs = elapsed % 60;
      labelText = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    pill.innerHTML =
      '<div class="va-pill-orb"></div>' +
      '<span class="va-pill-label">' + labelText + '</span>' +
      '<button class="va-pill-close" aria-label="End session">&times;</button>';

    document.body.appendChild(pill);

    // Cache refs
    pillOrb = pill.querySelector('.va-pill-orb');
    pillLabel = pill.querySelector('.va-pill-label');
    pillClose = pill.querySelector('.va-pill-close');

    // Start timer ticking immediately for continuations
    if (activeState && startTime) {
      startSessionTimer();
    }
  }

  // ============================================================
  // EVENTS
  // ============================================================

  function bindEvents() {
    pill.addEventListener('click', handlePillClick);
    pillClose.addEventListener('click', function (e) {
      e.stopPropagation(); // don't trigger pill click → start new session
      if (isConnected) endSession();
    });

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
      sessionStorage.setItem('va_session_start', String(Date.now()));
      pill.classList.add('active', 'connecting');
      pill.setAttribute('aria-label', 'End voice assistant');
      pillLabel.textContent = '00:00';
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
        return navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        }).then(function (stream) {
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
          // Explicit play() for mobile browsers that block autoplay
          var playPromise = audioEl.play();
          if (playPromise) playPromise.catch(function () {});
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
    botSpeaking = false;
    clearTimeout(speechResponseTimeout);
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

    // Stop session timer; clear start time unless navigating (silent)
    stopSessionTimer();
    if (!silent) {
      sessionStorage.removeItem('va_session_start');
    }

    if (!silent) {
      resetToIdle();
    }
  }

  function resetToIdle() {
    pill.classList.remove('active', 'connecting', 'speaking', 'error');
    pillLabel.textContent = 'Voice chat';
    pill.setAttribute('aria-label', 'Open voice assistant');
  }

  // ============================================================
  // SESSION TIMER
  // ============================================================

  function startSessionTimer() {
    stopSessionTimer();
    updateTimerDisplay();
    sessionTimerInterval = setInterval(updateTimerDisplay, 1000);
  }

  function stopSessionTimer() {
    clearInterval(sessionTimerInterval);
    sessionTimerInterval = null;
  }

  function updateTimerDisplay() {
    var startTime = parseInt(sessionStorage.getItem('va_session_start'), 10);
    if (!startTime) return;
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    var mins = Math.floor(elapsed / 60);
    var secs = elapsed % 60;
    pillLabel.textContent = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
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

    // Start the visible session timer
    startSessionTimer();

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

      // User started speaking — barge-in: immediately stop bot audio
      case 'input_audio_buffer.speech_started':
        if (botSpeaking) {
          // Stop local playback instantly so user doesn't hear overlap
          if (audioEl) { audioEl.pause(); audioEl.currentTime = 0; }
          // Tell server to cancel current response and flush audio buffer
          if (dc && dc.readyState === 'open') {
            dc.send(JSON.stringify({ type: 'response.cancel' }));
            dc.send(JSON.stringify({ type: 'output_audio_buffer.clear' }));
          }
          botSpeaking = false;
          pill.classList.remove('speaking');
        }
        idleCheckedIn = false;
        pendingEnd = false;
        resetIdleTimer();
        break;

      // Bot is generating audio — faster breathing
      case 'response.audio.delta':
        botSpeaking = true;
        pill.classList.add('speaking');
        clearTimeout(speechResponseTimeout);
        // Pause idle timer while bot is actively speaking
        clearTimeout(idleTimer);
        // Resume audio element if it was paused by barge-in
        if (audioEl && audioEl.paused) {
          var p = audioEl.play();
          if (p) p.catch(function () {});
        }
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
        botSpeaking = false;
        pill.classList.remove('speaking');
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

      // VAD detected end of speech — server will auto-create response
      case 'input_audio_buffer.speech_stopped':
        clearTimeout(speechResponseTimeout);
        // Safety fallback: if server doesn't respond within 8s, nudge it
        speechResponseTimeout = setTimeout(function () {
          if (isConnected && dc && dc.readyState === 'open') {
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
          sessionStorage.setItem('va_nav_dest', url);
          endSession(true);
          window.location.href = url;
        })
        .catch(function () {
          sessionStorage.setItem('va_continue', '1');
          sessionStorage.setItem('va_nav_dest', url);
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
