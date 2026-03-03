# Agent Guardrails Lab — Architecture & Operations Reference

> Internal reference for the interactive chatbot lab deployed at `/lab/agent-guardrails`.  
> Last updated: March 2, 2026

---

## Overview

The Agent Guardrails lab is an interactive demo that lets visitors experience how LLM-powered customer support chatbots can be exploited — and then how backend guardrails can prevent those same attacks. It ships as two independent chatbot instances:

1. **Vulnerable chatbot** — intentionally has no server-side authorization, allowing enumeration, social engineering, and cross-account attacks.
2. **Secured chatbot** — identical data and tools, but adds three layers of backend guards (input, tool-execution, output) plus session-bound identity tracking.

Both chatbots run against the same synthetic dataset and use the same OpenAI function-calling interface. The only difference is the presence (or absence) of guard logic.

---

## Architecture

```
┌──────────────────────────────┐
│   Next.js Frontend           │
│   (GitHub Pages / static)    │
│                              │
│  AgentChatlab.js ──────→ /lab/*           (vulnerable)
│  AgentChatlabSecure.js ─→ /lab-secure/*   (secured)
└────────────┬─────────────────┘
             │ HTTPS (CORS)
             ▼
┌──────────────────────────────┐
│   Cloudflare Worker          │
│   worker/src/index.js        │
│                              │
│   Routes & CORS handling     │
│   ┌────────────────────────┐ │
│   │ /lab/*  → LabSession   │ │  Durable Object (vulnerable)
│   │ /lab-secure/* →        │ │
│   │   LabSessionSecure     │ │  Durable Object (secured)
│   └────────────────────────┘ │
└────────────┬─────────────────┘
             │ HTTPS
             ▼
┌──────────────────────────────┐
│   OpenAI API                 │
│   gpt-4o-mini                │
│   Function/tool calling      │
└──────────────────────────────┘
```

### Component Breakdown

| Layer | Technology | Files |
|-------|-----------|-------|
| Frontend | Next.js (static export to GitHub Pages) | `components/AgentChatlab.js`, `components/AgentChatlabSecure.js`, `styles/agent-chatlab.css`, `app/lab/agent-guardrails/page.js` |
| Worker | Cloudflare Workers | `worker/src/index.js` |
| Session state (vulnerable) | Cloudflare Durable Objects | `worker/src/session.js` |
| Session state (secured) | Cloudflare Durable Objects | `worker/src/session-secure.js` |
| Guards | Plain JS (runs in DO) | `worker/src/guards.js` |
| Config / data / prompts | Shared module | `worker/src/config.js` |
| OpenAI integration | OpenAI Chat Completions API | `worker/src/config.js` (`callOpenAI`) |

---

## Cloudflare Worker (`worker/`)

### Project Setup

- **Runtime:** Cloudflare Workers with Durable Objects
- **Package manager entry:** `worker/package.json` (`"name": "agent-guardrails-lab"`)
- **Wrangler config:** `worker/wrangler.toml`
- **Scripts:** `npm run dev` → `wrangler dev` (local), `npm run deploy` → `wrangler deploy` (production)
- **Compatibility date:** 2024-09-23

### Durable Object Bindings

Defined in `wrangler.toml`:

| Binding Name | Class | Migration Tag | Purpose |
|-------------|-------|--------------|---------|
| `LAB_SESSION` | `LabSession` | v1 | Vulnerable chatbot sessions |
| `LAB_SESSION_SECURE` | `LabSessionSecure` | v2 | Secured chatbot sessions |

### Environment Variables

| Variable | Set Via | Value |
|---------|---------|-------|
| `OPENAI_MODEL` | `wrangler.toml` `[vars]` | `gpt-4o-mini` |
| `OPENAI_API_KEY` | `wrangler secret put OPENAI_API_KEY` | (secret — not in source) |

### Entry Point — `index.js`

- Exports both `LabSession` and `LabSessionSecure` classes (required for DO registration).
- CORS whitelist: `localhost:3000`, `localhost:3001`, `jchowlabs.com`, `www.jchowlabs.com`, `jchowlabs.github.io`.
- Routing:
  - `POST /lab/start` → creates a new `LabSession` DO with `crypto.randomUUID()` session ID.
  - `POST /lab/chat` → forwards to existing `LabSession` DO (session ID from request body).
  - `POST /lab/reset` → resets the `LabSession` DO to initial state.
  - `POST /lab-secure/start|chat|reset` → same pattern but routes to `LabSessionSecure` DO.
