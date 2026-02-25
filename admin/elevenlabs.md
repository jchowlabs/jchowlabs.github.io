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
- OpenAI: LLM logic, system prompt, and tool definitions all lived in client-side code
- ElevenLabs: LLM logic, system prompt, voice, and tool definitions live on the server (dashboard). Client only handles audio I/O and tool execution.

---

## Cost Estimate

| Component | Cost |
|---|---|
| LLM (Gemini 2.5 Flash) | ~$0.0011/min |
| Voice (TTS) | Included in ElevenLabs plan |
| ASR (Speech-to-text) | Included in ElevenLabs plan |

At an average conversation of ~1 minute, each visitor interaction costs approximately **$0.001** in LLM fees.

---

## Setup Date

Initial setup: February 24, 2026