import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgentChatlab from '@/components/AgentChatlab';
import AgentChatlabSecure from '@/components/AgentChatlabSecure';

export const metadata = {
  title: 'Securing AI Chatbots | jchowlabs',
  description:
    'An interactive lab featuring a vulnerable and a secured AI support chatbot. Explore how LLM-powered agents can be manipulated — then see how backend guardrails defend against the same exploits.',
};

export default function AgentGuardrailsPage() {
  const introHtml = `<section class="article-content-section">
      <div class="article-container">
        <div class="article-hero">
          <img src="/static/images/policy-guardrails.png" alt="Securing AI Chatbots" class="article-hero-img">
        </div>

        <div class="article-header">
          <h1>Securing AI Chatbots</h1>
        </div>

        <div class="article-body">
          <p>AI chatbots are no longer just answering basic questions. They are increasingly connected to backend systems and given authority to perform tasks such as issuing refunds, updating customer records, and triggering complex, privileged workflows.</p>

          <p>These expanding capabilities create significant value, but they also introduce meaningful risk. A system that can autonomously take action can take the wrong action. A system with access to sensitive data can expose it. If poorly designed, the same privilege that enables efficiency can also create real damage.</p>

          <p>In this lab, you can attack a deliberately vulnerable chatbot to build intuition for how these failures occur. You can then interact with the same chatbot implemented with stronger security patterns designed to mitigate those risks.</p>

          <p>The goal is to develop a practical understanding of how chatbots can be exploited and to highlight the architectural patterns that allow them to operate more securely.</p>

          <h2>The Broken Chatbot</h2>

          <p>Below is a real support chatbot implementation. It can look up orders, issue refunds, and change account information. There is no traditional login; users identify themselves by providing an order number or customer ID.</p>

          <p>These design choices are intentional. They reflect patterns commonly used by support chatbots operating on production websites today.</p>

          <p>Your task is simple: interact with both chatbots and see what you can get away with. There are multiple vulnerabilities embedded in the first chatbot. Try to uncover them. Attempt to access data you should not see. Attempt to perform actions that should be restricted.</p>
        </div>
      </div>
    </section>`;

  const whatHappenedHtml = `<section class="article-content-section">
      <div class="article-container">
        <div class="article-body" style="margin-top: 3rem;">
          <h2>What Just Happened</h2>

          <p>If you experimented with the system, you likely discovered that you could:</p>

          <ul>
            <li>Retrieve another customer&rsquo;s personal information</li>
            <li>Convince the bot to issue a refund outside policy</li>
            <li>Change account details that did not belong to you</li>
          </ul>

          <p>None of these outcomes required technical exploits. They relied on conversation alone.</p>

          <p>The root issue is architectural. The chatbot was trusted to enforce policy through its system prompt. It was instructed to respect refund windows, protect privacy, and restrict account changes. But those rules existed only as natural language guidance to a probabilistic model.</p>

          <p>When an LLM is allowed to call backend tools without independent validation, it effectively becomes the authorization layer. That is a fragile design choice.</p>

          <p>Several common failure patterns are illustrated here:</p>

          <ul>
            <li><strong>Prompt-only policy enforcement:</strong> Business rules are described in text rather than enforced in code.</li>
            <li><strong>Identity ambiguity:</strong> Users can claim identifiers without proof of ownership.</li>
            <li><strong>Unvalidated tool execution:</strong> Backend services execute whatever action the model requests.</li>
            <li><strong>Over-reliance on conversational intent:</strong> The system assumes that if the model &ldquo;understands&rdquo; policy, it will consistently apply it.</li>
          </ul>

          <p>The result is predictable. A sufficiently motivated user can influence the model&rsquo;s reasoning and cause it to act outside intended boundaries.</p>

          <p>The problem is not that the model is malicious. The problem is that it was given authority without independent enforcement controls.</p>
        </div>
      </div>
    </section>`;

  const designHtml = `<section class="article-content-section">
      <div class="article-container">
        <div class="article-body" style="margin-top: 3rem;">
          <h2>Designing for Secure Operation</h2>

          <p>Now that you have seen how an insecure chatbot behaves, let&rsquo;s look at how the same system operates with security controls in place.</p>

          <p>The interface and capabilities remain the same. It can still look up orders, issue refunds, and modify account information. What changes is not what the chatbot can do, but how those actions are governed.</p>

          <p>The core shift is straightforward: the language model should reason about conversation, but it should not serve as the final authority on what actions are permitted.</p>

          <p>Instead, secure AI agent design introduces enforcement mechanisms that operate independently of the model.</p>

          <p>Some foundational patterns include:</p>

          <h3>1. Backend Authorization Controls</h3>

          <p>Every tool call should be validated in code before it is executed. The system must confirm:</p>

          <ul>
            <li>Does this session have permission to access the requested resource?</li>
            <li>Does the user own the account or order being modified?</li>
            <li>Is the requested action allowed under current policy?</li>
          </ul>

          <p>The model can suggest an action. The backend must approve it.</p>

          <h3>2. Deterministic Policy Enforcement</h3>

          <p>Policies such as refund windows, access scopes, and operational limits should be enforced programmatically. If refunds are limited to a specific timeframe, that condition should be evaluated in code, not interpreted conversationally.</p>

          <p>This ensures consistency and prevents persuasion from altering outcomes.</p>

          <h3>3. Session-Bound Identity</h3>

          <p>Once a session is associated with a specific customer or account, subsequent actions should be constrained to that identity. The system should not allow cross-account access simply because the conversation references a different identifier.</p>

          <h3>4. Input and Output Controls</h3>

          <p>Additional protections can include:</p>

          <ul>
            <li>Screening user inputs for obvious prompt injection or role override attempts before they reach the model.</li>
            <li>Filtering responses to prevent accidental exposure of sensitive information.</li>
          </ul>

          <p>These controls do not eliminate all risk, but they create layered enforcement. Security no longer depends on whether the model &ldquo;remembers&rdquo; to follow instructions.</p>

          <h2>The Secured Chatbot</h2>

          <p>Below is the same chatbot interface with the same capabilities. The difference is architectural. The system now implements identity binding, backend validation, and deterministic policy enforcement.</p>

          <p>Try the same techniques you attempted earlier and see if you can mount the same attacks:</p>
        </div>
      </div>
    </section>`;

  const closingHtml = `<section class="article-content-section">
      <div class="article-container">
        <div class="article-body" style="margin-top: 3rem;">
          <h2>Closing Thoughts</h2>

          <p>AI chatbots are becoming ubiquitous. They are being trusted with financial operations, customer data, and internal workflows. As their authority grows, so does their potential impact.</p>

          <p>The difference between a fragile chatbot and a resilient one is not the model itself. It is whether the system treats the model as a conversational interface or as an enforcement boundary.</p>

          <p>When authority is granted, it must be constrained. When sensitive systems are connected, they must be validated independently of natural language reasoning.</p>

          <p>AI agents can create significant value. But that value is sustainable only when it is supported by disciplined architectural design.</p>

          <p>This lab demonstrates both sides of that equation.</p>
        </div>
      </div>
    </section>`;

  return (
    <div className="page-wrapper content-page article-page">
      <Header currentPage="lab" />
      <main>
        <div dangerouslySetInnerHTML={{ __html: introHtml }} />

        <section className="article-content-section">
          <div className="article-container">
            <AgentChatlab />
          </div>
        </section>

        <div dangerouslySetInnerHTML={{ __html: whatHappenedHtml }} />

        <div dangerouslySetInnerHTML={{ __html: designHtml }} />

        <section className="article-content-section">
          <div className="article-container">
            <AgentChatlabSecure />
          </div>
        </section>

        <div dangerouslySetInnerHTML={{ __html: closingHtml }} />
      </main>
      <Footer />
    </div>
  );
}
