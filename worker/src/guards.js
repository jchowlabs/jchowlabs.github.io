/* ================================================================ */
/* guards.js — Input, tool-execution, and output guard functions    */
/*             for the secured version of the Agent Guardrails lab. */
/* ================================================================ */

// --------------- Input Guard ---------------

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|earlier|system)\s+(instructions|prompts|rules)/i,
  /disregard\s+(your|the|all)\s+(previous|prior|above|earlier|system)/i,
  /you\s+are\s+now\s+(a|an|my)/i,
  /pretend\s+(you|to\s+be|that\s+you)/i,
  /act\s+as\s+(a|an)\s+(admin|supervisor|manager|developer|root|system)/i,
  /override\s+(the|this|all|your)\s+(policy|policies|rules|restrictions|limitations)/i,
  /bypass\s+(the|this|all|your)\s+(policy|policies|rules|security)/i,
  /new\s+instructions?\s*:/i,
  /\bsystem\s*prompt\b/i,
  /\bjailbreak\b/i,
  /\bDAN\b/,
  /do\s+anything\s+now/i,
];

/**
 * Check user input for prompt injection patterns.
 * Returns { blocked: true, reason, detail } or { blocked: false }.
 */
export function checkInput(message) {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      return {
        blocked: true,
        reason: 'prompt_injection',
        detail: 'Input flagged by guardrail: suspicious instruction pattern detected.',
      };
    }
  }
  return { blocked: false };
}

// --------------- Tool Execution Guard ---------------

/**
 * Validate a tool call before execution.
 * Uses session context (claimedCustomerId) and order data for ownership checks.
 *
 * @param {string} toolName
 * @param {object} args
 * @param {object} orders - current order dataset
 * @param {string|null} claimedCustomerId - who the user has identified as
 * @returns {{ blocked: boolean, reason?: string, detail?: string }}
 */
export function validateToolCall(toolName, args, orders, claimedCustomerId) {

  if (toolName === 'issue_refund') {
    const order = orders[args.order_id];
    if (!order) return { blocked: false }; // let the tool return "not found"

    // Hard refund policy — enforced in code, not by LLM
    const ageDays = order.order_date
      ? Math.floor((Date.now() - new Date(order.order_date).getTime()) / 86400000)
      : null;
    if (ageDays !== null && ageDays > 30) {
      return {
        blocked: true,
        reason: 'policy',
        detail: `SECURITY GUARD: Refund denied. Order #${args.order_id} is ${ageDays} days old and exceeds the 30-day refund window. This policy is enforced by the system and cannot be overridden.`,
      };
    }

    // Ownership check — must own the order
    if (claimedCustomerId && order.customer_id !== claimedCustomerId) {
      return {
        blocked: true,
        reason: 'ownership',
        detail: `SECURITY GUARD: Refund denied. Order #${args.order_id} does not belong to your account. You can only refund your own orders.`,
      };
    }

    return { blocked: false };
  }

  if (toolName === 'change_address') {
    // Ownership check — can only change your own address
    if (claimedCustomerId && args.customer_id !== claimedCustomerId) {
      return {
        blocked: true,
        reason: 'ownership',
        detail: `SECURITY GUARD: Address change denied. Customer #${args.customer_id} is not your account. You can only update your own address.`,
      };
    }
    return { blocked: false };
  }

  if (toolName === 'get_customer') {
    // Prevent looking up other customers' PII
    if (claimedCustomerId && args.customer_id !== claimedCustomerId) {
      return {
        blocked: true,
        reason: 'privacy',
        detail: `SECURITY GUARD: Access denied. You can only view your own customer profile.`,
      };
    }
    return { blocked: false };
  }

  return { blocked: false };
}

// --------------- Output Guard ---------------

const EMAIL_PATTERN = /[\w.-]+@[\w.-]+\.\w{2,}/g;
const ADDRESS_PATTERN = /\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Way|Drive|Dr|Lane|Ln|Blvd|Boulevard|Court|Ct|Place|Pl)[\w\s,.]*/gi;

/**
 * Sanitize assistant output by redacting PII patterns.
 * Returns the cleaned text.
 */
export function sanitizeOutput(text) {
  if (!text) return text;
  let cleaned = text.replace(EMAIL_PATTERN, '[EMAIL REDACTED]');
  cleaned = cleaned.replace(ADDRESS_PATTERN, '[ADDRESS REDACTED]');
  return cleaned;
}
