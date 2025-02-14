---
title: "Deep Dive - Passkey Internals"
excerpt: ""
collection: projects
---

### ![Passkey](/images/passkey.png){: .align-center}

### Passkey 101

#### Introduction

Passkeys are emerging as the next major innovation in authentication, offering a passwordless, more secure, and user-friendly way to access websites and applications. They leverage cryptographic keys and biometrics to replace traditional passwords, reducing the risk of phishing, credential stuffing, and other security threats.

#### The Evolution of Authentication & The Rise of Passkeys

For decades, passwords have been the standard method of authentication. However, they come with significant security risks—weak passwords, reuse across multiple sites, and susceptibility to phishing attacks. Multi-Factor Authentication (MFA) improved security, but usability concerns persisted. Passkeys, built on the FIDO2 and WebAuthn standards, solve these issues by eliminating passwords altogether while ensuring a seamless user experience.

#### How Passkeys Work

Passkeys use asymmetric cryptography. When a user registers on a website using a passkey-enabled device, the system generates a key pair:

* Private Key: Stored securely on the user's device and never shared.
* Public Key: Sent to the website and stored for future authentication.

During authentication, the website challenges the user's device, which signs the challenge with the private key, proving the user’s identity without exposing sensitive information.

Passkeys can be stored on a device or synchronized across multiple devices via a secure cloud service, making them highly convenient for users.

#### Problems Passkeys Solve

1. Eliminating Password Theft: Since there is no password to steal, phishing attacks are ineffective.

2. Preventing Credential Reuse: Each key pair is unique to a website, preventing reuse.

3. 4. Enhancing Usability: Users authenticate with biometrics, a PIN, or a security key, making the process seamless.

4. Reducing MFA Fatigue: Since passkeys inherently provide strong authentication, they eliminate the need for cumbersome MFA codes.

#### Implementing Passkeys on a Website

Developers can integrate passkeys using the WebAuthn API. Here’s a basic example of how to register and authenticate a user with passkeys in JavaScript:

1. Registering a Passkey

```python
const createCredential = async () => {
    const credential = await navigator.credentials.create({
        publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: "Example Site" },
            user: {
                id: new Uint8Array(16),
                name: "user@example.com",
                displayName: "Example User"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: { authenticatorAttachment: "platform" },
        }
    });
    console.log(credential);
};
```

2. Authenticating with a Passkey

```python
const getCredential = async () => {
    const credential = await navigator.credentials.get({
        publicKey: {
            challenge: new Uint8Array(32),
        }
    });
    console.log(credential);
};
```

These API calls allow developers to create and retrieve passkeys for authentication, providing a passwordless login experience.

#### Conclusion

Passkeys represent the future of authentication, offering security, convenience, and phishing resistance. As major platforms like Apple, Google, and Microsoft continue to adopt passkeys, developers should start integrating them into their applications to enhance security and user experience. The transition to passkeys is an important step toward a more secure, passwordless internet.