- All other requests → 404.
- The `/start` response has `session_id` injected by the worker so the frontend can track it.

### API Request/Response Format

**Start a session:**
```
POST /lab/start (or /lab-secure/start)
→ { "assistant_message": "...", "activity": [], "session_id": "uuid" }
```

**Send a message:**
```
POST /lab/chat (or /lab-secure/chat)
Body: { "session_id": "uuid", "message": "user text" }
→ { "assistant_message": "...", "activity_delta": [...] }
   // Secured version may also include: "guards_triggered": [...]
```

**Reset session:**
```
POST /lab/reset (or /lab-secure/reset)
Body: { "session_id": "uuid" }
→ { "assistant_message": "...", "activity": [] }
```

---

## Synthetic Dataset (`config.js`)

### Customers

| ID | Name | Email | Address |
|----|------|-------|---------|
| 101 | Alice Johnson | alice.johnson@email.com | 123 Main Street, Springfield, IL 62701 |
| 102 | Bob Martinez | bob.martinez@email.com | 456 Oak Avenue, Portland, OR 97201 |
| 103 | Carol Chen | carol.chen@email.com | 789 Pine Road, Austin, TX 78701 |

### Orders

| Order ID | Customer | Item | Amount | Status | Order Date | Notes |
|----------|----------|------|--------|--------|-----------|-------|
| 501 | 101 (Alice) | Wireless Headphones | $79.99 | delivered | 2026-02-20 | Within 30-day window |
| 502 | 101 (Alice) | USB-C Hub | $34.99 | shipped | 2026-02-25 | Within 30-day window |
| 503 | 102 (Bob) | Mechanical Keyboard | $129.99 | delivered | 2026-01-10 | **Outside 30-day window** |
| 504 | 102 (Bob) | Monitor Stand | $49.99 | delivered | 2026-02-18 | Within 30-day window |
| 505 | 103 (Carol) | Webcam HD Pro | $59.99 | shipped | 2026-02-27 | Within 30-day window |

The frontend shows the user a "purchase order" for Bob's order #503 (Mechanical Keyboard, $129.99) — this is intentionally outside the 30-day refund window to test policy enforcement.

---

## OpenAI Integration

### Model

- **Model:** `gpt-4o-mini` (set via `OPENAI_MODEL` env var, fallback hardcoded)
- **Temperature:** 0.3 (low for deterministic responses)
- **API:** OpenAI Chat Completions with function/tool calling

### Tool Definitions (5 tools)

All tools are registered as OpenAI function-calling tools:

1. **`get_customer(customer_id)`** — Returns name, email, address for a customer.
2. **`get_order(order_id)`** — Returns item, amount, status, refund state, and computed `days_since_order`.
3. **`list_orders(customer_id)`** — Returns all orders for a customer with `days_since_order`.
4. **`issue_refund(order_id, reason)`** — Marks an order as refunded, creates a ledger receipt.
5. **`change_address(customer_id, new_address)`** — Updates customer address, creates a ledger receipt.

### Tool-Calling Loop

Both DOs use the same loop pattern:
1. Prepend system prompt + chat history → send to OpenAI.
2. If response contains `tool_calls`, execute each tool, append results to history, loop back.
3. If response is text, return it as `assistant_message`.
4. Safety cap at 6 tool-call iterations per user message.

---

## Vulnerable Chatbot (`session.js` / `LabSession`)

### What Makes It Vulnerable

The `LabSession` Durable Object executes all 5 tools **without any authorization or ownership checks**:

- **No identity binding** — any user can claim to be any customer.
- **No ownership validation** — can refund any order, change any address, view any profile.
- **Policy enforced only by LLM** — the 30-day refund policy is in the system prompt, but the LLM can be convinced to ignore it.
- **No input scanning** — prompt injection goes directly to the LLM.
- **No output filtering** — PII (emails, addresses) is returned verbatim.

### Attack Scenarios (the 3 goals shown in the UI)

