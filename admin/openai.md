# jchowlabs Chatbot

A concierge chatbot for [jchowlabs.github.io](https://jchowlabs.github.io) that helps visitors find articles and get in touch. Powered by OpenAI (GPT-4o-mini) via a Cloudflare Worker proxy.

---

## Architecture

```
GitHub Pages (all pages)           Cloudflare Worker              OpenAI API
┌────────────────────┐            ┌──────────────────┐          ┌─────────────┐
│ chatbot.css        │            │ worker.js        │          │ GPT-4o-mini │
│ chatbot.js         │── POST ───►│ - API key stored │────────►│ Whisper STT │
│ (loaded on pages)  │◄── JSON ──│ - rate limiting  │◄────────│ TTS (echo)  │
│                    │            │ - CORS enforced  │          │             │
│                    │            │ - system prompt  │          │             │
└────────────────────┘            └──────────────────┘          └─────────────┘
```

## Bot Behavior

The chatbot is strictly a **concierge** — it does three things only:

1. **Recommend articles** — matches user's interest to site content (Insights, Research, Lab) and suggests 1-3 relevant articles
2. **Navigate to articles** — takes the user directly to the selected article page via function calling
3. **Open contact form** — directs users to "Get in Touch" for advisory inquiries, pricing, or topics not covered on the site

The bot does **not** summarize articles, answer technical questions, generate code, or respond to anything outside jchowlabs scope.

## Content Strategy

The system prompt contains **titles + one-line summaries** for all published articles (sourced from the listing pages: insights.html, research.html, lab.html). This is injected into every API call (~1,800 tokens). No vector database or RAG needed — the content fits easily within the context window and OpenAI prompt caching reduces repeat cost by ~50%.

Articles marked "Coming Soon" are flagged in the prompt — the bot tells users they're not yet available.

## Cloudflare Worker

**Worker URL:** `https://jchowlabs-chatbot.jchow-a27.workers.dev`

### Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/chat` | POST | Text chat — sends messages to GPT-4o-mini with system prompt + function calling |
| `/api/transcribe` | POST | Voice input — sends audio to Whisper STT, returns transcript |
| `/api/tts` | POST | Voice output — sends text to OpenAI TTS, returns MP3 audio |

### Function Calling (Tools)

The LLM has two tools available:

- **`navigate(url)`** — returns a URL for the widget to execute `window.location.href`
- **`open_contact()`** — triggers the existing "Get in Touch" contact modal on the site

### Guardrails (Server-Side — Enforced)

| Guardrail | Value |
|---|---|
| CORS | Only accepts requests from `jchowlabs.github.io`, `jchowlabs.com`, `www.jchowlabs.com` |
| IP rate limit | 30 requests/hour, 80 requests/day |
| Input truncation | 500 characters hard cap |
| Conversation history | Only last 6 messages sent to OpenAI |
| Max output tokens | 200 |
| Audio file size | Reject files > 1MB |
| TTS text cap | 500 characters |
| Temperature | 0.3 (consistent concierge responses) |

### Environment Variables

| Variable | Type | Description |
|---|---|---|
| `OPENAI_API_KEY` | Secret (encrypted) | OpenAI API key with Chat + Audio permissions |

### KV Bindings

| Variable Name | KV Namespace | Description |
|---|---|---|
| `CHATBOT_RATE_LIMITS` | `CHATBOT_RATE_LIMITS` | Stores IP-based rate limit counters with auto-expiring TTLs |

---

## Setup Guide

### Prerequisites

- Cloudflare account (free tier)
- OpenAI account with API access
- GitHub Pages site deployed

### Phase 1: Cloudflare Worker

#### Step 1: Create KV Namespace

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** > **KV**
3. Click **Create a namespace**
4. Name: `CHATBOT_RATE_LIMITS`
5. Click **Add**

#### Step 2: Create the Worker

1. Navigate to **Workers & Pages** > **Overview**
2. Click **Create application** > **Create a Worker**
3. Select **"Start with Hello World!"**
4. Name: `jchowlabs-chatbot`
5. Click **Deploy**

#### Step 3: Deploy Worker Code

1. Click **Edit code** on the worker page
2. Delete the default Hello World code
3. Copy-paste the contents of `admin/worker.js` from this repository
4. Click **Save and deploy**

#### Step 4: Add OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new secret key (name: `jchowlabs-chatbot`)
3. Permissions: "All" (or restricted to Chat completions + Audio)
4. Copy the key immediately
5. In Cloudflare: go to worker > **Settings** > **Variables and Secrets**
6. Click **Add** > Variable name: `OPENAI_API_KEY` > paste key > **Encrypt** > **Deploy**

#### Step 5: Bind KV Namespace

1. In Cloudflare: go to worker > **Bindings** tab (or Settings > scroll to Bindings)
2. Click **Add binding** > select **KV Namespace**
3. Variable name: `CHATBOT_RATE_LIMITS`
4. KV namespace: select `CHATBOT_RATE_LIMITS` from dropdown
5. Click **Add Binding** > **Deploy**

#### Step 6: Set OpenAI Budget Cap

1. Go to [platform.openai.com/settings/organization/limits](https://platform.openai.com/settings/organization/limits)
2. Set monthly budget limit to $20 (or preferred amount)

#### Step 7: Test

```bash
curl -s -X POST https://jchowlabs-chatbot.jchow-a27.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: https://jchowlabs.github.io" \
  -d '{"messages": [{"role": "user", "content": "What do you have on phishing?"}]}' | python3 -m json.tool
```

Expected: JSON response with GPT-4o-mini recommending "Anatomy of Phishing Attacks".

### Phase 2: Chat Widget (Text)

Chat widget files are already in the repository:

- `static/chatbot.css` — floating bubble, expandable panel, message bubbles, article Read buttons, responsive layout
- `static/chatbot.js` — widget injection, text input, API calls to worker, message rendering with markdown parsing, function call handling (`navigate` + `open_contact`), `sessionStorage` persistence, profanity filter (2 strikes), 20-turn session limit, 5-min idle auto-close

Both files are already linked in `index.html`. To add to a new page, insert two lines:

**Root-level page** (e.g. `insights.html`):
```html
<!-- In <head>, after styles.css -->
<link rel="stylesheet" href="static/chatbot.css">

<!-- Before </body> -->
<script src="static/chatbot.js"></script>
```

**Subdirectory page** (e.g. `insights/going-passwordless.html`):
```html
<!-- In <head>, after styles.css -->
<link rel="stylesheet" href="../static/chatbot.css">

<!-- Before </body> -->
<script src="../static/chatbot.js"></script>
```

#### Widget Features
- **Floating bubble** — dark circle, bottom-right corner, toggles chat panel
- **Chat panel** — 380×520px, white with warm gray message area
- **Message rendering** — markdown bold (`**text**`) → `<strong>`, markdown links → inline "Read →" pill buttons that navigate on click
- **Article URL handling** — parses both relative (`/insights/...`) and absolute (`https://jchowlabs.com/...`) URLs from LLM responses
- **`open_contact()`** — calls existing `openModal()` from `app.js` with a synthetic event
- **Session persistence** — conversation survives same-tab navigation via `sessionStorage`; cleared when tab/browser closes
- **Cookie banner awareness** — bubble and panel shift up when `.cookie-banner.show` is visible

#### Client-Side Guardrails

| Guardrail | Value |
|---|---|
| Profanity filter | Regex check; 1st strike = warning, 2nd = chat closed + contact form opened |
| Turn limit | 20 messages per session |
| Idle timeout | 5 min — panel auto-closes |
| Input length | `maxlength="500"` on input field |

### Phase 3: Voice

Voice is built into the same `chatbot.js` and `chatbot.css` files — no additional setup required.

#### Voice Input (Mic)
- Mic button sits between text input and send button
- Click to start recording → button turns red with pulse animation
- Click again to stop, or auto-stops after 15 seconds
- Audio sent to worker's `/api/transcribe` endpoint (Whisper STT)
- Transcribed text appears as user message and auto-sends to chat

#### Voice Output (TTS)
- Every bot message has a small speaker icon in the bottom-right corner
- Click to hear the message read aloud via OpenAI TTS (`tts-1`, `echo` voice)
- Markdown is stripped before sending to TTS for cleaner speech
- Clicking another speaker stops current playback and starts new

### Phase 4: Roll Out to All Pages

The chatbot is deployed on all **22 HTML pages**:
- 5 root-level pages: `index.html`, `insights.html`, `research.html`, `lab.html`, `events.html`
- 5 Insights articles
- 5 Research articles
- 7 Lab articles

Each page has 2 lines added (CSS `<link>` in `<head>`, JS `<script>` before `</body>`). The widget auto-injects its DOM on load — no per-page configuration needed.

---

## Cost Estimates

| Component | Cost |
|---|---|
| Cloudflare Worker | Free (100K requests/day) |
| Cloudflare KV | Free (100K reads/day, 1K writes/day) |
| GPT-4o-mini (text chat) | ~$0.001 per exchange |
| Whisper STT (voice input) | ~$0.006 per 10s of audio |
| TTS (voice output) | ~$0.005 per ~300 char response |
| **Text-only monthly (10 chats/day)** | **~$3/month** |
| **Text + voice monthly (10 chats/day)** | **~$13/month** |
| **OpenAI hard budget cap** | **$20/month** |

## Files

```
admin/
  README.md          — This documentation file
  worker.js          — Cloudflare Worker (deploy to Cloudflare dashboard)
static/
  chatbot.css        — Chat widget styles
  chatbot.js         — Chat widget logic, voice, session management
  app.js             — Site-wide JS (modal, hamburger menu — not chatbot-related)
  styles.css         — Site-wide CSS (not chatbot-related)
```

## Updating Content

When you add or update articles on the site, update the system prompt in `admin/worker.js`:

1. Edit the `SYSTEM_PROMPT` constant in `admin/worker.js`
2. Add/update the article entry (title, one-line summary, URL)
3. Copy the updated code to the Cloudflare Worker editor
4. Click **Save and deploy**

For events: periodically remove past events and add upcoming ones.

## Adding a New Page

When you create a new HTML page and want the chatbot on it:

1. Add `<link rel="stylesheet" href="static/chatbot.css">` after `styles.css` in `<head>` (use `../static/` for subdirectory pages)
2. Add `<script src="static/chatbot.js"></script>` before `</body>` (use `../static/` for subdirectory pages)

That's it — the widget self-initializes on load.
