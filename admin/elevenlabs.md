# ElevenLabs Conversational Agent — Setup Documentation

## Overview

The jchowlabs concierge is a voice-enabled AI agent powered by ElevenLabs Conversational AI. It serves as a website concierge that helps visitors find articles and connect with Jason Chow. This replaces the previous OpenAI Realtime API implementation.

**Agent Name:** jchowlabs concierge  
**Agent ID:** `agent_9901kj9dzjy3esqvjfs4z9xm5dfv`  
**Platform:** ElevenLabs Conversational AI  
**Dashboard:** [https://elevenlabs.io/app/conversational-ai](https://elevenlabs.io/app/conversational-ai)  
**SDK:** `@elevenlabs/client` (npm)

---

## Agent Configuration

### Agent Tab

| Setting | Value |
|---|---|
| System prompt | Custom (see below) |
| Default personality | OFF |
| First message | "Hey, welcome to jchowlabs. I can help you find articles on AI and security, or connect you with Jason. What are you interested in?" |
| Interruptible | ON |

### System Prompt

The system prompt defines:
- **Personality:** Brief, friendly concierge for jchowlabs.com
- **Behavior:** Recommends 1–2 articles, uses tools for navigation/contact/session end
- **Inactivity handling:** Check-in after 7s silence, end after additional 8s
- **Conversation limit:** 3 minutes max, with 2:30 warning
- **Article catalog:** Full list of Insights, Research, and Lab articles with relative URLs
- **Rules:** No making up articles, no summarizing content, no general-purpose AI behavior

### Voice

| Setting | Value |
|---|---|
| Primary voice | Eric - Smooth, Trustworthy |
| Expressive Mode | Enabled |

> **Note:** Voice can be changed anytime in the dashboard. Consider using a cloned voice for a personalized experience.

### Language

| Setting | Value |
|---|---|
| Default | English |

### LLM

| Setting | Value |
|---|---|
| Provider/Model | Google — Gemini 2.5 Flash |
| Latency | ~898ms |
| Cost | ~$0.0011/min |

> **Note:** Other options considered: Qwen3-30B-A3B (~220ms, $0.0029/min), Gemini 2.5 Flash Lite (~649ms, $0.0007/min). Can switch anytime without code changes.

---

## Tools

All three tools are **client tools** — they fire events to the browser, not to a server. The client-side JavaScript handles the actual behavior.

### navigate

| Property | Value |
|---|---|
| Type | Client tool |
| Description | Navigate the user to a specific page on the jchowlabs website |
| Wait for response | No |
| Disable interruptions | No |
| Pre-tool speech | Auto |
| Execution mode | Immediate |

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| url | String | Yes | The relative URL path to navigate to, e.g. /insights/going-passwordless |

### open_contact

| Property | Value |
|---|---|
| Type | Client tool |
| Description | Open the contact form so the user can get in touch with Jason Chow |
| Wait for response | No |
| Disable interruptions | No |
| Pre-tool speech | Auto |
| Execution mode | Immediate |
| Parameters | None |

### end_session

| Property | Value |
|---|---|
| Type | Client tool |
| Description | End the current voice conversation gracefully and close the voice chat widget |
| Wait for response | No |
| Disable interruptions | No |
| Pre-tool speech | Auto |
| Execution mode | Immediate |
| Parameters | None |

### System Tools

| Tool | Status |
|---|---|
| End conversation | **Enabled** |
| Detect language | Disabled |
| Skip turn | Disabled |
| Transfer to agent | Disabled |
| Transfer to number | Disabled |
| Play keypad touch tone | Disabled |
| Voicemail detection | Disabled |

---

## Security

### Allowlist

| Host | Purpose |
|---|---|
| jchowlabs.github.io | GitHub Pages production |
| jchowlabs.com | Custom domain production |
| localhost:3000 | Local development (may need "Fail when Origin header is missing" toggled off) |

| Setting | Value |
|---|---|
| Fail when Origin header is missing | ON (toggle off temporarily for local dev if localhost isn't accepted) |
| Authentication | Disabled |
| Guardrails / Moderation | Not enabled |

---

## Advanced Settings

### Automatic Speech Recognition

| Setting | Value |
|---|---|
| Enable chat mode | Off |
| Use Scribe | Off |
| Filter background speech | Off |
| User input audio format | PCM 16000 Hz (Recommended) |
| Keywords | jchowlabs, Jason Chow, passkey, SAML, phishing, LLM, biometric, SSO, OpenBounty, AfterCheck |

### Conversational Behavior

| Setting | Value |
|---|---|
| Eagerness | Normal |
| Spelling patience | Auto |
| Speculative turn | Off |
| Take turn after silence | 7 seconds |
| End conversation after silence | 20 seconds |
| Max conversation duration | 180 seconds (3 minutes) |

### Timeouts

| Setting | Value |
|---|---|
| Soft timeout | -1 (Disabled) |
| LLM cascade timeout | 8 seconds |

### Client Events

All enabled: `audio`, `interruption`, `user_transcript`, `agent_response`, `agent_response_correction`

---

## Tuning Guide

All of the following can be changed in the ElevenLabs dashboard without code changes. Just click **Publish** after making changes.

### Things you can tune anytime (no code changes needed):
- System prompt wording, personality, behavior rules
- Article catalog (add/remove/edit articles and URLs)
- First message
- Voice selection
- LLM model (swap between Gemini, GPT, Qwen, etc.)
- Eagerness, silence timeouts, max duration
- Keywords for ASR accuracy
- Expressive mode on/off

### Things that require code changes:
- Adding or removing **tools** (since tool calls are handled client-side)
- Changing tool **parameter names** (client code references these)

---

## Architecture

```
┌─────────────────────┐     WebSocket      ┌──────────────────────┐
│   Browser Client    │◄──────────────────►│  ElevenLabs Agent    │
│                     │                     │                      │
│  - Mic input        │   audio stream      │  - ASR (speech→text) │
│  - Speaker output   │◄──────────────────►│  - LLM (Gemini 2.5)  │
│  - Tool handlers:   │                     │  - TTS (Eric voice)  │
│    • navigate()     │   tool_call events  │  - Tool orchestration│
│    • open_contact() │◄───────────────────│  - System prompt     │
│    • end_session()  │                     │  - Article catalog   │
│                     │                     │                      │
└─────────────────────┘                     └──────────────────────┘
```

**Key difference from OpenAI Realtime API:**
- OpenAI: LLM logic, system prompt, tool definitions, and API key proxy all lived in client-side code and a Cloudflare Worker
- ElevenLabs: LLM logic, system prompt, voice, and tool definitions live on the server (dashboard). Client only handles audio I/O and tool execution. No proxy needed.

---

## Client-Side Implementation

### Files

| File | Purpose |
|---|---|
| `components/Chatbot.js` | React component — ElevenLabs SDK integration, UI rendering, tool handlers |
| `styles/chatbot.css` | Orb/pill CSS — animations, states, responsive layout |
| `app/layout.js` | Root layout — imports `chatbot.css` and renders `<Chatbot />` |
| `package.json` | `@elevenlabs/client` dependency |

### Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@elevenlabs/client` | ^0.15.0 | ElevenLabs Conversational AI SDK (WebSocket, audio, tool calls) |

> **Note:** The old `@11labs/client` package is deprecated. Use `@elevenlabs/client`.

### Component: `Chatbot.js`

A `'use client'` React component (~275 lines) that manages the entire voice assistant lifecycle.

#### State Machine

```
               click pill
  ┌──────┐  ────────────►  ┌────────────┐
  │ IDLE │                 │ CONNECTING │
  └──────┘  ◄────────────  └────────────┘
      ▲      error/              │
      │      disconnect          │ onConnect
      │                          ▼
      │                   ┌────────────┐
      │   end_session /   │  LISTENING │◄──── onModeChange('listening')
      │   disconnect      │            │
      │◄──────────────────│  SPEAKING  │◄──── onModeChange('speaking')
      │                   └────────────┘
```

| State | Pill Class | Label | Close Button |
|---|---|---|---|
| `idle` | `va-pill` | "Voice chat" | Hidden |
| `connecting` | `va-pill active connecting` | "Connecting…" | Hidden |
| `listening` | `va-pill active` | "Listening…" | Visible |
| `speaking` | `va-pill active speaking` | "Speaking…" | Visible |
| `error` | `va-pill error` | "Unavailable" | Hidden |

#### Cookie Consent Gate

The pill only renders after analytics consent is granted via the `CookieBanner` component. It checks `localStorage('cookieConsent')` on mount and listens for the `analytics-consent-granted` custom event.

#### SDK Integration

The component dynamically imports `@elevenlabs/client` to avoid SSR issues:

```js
const { Conversation } = await import('@elevenlabs/client');
const conversation = await Conversation.startSession({
  agentId: AGENT_ID,
  onConnect, onDisconnect, onModeChange, onStatusChange, onError,
  clientTools: { navigate, open_contact, end_session },
});
```

Key SDK methods used:
- `Conversation.startSession(options)` — initiates WebSocket connection, mic access, and audio playback
- `conversation.endSession()` — disconnects cleanly
- `conversation.getOutputVolume()` — agent's current speech volume (0–1)
- `conversation.getInputVolume()` — user's current mic volume (0–1)

#### Client Tool Handlers

| Tool | Handler | Behavior |
|---|---|---|
| `navigate` | `router.push(url)` | Uses Next.js router directly (no global bridge needed) |
| `open_contact` | `window.openContactModal()` | Calls the function exposed by `ContactModal.js` |
| `end_session` | `conversation.endSession()` | 1.5s delay to let farewell audio finish, then disconnects |

#### Volume-Reactive Orb

A `requestAnimationFrame` loop runs during active sessions:
1. Polls `getOutputVolume()` and `getInputVolume()` each frame
2. Computes a target scale: baseline breathing (sine wave ±3%) + volume boost (0–25%)
3. Smoothly interpolates the current scale toward the target (lerp factor 0.18)
4. Applies `transform: scale(...)` directly to the orb element via ref

This replaces the old CSS `va-breathe` keyframe animations with real audio-reactive movement. The CSS glow, ring, and shimmer animations remain CSS-driven.

#### Error Handling

On error, the pill shows "Unavailable" for 4 seconds then resets to idle. Errors are caught from:
- SDK `onError` callback (network issues, auth failures)
- `startSession` try/catch (mic permission denied, module load failure)

### CSS: `styles/chatbot.css`

~205 lines of CSS for the pill/orb widget.

#### Keyframe Animations (CSS-driven)

| Animation | Used In | Purpose |
|---|---|---|
| `va-glow` | Active (listening) | Blue glow pulse, 2.5s cycle |
| `va-glow-speaking` | Active (speaking) | Purple-shifted glow, 0.9s cycle |
| `va-ring` | Active (listening) | Ring pulse outward, 2.5s cycle |
| `va-ring-speaking` | Active (speaking) | Wider ring pulse, 1.2s cycle |
| `va-shimmer` | Active (both) | Gradient position shift |
| `va-blink` | Connecting | Opacity blink, 1.5s cycle |

> **Note:** `va-breathe` and `va-breathe-speaking` keyframes still exist in the CSS but are no longer applied. The transform/scale is now driven by the JavaScript volume monitor for audio-reactive behavior.

#### Responsive

On viewports ≤480px, the pill shifts to `bottom: 16px; right: 16px`.

### Layout Integration

`app/layout.js` renders the chatbot as the last element in `<body>`:

```jsx
<Chatbot />
```

No `<Script>` tags are needed for the chatbot. The SDK is imported as an ES module by the component.

---

## Retired Files

The following files were part of the OpenAI Realtime API implementation and have been removed:

| File | Was | Status |
|---|---|---|
| `public/static/chatbot.js` | OpenAI WebRTC client (~575 lines) | **Deleted** |
| `public/static/chatbot.css` | Old text chat UI styles | **Deleted** |
| `admin/worker.js` | Cloudflare Worker proxy | **Retired** (kept for reference, marked as retired) |
| `admin/openai.md` | OpenAI implementation docs | **Kept** (historical reference) |

The Cloudflare Worker (`jchowlabs-chatbot.jchow-a27.workers.dev`) can be deleted from the Cloudflare dashboard at any time.

---

## Cost Estimate

| Component | Cost |
|---|---|
| LLM (Gemini 2.5 Flash) | ~$0.0011/min |
| Voice (TTS) | Included in ElevenLabs plan |
| ASR (Speech-to-text) | Included in ElevenLabs plan |

At an average conversation of ~1 minute, each visitor interaction costs approximately **$0.001** in LLM fees.

---

## Changelog

| Date | Change |
|---|---|
| February 24, 2026 | Initial setup — created agent, configured tools, voice, LLM, security. Migrated client from OpenAI Realtime API to ElevenLabs SDK. Deleted old chatbot.js/css, retired Cloudflare Worker. |