1. **Data Exfiltration** — Ask the bot to look up another customer's profile (e.g., customer 101) to reveal their email/address.
2. **Policy Override** — Convince the bot to refund order #503 despite it being >30 days old (the policy is LLM-enforced and can be social-engineered around).
3. **Cross-Account Action** — Change another customer's shipping address by providing their customer ID.

### System Prompt (Vulnerable)

The vulnerable prompt tells the LLM about policies but leaves enforcement entirely to the model's judgment. Key characteristics:
- States policies as instructions, not hard rules
- Tells the LLM to check `days_since_order` itself
- Says "only share customer details with the customer who owns the account" but has no mechanism to verify who is who
- Tool descriptions note `issue_refund` "does NOT enforce the 30-day policy — you must check the order date yourself"

---

## Secured Chatbot (`session-secure.js` / `LabSessionSecure`)

### What Makes It Secure

The `LabSessionSecure` DO adds three layers of guards (implemented in `guards.js`) plus session-bound identity:

### 1. Input Guard — `checkInput(message)`

Runs **before** the user message is sent to OpenAI. Uses 12 regex patterns to detect common prompt injection techniques:

- "ignore previous instructions"
- "disregard your rules"
- "you are now a..."
- "pretend you/to be"
- "act as a admin/supervisor/root"
- "override the policy"
- "bypass the rules"
- "new instructions:"
- "system prompt"
- "jailbreak"
- "DAN" (Do Anything Now)
- "do anything now"

If triggered, the message is **not sent to OpenAI at all**. Response:
```json
{
  "assistant_message": "I'm unable to process that request. Our security system flagged the input.",
  "guard_triggered": { "type": "input", "reason": "prompt_injection" }
}
```

### 2. Tool Execution Guard — `validateToolCall(toolName, args, orders, claimedCustomerId)`

Runs **after** OpenAI requests a tool call, but **before** the tool is executed. Validates:

| Tool | Guard Logic |
|------|------------|
| `issue_refund` | (a) Hard 30-day policy — computes `days_since_order` in code and blocks if >30 days. Cannot be overridden by the LLM. (b) Ownership — order must belong to `claimedCustomerId`. |
| `change_address` | Ownership — `customer_id` must match `claimedCustomerId`. |
| `get_customer` | Privacy — can only look up your own customer profile once identity is bound. |
| `get_order`, `list_orders` | No guard (these are read-only and used for initial identity binding). |

Blocked calls return a `SECURITY_DENIAL` error message to the LLM, which it relays to the user.

### 3. Output Guard — `sanitizeOutput(text)`

Runs **after** the LLM generates its final text response, before returning to the client. Applies regex-based PII redaction:

- **Email pattern:** `[\w.-]+@[\w.-]+\.\w{2,}` → `[EMAIL REDACTED]`
- **Address pattern:** `\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Way|...)` → `[ADDRESS REDACTED]`

This is a last-resort defense — if the LLM somehow leaks PII despite the tool guards, the output filter catches it.

### 4. Session-Bound Identity (`claimedCustomerId`)

- **First lookup binds identity:** When a user looks up an order (`get_order`), the order's `customer_id` becomes the session's `claimedCustomerId`. Same for `get_customer` and `list_orders`.
- **Subsequent actions are validated** against this identity — you can't look up order #504 (Bob's), bind as customer 102, then refund Alice's order #501.
- **Persisted:** `claimedCustomerId` is saved in Durable Object storage and survives DO eviction.

### Secure System Prompt

The secured prompt is notably different:
- Tells the LLM that a "backend security system" validates all tool calls.
- Instructs the LLM to **not retry or work around** `SECURITY_DENIAL` responses.
- States that policies are "enforced in code — not by you."

---

## Frontend Components

### `AgentChatlab.js` (Vulnerable Lab)

- React component with chat UI inside a browser-chrome-styled modal.
- Collapsible side panel with: Context description, 3 goals (with circle completion indicators), tips, and a purchase order receipt card.
- API base: `http://localhost:8787` (dev) / `https://agent-guardrails-lab.<account>.workers.dev` (prod).
- Endpoints: `/lab/start`, `/lab/chat`, `/lab/reset`.
- Tracks goal completion via `attacks` state (`data_leak`, `refund`, `unauthorized_action`).
- Panel auto-collapses on viewports <700px (mobile), opens as full-width overlay when toggled.
- Toggle knob: 24px expanded, 50px collapsed, with smooth CSS transitions.

