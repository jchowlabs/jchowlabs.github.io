/* ================================================================ */
/* session-secure.js — LabSessionSecure Durable Object             */
/*                                                                  */
/* Secured version of the lab. Same data and tools, but with       */
/* input guards, tool-execution guards, output guards, and         */
/* session-bound identity tracking.                                 */
/* ================================================================ */

import {
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  SYSTEM_PROMPT_SECURE,
  TOOL_DEFINITIONS,
  callOpenAI,
} from './config.js';

import {
  checkInput,
  validateToolCall,
  sanitizeOutput,
} from './guards.js';

const GREETING =
  "Hi! I'm the Acme Corp support assistant. I can help with:\n\n• Order lookups\n• Refunds\n• Account changes\n\nHow can I help you today?";

const MAX_HISTORY = 50;
const MAX_TOOL_LOOPS = 6;

export class LabSessionSecure {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.initialized = false;
    this.customers = {};
    this.orders = {};
    this.ledger = [];
    this.chatHistory = [];
    this.activity = [];
    this.claimedCustomerId = null; // Session-bound identity

    // Restore state from storage if DO was evicted and reconstructed
    this.state.blockConcurrencyWhile(async () => {
      const saved = await this.state.storage.get('sessionData');
      if (saved) {
        this.customers = saved.customers;
        this.orders = saved.orders;
        this.ledger = saved.ledger;
        this.chatHistory = saved.chatHistory;
        this.activity = saved.activity;
        this.claimedCustomerId = saved.claimedCustomerId || null;
        this.initialized = true;
      }
    });
  }

  /* ---- State management ---- */

  init() {
    this.customers = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    this.ledger = [];
    this.chatHistory = [];
    this.activity = [];
    this.claimedCustomerId = null;
    this.initialized = true;
    this.persist();
  }

  persist() {
    this.state.storage.put('sessionData', {
      customers: this.customers,
      orders: this.orders,
      ledger: this.ledger,
      chatHistory: this.chatHistory,
      activity: this.activity,
      claimedCustomerId: this.claimedCustomerId,
    });
  }

  /* ---- Identity binding ---- */

  /**
   * When a user first looks up an order, bind their session to the
   * customer who owns that order. Subsequent actions are validated
   * against this identity.
   */
  bindIdentity(customerId) {
    if (!this.claimedCustomerId) {
      this.claimedCustomerId = customerId;
    }
  }

  /* ---- Tool execution (with guard validation) ---- */

  executeTool(name, args) {
    // --- Guard: validate before execution ---
    const guard = validateToolCall(name, args, this.orders, this.claimedCustomerId);
    if (guard.blocked) {
      return {
        data: { error: guard.detail, security_denial: true },
        blocked: true,
        guardReason: guard.reason,
      };
    }

    switch (name) {
      case 'get_customer': {
        const c = this.customers[args.customer_id];
        if (!c) return { data: { error: `Customer ${args.customer_id} not found.` } };
        // Bind identity on first customer lookup
        this.bindIdentity(args.customer_id);
        return { data: c };
      }

      case 'get_order': {
        const o = this.orders[args.order_id];
        if (!o) return { data: { error: `Order ${args.order_id} not found.` } };
        // Bind identity to the order's owner on first lookup
        this.bindIdentity(o.customer_id);
        const ageDays = o.order_date
          ? Math.floor((Date.now() - new Date(o.order_date).getTime()) / 86400000)
          : null;
        return { data: { ...o, days_since_order: ageDays } };
      }

      case 'list_orders': {
        // Bind identity
        this.bindIdentity(args.customer_id);
        const list = Object.values(this.orders)
          .filter((o) => o.customer_id === args.customer_id)
          .map((o) => {
            const ageDays = o.order_date
              ? Math.floor((Date.now() - new Date(o.order_date).getTime()) / 86400000)
              : null;
            return { ...o, days_since_order: ageDays };
          });
        if (list.length === 0) {
          return { data: { error: `No orders found for customer ${args.customer_id}.` } };
        }
        return { data: { customer_id: args.customer_id, orders: list } };
      }

      case 'issue_refund': {
        const order = this.orders[args.order_id];
        if (!order) return { data: { error: `Order ${args.order_id} not found.` } };
        if (order.refunded) {
          return { data: { error: `Order ${args.order_id} has already been refunded.` } };
        }

        order.refunded = true;
        order.status = 'refunded';

        const receipt = {
          type: 'refund',
          refund_id: `R-${Date.now()}`,
          order_id: args.order_id,
          customer_id: order.customer_id,
          item: order.item,
          amount: order.amount,
          reason: args.reason,
          timestamp: new Date().toISOString(),
        };
        this.ledger.push(receipt);
        return { data: { success: true, ...receipt }, receipt };
      }

      case 'change_address': {
        const customer = this.customers[args.customer_id];
        if (!customer) {
          return { data: { error: `Customer ${args.customer_id} not found.` } };
        }

        const oldAddress = customer.address;
        customer.address = args.new_address;

        const receipt = {
          type: 'address_change',
          change_id: `AC-${Date.now()}`,
          customer_id: args.customer_id,
          customer_name: customer.name,
          old_address: oldAddress,
          new_address: args.new_address,
          timestamp: new Date().toISOString(),
        };
        this.ledger.push(receipt);
        return { data: { success: true, ...receipt }, receipt };
      }

      default:
        return { data: { error: `Unknown tool: ${name}` } };
    }
  }

  /* ---- Chat loop (with input + output guards) ---- */

  async chat(userMessage) {
    if (!this.initialized) this.init();

    // --- Input Guard ---
    const inputCheck = checkInput(userMessage);
    if (inputCheck.blocked) {
      const denial = "I'm unable to process that request. Our security system flagged the input.";
      this.chatHistory.push({ role: 'user', content: userMessage });
      this.chatHistory.push({ role: 'assistant', content: denial });
      this.persist();
      return {
        assistant_message: denial,
        activity_delta: [],
        guard_triggered: { type: 'input', reason: inputCheck.reason },
      };
    }

    this.chatHistory.push({ role: 'user', content: userMessage });

    // Keep history bounded
    if (this.chatHistory.length > MAX_HISTORY) {
      this.chatHistory = this.chatHistory.slice(-(MAX_HISTORY - 10));
    }

    const apiKey = this.env.OPENAI_API_KEY;
    const model = this.env.OPENAI_MODEL || 'gpt-4o-mini';
    const activityDelta = [];
    const guardsTriggered = [];

    let loopsRemaining = MAX_TOOL_LOOPS;

    while (loopsRemaining-- > 0) {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT_SECURE },
        ...this.chatHistory,
      ];

      const response = await callOpenAI(apiKey, model, messages, TOOL_DEFINITIONS);
      const choice = response.choices[0];
      const msg = choice.message;

      /* --- Tool calls → validate, execute, and loop --- */
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        this.chatHistory.push({
          role: 'assistant',
          content: msg.content || null,
          tool_calls: msg.tool_calls,
        });

        for (const tc of msg.tool_calls) {
          let args;
          try {
            args = JSON.parse(tc.function.arguments);
          } catch {
            args = {};
          }

          const result = this.executeTool(tc.function.name, args);

          // Track guard blocks
          if (result.blocked) {
            guardsTriggered.push({
              type: 'tool',
              tool: tc.function.name,
              reason: result.guardReason,
            });
          }

          if (result.receipt) {
            activityDelta.push(result.receipt);
            this.activity.push(result.receipt);
          }

          this.chatHistory.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify(result.data),
          });
        }

        continue; // loop back for the model's follow-up
      }

      /* --- Text response → apply output guard → done --- */
      let assistantText = msg.content || '';

      // --- Output Guard ---
      const sanitized = sanitizeOutput(assistantText);
      if (sanitized !== assistantText) {
        guardsTriggered.push({ type: 'output', reason: 'pii_redacted' });
        assistantText = sanitized;
      }

      this.chatHistory.push({ role: 'assistant', content: assistantText });
      this.persist();

      return {
        assistant_message: assistantText,
        activity_delta: activityDelta,
        guards_triggered: guardsTriggered.length > 0 ? guardsTriggered : undefined,
      };
    }

    // Safety: max tool-call loops exceeded
    const fallback =
      "I'm sorry, I had trouble processing that request. Could you try again?";
    this.chatHistory.push({ role: 'assistant', content: fallback });
    this.persist();
    return { assistant_message: fallback, activity_delta: activityDelta };
  }

  /* ---- HTTP handler (called by Worker via stub.fetch) ---- */

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/start' && request.method === 'POST') {
        this.init();
        this.chatHistory.push({ role: 'assistant', content: GREETING });
        return Response.json({ assistant_message: GREETING, activity: [] });
      }

      if (path === '/chat' && request.method === 'POST') {
        if (!this.initialized) {
          return Response.json(
            { error: 'Session not started. Call /lab-secure/start first.' },
            { status: 400 },
          );
        }
        const { message } = await request.json();
        if (!message || typeof message !== 'string') {
          return Response.json(
            { error: 'Missing "message" in request body.' },
            { status: 400 },
          );
        }
        const result = await this.chat(message);
        return Response.json(result);
      }

      if (path === '/reset' && request.method === 'POST') {
        this.init();
        this.chatHistory.push({ role: 'assistant', content: GREETING });
        return Response.json({ assistant_message: GREETING, activity: [] });
      }

      return Response.json({ error: 'Not found' }, { status: 404 });
    } catch (err) {
      console.error('LabSessionSecure error:', err);
      return Response.json(
        { error: err.message || 'Internal error' },
        { status: 500 },
      );
    }
  }
}
