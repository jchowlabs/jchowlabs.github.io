import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'The Cryptography Behind Passkeys | jchowlabs',
  description: 'A deep dive into how passkeys work at the cryptographic level — RSA, ECDSA, key generation, registration, authentication, and why it\'s secure.',
};

export default function ArticlePage() {
  const content = `<section class="article-content-section">
			<div class="article-container">
				<div class="article-hero">
					<img src="/static/images/going-passwordless.png" alt="The Cryptography Behind Passkeys" class="article-hero-img">
				</div>

				<div class="article-header">
					<h1>The Cryptography Behind Passkeys</h1>
				</div>

				<div class="article-body">
					<p>Where does the strength in passkeys come from?</p>
					<p>Let&rsquo;s start with a quick overview of what passkeys actually are. A passkey is a modern replacement for passwords, built on asymmetric (public-key) cryptography. When you register a passkey with a website, your device generates a private key inside secure hardware and shares only the corresponding public key with the server. The private key never leaves your device.</p>
					<p>When you log in, your device doesn&rsquo;t send a secret across the network. Instead, it proves it holds the private key by signing a cryptographic challenge issued by the server. No password is typed. No shared secret is transmitted. Nothing reusable is stored server-side.</p>
					<p>Passkeys are built on the <strong>WebAuthn / FIDO2</strong> standard. Under the hood, the core primitive is a <strong>digital signature scheme</strong>. This article walks through exactly how that works &mdash; from key generation to registration to authentication &mdash; all the way down to the underlying mathematics.</p>


					<h2>Part 1: The Cryptographic Foundation &mdash; Digital Signatures</h2>
					<p>Passkeys rely on digital signatures to prove possession of a private key without ever revealing it. A digital signature allows a device to produce a short piece of data that can only be generated with the private key, yet can be verified by anyone holding the corresponding public key.</p>
					<p>Two signature algorithms dominate real-world passkey implementations:</p>
					<ul>
						<li><strong>RSA (RS256):</strong> Uses modular exponentiation. Supported broadly for compatibility, particularly on enterprise hardware tokens.</li>
						<li><strong>ECDSA with P-256 (ES256):</strong> Uses elliptic curve cryptography. This is the default for most modern passkeys &mdash; Apple, Google, and Windows Hello all prefer this algorithm.</li>
					</ul>
					<p>Both algorithms follow the same high-level pattern: a private key signs a message, and the public key verifies that signature. The security properties of passkeys come from the fact that producing a valid signature is computationally infeasible without the private key. The underlying mathematics differ, so we will cover both.</p>

					<h3>1a. RSA Digital Signatures (RS256)</h3>

					<p><strong>Key Generation</strong></p>
					<p>RSA key generation produces three numbers:</p>
					<ul>
						<li><strong>N</strong> &mdash; the modulus, the product of two large secret primes <em>p</em> and <em>q</em></li>
						<li><strong>e</strong> &mdash; the public exponent (almost universally 65537)</li>
						<li><strong>d</strong> &mdash; the private exponent, computed such that <code>e &times; d &equiv; 1 (mod &lambda;(N))</code>, where &lambda;(N) is the Carmichael totient of N</li>
					</ul>
					<p>These form two keys:</p>
					<div class="code-block">
						<pre>Public key:   (e, N)   &mdash; shared with the server
Private key:  (d, N)   &mdash; sealed in the secure enclave, never exported</pre>
					</div>

					<p><strong>Signing and Verification</strong></p>
					<p>In practice, we never sign the raw message &mdash; we sign its hash. This produces a fixed-size input for the modular arithmetic and ensures that changing even one byte of the original message completely invalidates the signature.</p>
					<div class="code-block">
						<pre># Signing   (private key operation)
signature = Hash(message)<sup>d</sup>  mod N

# Verification   (public key operation)
recovered = signature<sup>e</sup>  mod N

valid  &harr;  recovered == Hash(message)</pre>
					</div>
					<p>Only someone holding <code>d</code> can produce a value that, when raised to <code>e mod N</code>, recovers the original hash. Reversing this to find <code>d</code> from <code>(e, N)</code> requires factoring <code>N</code> &mdash; computationally infeasible for 2048-bit or larger moduli.</p>


					<h3>1b. ECDSA Digital Signatures (ES256)</h3>
					<p>ECDSA uses elliptic curve cryptography over the <strong>P-256 curve</strong> (also called secp256r1). Rather than modular exponentiation, the math is built on <strong>point multiplication</strong> on an elliptic curve.</p>

					<p><strong>Elliptic Curve Basics</strong></p>
					<p>An elliptic curve over a finite field is the set of points <code>(x, y)</code> satisfying:</p>
					<div class="code-block">
						<pre>y<sup>2</sup> &equiv; x<sup>3</sup> + ax + b  (mod p)</pre>
					</div>
					<p>For P-256, the constants <code>a</code>, <code>b</code>, and prime <code>p</code> are fixed and public. The curve also has a designated <strong>generator point G</strong> &mdash; a specific point on the curve agreed upon by the standard.</p>
					<p>Point multiplication is defined as repeated point addition:</p>
					<div class="code-block">
						<pre>Q = d &times; G   (add G to itself d times, using the elliptic curve addition rules)</pre>
					</div>
					<p>This operation is a <strong>one-way trapdoor</strong>: given <code>d</code> and <code>G</code>, computing <code>Q</code> is fast. But given only <code>Q</code> and <code>G</code>, recovering <code>d</code> is the elliptic curve discrete logarithm problem &mdash; computationally infeasible for 256-bit curves.</p>

					<p><strong>Key Generation</strong></p>
					<div class="code-block">
						<pre>Private key:  d         &mdash; a random 256-bit integer, sealed in the secure enclave
Public key:   Q = d &times; G &mdash; a point on the P-256 curve, shared with the server</pre>
					</div>
					<p>A 256-bit ECC key pair provides roughly the same security as a 3072-bit RSA key pair, in a much smaller package &mdash; which is why P-256 is preferred for passkeys.</p>

					<p><strong>Signing</strong></p>
					<p>To sign a message:</p>
					<div class="code-block">
						<pre># 1. Hash the message
h = Hash(message)          e.g. SHA-256

# 2. Generate a random nonce point
k  = random integer in [1, curve_order - 1]
R  = k &times; G                 (a point on the curve)
r  = R.x  mod  curve_order (take only the x-coordinate)

# 3. Compute the signature scalar
s  = k<sup>-1</sup> &times; (h + r &times; d)  mod  curve_order

# Signature output: (r, s)</pre>
					</div>
					<p>The signature is the pair <code>(r, s)</code>. The nonce <code>k</code> must be unique and secret per signature &mdash; reusing <code>k</code> across two signatures leaks the private key <code>d</code>.</p>

					<p><strong>Verification</strong></p>
					<p>Given the message, signature <code>(r, s)</code>, and public key <code>Q</code>:</p>
					<div class="code-block">
						<pre>h  = Hash(message)

w  = s<sup>-1</sup>  mod  curve_order
u1 = h &times; w  mod  curve_order
u2 = r &times; w  mod  curve_order

X  = u1 &times; G  +  u2 &times; Q    (elliptic curve point addition)

valid  &harr;  X.x  mod curve_order  ==  r</pre>
					</div>
					<p>The verification recovers the nonce point <code>R</code> using the public key <code>Q</code> instead of the private key <code>d</code>. If the x-coordinate matches <code>r</code>, the signature checks out. No knowledge of <code>d</code> is required &mdash; only <code>Q</code>, which is public.</p>


					<h2>Part 2: Key Generation on Device</h2>
					<p>Regardless of which signature algorithm is used (RSA or ECDSA), the private key is generated inside a secure hardware boundary on the user&rsquo;s device. This boundary is designed specifically to prevent key extraction, even if the rest of the operating system is compromised.</p>
					<p>Common implementations include:</p>
					<ul>
						<li><strong>Apple devices:</strong> Secure Enclave (dedicated cryptographic coprocessor)</li>
						<li><strong>Windows / Android:</strong> Trusted Platform Module (TPM) or hardware-backed keystore</li>
						<li><strong>Hardware security keys:</strong> FIDO2-certified secure element (e.g., YubiKey)</li>
					</ul>
					<p>The secure enclave is physically and logically isolated from the main processor. Key material is generated internally using a hardware random number generator and never leaves the enclave in plaintext form.</p>
					<p>When a passkey is created:</p>
					<ol>
						<li>The enclave generates the key pair.</li>
						<li>The private key is sealed inside the hardware boundary.</li>
						<li>The public key is returned to the operating system for registration with the server.</li>
					</ol>
					<p>The private key cannot be exported, read, or copied. The operating system does not receive the key itself &mdash; it receives only a handle that allows it to request cryptographic operations.</p>
					<p>From that point forward, the enclave will perform a signing operation only after local user verification (Face ID, Touch ID, device PIN, etc.). The verification step gates access to the key&rsquo;s signing capability but does not expose the key material.</p>
					<p>Even if malware gains full control of the operating system, it cannot extract the private key. At most, it could attempt to request signatures &mdash; and those requests would still require successful user verification.</p>
					<p>This hardware confinement of the private key is one of the core security properties of passkeys. The server never sees the private key. The operating system cannot read it. And attackers cannot steal it through database breaches or phishing.</p>


					<h2>Part 3: Registration Flow</h2>
					<p>Registration establishes a passkey between the user&rsquo;s device and a website (the relying party). Its purpose is to securely associate a newly generated public key with a user account and bind that key to the site&rsquo;s domain.</p>
					<p>At the end of registration, the server stores a public key and a credential identifier. The corresponding private key remains sealed inside the user&rsquo;s device.</p>

					<h3>Step 1 &mdash; Server Issues a Registration Challenge</h3>
					<p>The server begins registration by generating a fresh random nonce and sending it to the browser along with the relying party identifier and user information.</p>
					<p>This challenge serves two purposes:</p>
					<ul>
						<li>It ensures the registration response was generated for this specific session.</li>
						<li>It prevents replay of previously captured registration data.</li>
					</ul>
					<p>The challenge is single-use and short-lived.</p>
					<div class="code-block">
						<pre>Server generates:
  challenge_reg = 0x9f3a...c2b1       (random 32-byte nonce, single-use)
  relying_party = "jchowlabs.com"
  user_id       = "alice"

Server  &mdash;&mdash;&rsaquo;  Browser:  { challenge_reg, relying_party, user_id }</pre>
					</div>
					<p>The challenge is single-use and short-lived. It ensures the response was generated right now for this session &mdash; not replayed from a previous one.</p>

					<h3>Step 2 &mdash; Device Generates a Key Pair</h3>
					<p>The browser invokes the WebAuthn API, which asks the secure enclave to generate a new key pair bound to this relying party.</p>
					<div class="code-block">
						<pre># RSA path
Enclave generates:  p, q  &rarr;  N = p &times; q
                    e = 65537
                    d  such that  e &times; d &equiv; 1 (mod &lambda;(N))

# ECDSA path
Enclave generates:  d = random 256-bit integer
                    Q = d &times; G   (on P-256)

In both cases:
  Private key  &rarr;  sealed in enclave, tagged to "jchowlabs.com"
  Public key   &rarr;  exportable
  credential_id = opaque handle used to look up this key later</pre>
					</div>

					<h3>Step 3 &mdash; Device Builds and Signs the Attestation</h3>
					<p>The device assembles <strong>authenticator data</strong> &mdash; a structured payload packaging the key and binding it to the domain:</p>
					<div class="code-block">
						<pre>authenticator_data = {
  rp_id_hash:    SHA-256("jchowlabs.com"),   &larr; domain hash, binds credential to this site
  flags:         user_present=1, user_verified=1,
  sign_counter:  0,
  credential_id: &lt;opaque handle&gt;,
  public_key:    (e, N)  or  Q              &larr; RSA or ECDSA public key
}</pre>
					</div>
					<p>The device also builds <strong>client data</strong>, which embeds the original challenge:</p>
					<div class="code-block">
						<pre>client_data = {
  type:      "webauthn.create",
  challenge: challenge_reg,                 &larr; echo of server's nonce
  origin:    "https://jchowlabs.com"
}

client_data_hash = SHA-256(client_data)</pre>
					</div>
					<p>Now the enclave signs the combined payload:</p>
					<div class="code-block">
						<pre>message_to_sign = authenticator_data || client_data_hash

# RSA path
signature_reg = Hash(message_to_sign)<sup>d</sup>  mod N

# ECDSA path
h   = Hash(message_to_sign)
k   = random nonce
R   = k &times; G
r   = R.x  mod  curve_order
s   = k<sup>-1</sup> &times; (h + r &times; d)  mod  curve_order
signature_reg = (r, s)</pre>
					</div>

					<h3>Step 4 &mdash; Device Sends the Registration Response</h3>
					<div class="code-block">
						<pre>Device  &mdash;&mdash;&rsaquo;  Server:
  {
    credential_id,
    public_key:          (e, N)  or  Q,
    authenticator_data,
    client_data_hash,
    signature_reg
  }</pre>
					</div>

					<h3>Step 5 &mdash; Server Verifies the Registration</h3>
					<div class="code-block">
						<pre># 1. Verify domain binding
SHA-256("jchowlabs.com") == authenticator_data.rp_id_hash        &check;
client_data.origin       == "https://jchowlabs.com"              &check;

# 2. Verify challenge freshness (no replay)
client_data.challenge    == challenge_reg                        &check;

# 3a. Verify signature &mdash; RSA path
recovered = signature_reg<sup>e</sup>  mod N
expected  = Hash(authenticator_data || client_data_hash)
recovered == expected                                            &check;

# 3b. Verify signature &mdash; ECDSA path
h  = Hash(authenticator_data || client_data_hash)
w  = s<sup>-1</sup>  mod  curve_order
u1 = h &times; w  mod  curve_order
u2 = r &times; w  mod  curve_order
X  = u1 &times; G  +  u2 &times; Q
X.x  mod  curve_order  ==  r                                     &check;

# 4. Store credential
Server stores:  { user_id  &rarr;  (credential_id, public_key) }</pre>
					</div>
					<p>The server stores only the public key. It never sees <code>d</code>, and <code>d</code> cannot be derived from the public key &mdash; factoring <code>N</code> (RSA) or solving the elliptic curve discrete log (ECDSA) are both computationally infeasible.</p>


					<h2>Part 4: Authentication Flow</h2>
					<p>Authentication is simpler than registration. No new keys are generated. The device simply proves &mdash; in real time &mdash; that it still possesses the private key corresponding to the public key stored by the server.</p>
					<p>Where registration establishes trust, authentication exercises it.</p>

					<h3>Step 1 &mdash; Server Issues an Authentication Challenge</h3>
					<div class="code-block">
						<pre>Server generates:
  challenge_auth = 0x44bc...91e7       (fresh nonce, different from registration)

Server  &mdash;&mdash;&rsaquo;  Browser:  { challenge_auth, [credential_id_1, credential_id_2, ...] }</pre>
					</div>
					<p>The list of credential IDs tells the device which keys are valid for this site, so the enclave can locate the right private key.</p>

					<h3>Step 2 &mdash; User Verifies Locally</h3>
					<p>Before the enclave will sign anything, the device requires local user verification (biometric or PIN).</p>
					<p>This step enforces two conditions:</p>
					<ul>
						<li>The device is physically present.</li>
						<li>The legitimate user is interacting with it.</li>
					</ul>
					<p>Possession of the device alone is insufficient. The enclave will not produce a signature without successful verification.</p>

					<h3>Step 3 &mdash; Device Builds Authenticator Data and Signs</h3>
					<div class="code-block">
						<pre>authenticator_data = {
  rp_id_hash:    SHA-256("jchowlabs.com"),
  flags:         user_present=1, user_verified=1,
  sign_counter:  1                             &larr; incremented from last use
}

client_data = {
  type:      "webauthn.get",
  challenge: challenge_auth,                  &larr; server's fresh nonce
  origin:    "https://jchowlabs.com"
}

client_data_hash = SHA-256(client_data)

message_to_sign = authenticator_data || client_data_hash

# RSA path
signature_auth = Hash(message_to_sign)<sup>d</sup>  mod N

# ECDSA path
h   = Hash(message_to_sign)
k   = random nonce  (fresh, never reused)
R   = k &times; G
r   = R.x  mod  curve_order
s   = k<sup>-1</sup> &times; (h + r &times; d)  mod  curve_order
signature_auth = (r, s)</pre>
					</div>
					<p>The <strong>sign counter</strong> increments with every authentication. The server tracks the last counter value it accepted &mdash; any non-increasing counter is rejected as a potential replay or cloned credential.</p>

					<h3>Step 4 &mdash; Device Sends the Authentication Response</h3>
					<div class="code-block">
						<pre>Device  &mdash;&mdash;&rsaquo;  Server:
  {
    credential_id,
    authenticator_data,
    client_data_hash,
    signature_auth
  }</pre>
					</div>
					<p>Note: the public key is <strong>not sent</strong> this time. The server already has it from registration.</p>

					<h3>Step 5 &mdash; Server Verifies the Authentication</h3>
					<div class="code-block">
						<pre># 1. Look up public key from registration store
public_key  =  lookup(credential_id)          &larr; (e, N) for RSA, Q for ECDSA

# 2. Verify domain binding and origin
SHA-256("jchowlabs.com") == authenticator_data.rp_id_hash        &check;
client_data.origin       == "https://jchowlabs.com"              &check;

# 3. Verify challenge freshness (no replay)
client_data.challenge    == challenge_auth                       &check;

# 4. Verify counter incremented (anti-clone / anti-replay)
authenticator_data.sign_counter  >  stored_counter              &check;
stored_counter  &larr;  authenticator_data.sign_counter  (update)

# 5a. Verify signature &mdash; RSA path
recovered = signature_auth<sup>e</sup>  mod N
expected  = Hash(authenticator_data || client_data_hash)
recovered == expected                                            &check;

# 5b. Verify signature &mdash; ECDSA path
h  = Hash(authenticator_data || client_data_hash)
w  = s<sup>-1</sup>  mod  curve_order
u1 = h &times; w  mod  curve_order
u2 = r &times; w  mod  curve_order
X  = u1 &times; G  +  u2 &times; Q
X.x  mod  curve_order  ==  r                                     &check;

&rarr;  Authentication succeeds. Access granted.</pre>
					</div>


					<h2>Part 5: Why This Is Secure</h2>
					<p>The security of passkeys follows directly from the cryptographic and system properties described in the previous sections. Each major class of attack against passwords is either eliminated or substantially reduced by design.</p>

					<p><strong>No shared secret</strong></p>
					<p>Passwords are shared secrets: the user knows them, and the server stores something derived from them. Any server breach creates the risk of offline guessing or credential reuse.</p>
					<p>Passkeys eliminate shared secrets entirely. The server stores only a public key. Possession of that public key does not enable authentication &mdash; producing a valid signature requires the private key <em>d</em>, which never leaves the user&rsquo;s device and cannot be derived from the public key.</p>
					<p>For RSA, deriving <em>d</em> requires factoring <em>N</em>.<br>For ECDSA, it requires solving the elliptic curve discrete logarithm problem.</p>
					<p>Both problems are computationally infeasible with current cryptographic parameters.</p>

					<p><strong>Phishing resistance</strong></p>
					<p>With passwords, users can be tricked into revealing credentials to a convincing imitation of a site.</p>
					<p>Passkeys are resistant to phishing by construction. The relying party&rsquo;s domain is hashed into <code>authenticator_data</code> and covered by the signature. The device will only sign a payload that includes the hash of the <em>current</em> domain.</p>
					<p>If an attacker tricks a user into visiting <code>jchow1abs.com</code>, the device will produce a signature over:</p>
					<div class="code-block">
						<pre>SHA-256("jchow1abs.com")</pre>
					</div>
					<p>When that signature is sent to the real server (<code>jchowlabs.com</code>), verification fails automatically. No warning, no user decision, and no opportunity for error.</p>

					<p><strong>Replay attack prevention</strong></p>
					<p>Every registration and authentication request includes a fresh, unpredictable challenge generated by the server. Each signature is therefore bound to a single session.</p>
					<p>A signature captured during one login attempt cannot be reused in another. The challenge will not match, and verification will fail.</p>
					<p>The sign counter provides an additional safeguard. The server tracks the highest counter value it has accepted. Any response with a non-increasing counter indicates potential replay or credential cloning and is rejected.</p>

					<p><strong>Private key confinement</strong></p>
					<p>The private key <em>d</em> is generated inside secure hardware and never exits it.</p>
					<p>The secure enclave enforces a strict interface:</p>
					<ul>
						<li>It accepts a message.</li>
						<li>It returns a signature.</li>
						<li>It never reveals key material.</li>
					</ul>
					<p>Even a fully compromised operating system cannot extract the private key. At worst, malware could attempt to request signatures &mdash; but those requests still require successful local user verification.</p>
					<p>This confinement property is critical: database breaches, phishing attacks, and credential stuffing all fail because there is no extractable secret to steal.</p>

					<h2>Summary</h2>
					<p>Passkeys replace a fragile, shared secret with a cryptographic proof of possession. Authentication succeeds only when all of the following are true:</p>
					<ul>
						<li>The user&rsquo;s device holds the correct private key.</li>
						<li>The request is bound to the correct domain.</li>
						<li>The challenge is fresh and un-replayed.</li>
						<li>The user is locally present and verified.</li>
					</ul>
					<p>These guarantees are enforced by cryptography, hardware isolation, and protocol design &mdash; not by user behavior.</p>
					<p>To see this flow in action, explore the <a href="/lab/passkey-demo">Passkey: Interactive Demo</a> or experiment directly at <a href="https://www.jchowlabs.me" target="_blank" rel="noopener noreferrer">www.jchowlabs.me</a>, where you can observe registration and authentication step by step.</p>
				</div>
			</div>
		</section>`;

  return (
    <div className="page-wrapper content-page article-page">
      <Header />
      <main dangerouslySetInnerHTML={{ __html: content }} />
      <Footer />
    </div>
  );
}