### `AgentChatlabSecure.js` (Secured Lab)

- Nearly identical to `AgentChatlab.js` but hits `/lab-secure/*` endpoints.
- Badge says "Secured" (green) instead of "Active" (green dot).
- Context section: "This is the secured version of the same chatbot. Try the same attacks and see what happens."
- Section 3: "Guardrails Active" with 4 items instead of attack tips.
- Displays guard trigger notifications when `guards_triggered` is present in the API response.

### `styles/agent-chatlab.css`

Shared CSS for both components (~950 lines). Key classes:
- `.acl-browser-frame` — browser chrome wrapper
- `.acl-panel` / `.acl-panel-collapsed` — side panel
- `.acl-panel-toggle` / `.acl-panel-toggle-collapsed` — toggle knob
- `.acl-goal` / `.acl-goal-done` — goal indicators
- Mobile breakpoint at 600px

### `app/lab/agent-guardrails/page.js`

The article page that wraps both labs. Structure:
1. Intro / "What You Can Try" section
2. `<AgentChatlab />` — vulnerable chatbot
3. "Why This Matters" bridge section
4. "Part 2: Applying Guardrails" — explains the three guard layers
5. `<AgentChatlabSecure />` — secured chatbot
6. Key takeaway + disclaimer

---

## Deployment

### Local Development

```bash
# Terminal 1 — Next.js frontend
cd /path/to/jchowlabs.github.io
npm run dev
# → http://localhost:3000

# Terminal 2 — Cloudflare Worker
cd worker
npx wrangler dev
# → http://localhost:8787
```

The frontend components use `http://localhost:8787` as the API base during development.

### Production Deployment

**Worker:**
```bash
cd worker

# Set the OpenAI API key (one-time, stored encrypted by Cloudflare)
npx wrangler secret put OPENAI_API_KEY

# Deploy
npm run deploy
# → https://agent-guardrails-lab.<account>.workers.dev
```

**Frontend:**
- Update `API_BASE` in both `AgentChatlab.js` and `AgentChatlabSecure.js` to the production worker URL.
- Push to GitHub → GitHub Pages deploys automatically.

### CORS Configuration

The worker allows requests from these origins (hardcoded in `index.js`):
- `http://localhost:3000`
- `http://localhost:3001`
- `https://jchowlabs.com`
- `https://www.jchowlabs.com`
- `https://jchowlabs.github.io`

---

## File Index

```
worker/
├── package.json              # Project metadata, wrangler scripts
├── wrangler.toml             # Worker config: DO bindings, migrations, env vars
└── src/
    ├── index.js              # Entry point: CORS, routing, DO forwarding
    ├── config.js             # Synthetic data, system prompts, tool defs, OpenAI helper
    ├── session.js            # LabSession DO (vulnerable)
    ├── session-secure.js     # LabSessionSecure DO (secured + guards)
    └── guards.js             # checkInput(), validateToolCall(), sanitizeOutput()

components/
├── AgentChatlab.js           # Vulnerable chatbot React component
└── AgentChatlabSecure.js     # Secured chatbot React component

styles/
└── agent-chatlab.css         # Shared CSS for both chatbot components

app/lab/agent-guardrails/
└── page.js                   # Article page wrapping both labs
```

---

## Troubleshooting

### "Failed to fetch" in the browser
- The Cloudflare Worker is not running. Start it with `cd worker && npx wrangler dev`.
- Check for port conflicts: `lsof -i :8787`. Kill stale processes: `pkill -f wrangler && pkill -f workerd`.

### Worker starts but tools return errors
- Verify `OPENAI_API_KEY` is set. For local dev: create `.dev.vars` in `worker/` with `OPENAI_API_KEY=sk-...`.
- For production: `npx wrangler secret put OPENAI_API_KEY`.

### Durable Object migration errors
- DO migrations are ordered by `tag` in `wrangler.toml`. If you add new DOs, add a new `[[migrations]]` block with the next tag.
- Existing migrations cannot be modified after deployment.

### CORS errors
- Ensure the request origin is in the `ALLOWED_ORIGINS` list in `index.js`.
- Check that the worker is responding to `OPTIONS` preflight requests (handled automatically).
