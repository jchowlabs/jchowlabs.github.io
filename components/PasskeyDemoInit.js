'use client';
import { useEffect } from 'react';

export default function PasskeyDemoInit() {
  useEffect(() => {
    // In-memory storage for registered credentials
    let credentialStore = {};

    // Step progress state
    const stepState = {
      step1: false,
      step2: false,
      step3: false,
      step4: false,
      step5: false
    };

    // DOM elements
    const emailInput = document.getElementById('email');
    const registerBtn = document.getElementById('registerBtn');
    const signinBtn = document.getElementById('signinBtn');
    const statusMessage = document.getElementById('statusMessage');

    if (!emailInput || !registerBtn || !signinBtn || !statusMessage) return;

    // Email validation regex
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    // Mark step as complete
    function markStepComplete(stepNumber) {
      const stepKey = `step${stepNumber}`;
      if (!stepState[stepKey]) {
        stepState[stepKey] = true;
        const stepElement = document.querySelector(`.info-section li[data-number="${stepNumber}"]`);
        if (stepElement) {
          stepElement.classList.add('completed');
        }
      }
    }

    // Enable/disable buttons based on email input validation
    function handleEmailInput() {
      const email = emailInput.value.trim();
      const isValid = email.length > 0 && isValidEmail(email);
      registerBtn.disabled = !isValid;
      signinBtn.disabled = !isValid;
      if (isValid) {
        markStepComplete(1);
      }
    }
    emailInput.addEventListener('input', handleEmailInput);

    // Utility functions
    function showStatus(message, type) {
      statusMessage.textContent = message;
      statusMessage.className = `status-message ${type}`;
      statusMessage.style.display = 'block';
    }

    function hideStatus() {
      statusMessage.style.display = 'none';
    }

    function str2ab(str) {
      const encoder = new TextEncoder();
      return encoder.encode(str);
    }

    function bufferToBase64(buffer) {
      return btoa(String.fromCharCode(...new Uint8Array(buffer)));
    }

    function base64ToBuffer(base64) {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    }

    function generateChallenge() {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return array;
    }

    function getRpId() {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return null;
      }
      return 'jchowlabs.com';
    }

    // Visualization functions
    function clearFlow() {
      document.getElementById('flowArea').innerHTML = '';
    }

    function addMessage(text, position, top, delay) {
      const flowArea = document.getElementById('flowArea');
      const message = document.createElement('div');
      message.className = `message message-${position}`;
      message.textContent = text;
      message.style.top = `${top}px`;
      flowArea.appendChild(message);

      setTimeout(() => {
        message.classList.add('show');
        if (window.innerWidth <= 768) {
          setTimeout(() => {
            message.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }, 100);
        }
      }, delay);
    }

    function addArrow(fromLeft, top, delay, reverse = false) {
      const flowArea = document.getElementById('flowArea');
      const arrow = document.createElement('div');
      arrow.className = `arrow ${reverse ? 'arrow-reverse' : ''}`;
      arrow.dataset.top = top;

      const flowRect = flowArea.getBoundingClientRect();
      const leftLinePos = flowRect.width * 0.25;
      const rightLinePos = flowRect.width * 0.75;
      const gap = 8;
      const width = rightLinePos - leftLinePos - (gap * 2);

      arrow.style.width = `${width}px`;
      arrow.style.left = `${leftLinePos + gap}px`;
      arrow.style.top = `${top}px`;

      flowArea.appendChild(arrow);

      setTimeout(() => {
        arrow.classList.add('show');
      }, delay);
    }

    // Recalculate arrow positions on window resize
    let resizeTimeout;
    function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const flowArea = document.getElementById('flowArea');
        if (!flowArea) return;

        const arrows = flowArea.querySelectorAll('.arrow');
        if (arrows.length === 0) return;

        const flowRect = flowArea.getBoundingClientRect();
        const leftLinePos = flowRect.width * 0.25;
        const rightLinePos = flowRect.width * 0.75;
        const gap = 8;
        const width = rightLinePos - leftLinePos - (gap * 2);

        arrows.forEach(arrow => {
          arrow.style.width = `${width}px`;
          arrow.style.left = `${leftLinePos + gap}px`;
        });
      }, 100);
    }
    window.addEventListener('resize', handleResize);

    // Register passkey
    async function handleRegister() {
      const email = emailInput.value.trim();
      if (!email) {
        showStatus('Please enter an email address', 'error');
        return;
      }

      markStepComplete(2);
      clearFlow();
      hideStatus();

      if (window.innerWidth <= 768) {
        const flowArea = document.getElementById('flowArea');
        if (flowArea) {
          flowArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      try {
        if (!window.PublicKeyCredential) {
          showStatus('WebAuthn is not supported in this browser', 'error');
          return;
        }

        addMessage('1. Registration Request', 'right', 20, 0);
        setTimeout(() => markStepComplete(3), 2500);
        await new Promise(resolve => setTimeout(resolve, 800));

        addArrow(true, 28, 0, false);
        await new Promise(resolve => setTimeout(resolve, 800));

        addMessage('2. Request Received', 'left', 20, 0);
        await new Promise(resolve => setTimeout(resolve, 1200));

        addMessage('3. Registration Challenge', 'left', 70, 0);
        await new Promise(resolve => setTimeout(resolve, 800));

        addArrow(true, 78, 0, true);
        await new Promise(resolve => setTimeout(resolve, 800));

        addMessage('4. Prompt User', 'right', 70, 0);
        await new Promise(resolve => setTimeout(resolve, 800));

        const challenge = generateChallenge();
        const rpId = getRpId();

        const publicKeyCredentialCreationOptions = {
          challenge: challenge,
          rp: { name: "jchowlabs" },
          user: {
            id: str2ab(email),
            name: email,
            displayName: email
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: false,
            userVerification: "preferred"
          },
          timeout: 60000,
          attestation: "none"
        };

        if (rpId) {
          publicKeyCredentialCreationOptions.rp.id = rpId;
        }

        const credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions
        });

        if (credential) {
          addMessage('5. Generate Key Pair', 'right', 120, 0);
          await new Promise(resolve => setTimeout(resolve, 1200));

          addMessage('6. Sign Challenge', 'right', 170, 0);
          await new Promise(resolve => setTimeout(resolve, 1200));

          addMessage('7. Store Private Key', 'right', 220, 0);
          await new Promise(resolve => setTimeout(resolve, 1200));

          addMessage('8. Send Public Key & Signed Challenge', 'right', 270, 0);
          await new Promise(resolve => setTimeout(resolve, 800));

          addArrow(true, 278, 0, false);
          await new Promise(resolve => setTimeout(resolve, 800));

          addMessage('9. Verify Signature & Store Public Key', 'left', 270, 0);
          await new Promise(resolve => setTimeout(resolve, 1200));

          credentialStore[email] = {
            credentialId: bufferToBase64(credential.rawId),
            publicKey: bufferToBase64(credential.response.getPublicKey()),
            counter: 0
          };

          showStatus(`Successfully registered for ${email}!`, 'success');

          if (window.innerWidth <= 768) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      } catch (error) {
        console.error('Registration error:', error);
        clearFlow();

        if (error.name === 'NotAllowedError') {
          showStatus('Registration cancelled or not allowed', 'warning');
        } else if (error.name === 'InvalidStateError') {
          showStatus('A passkey already exists for this device', 'warning');
        } else {
          showStatus(`Registration failed: ${error.message}`, 'error');
        }
      }
    }
    registerBtn.addEventListener('click', handleRegister);

    // Sign in with passkey
    async function handleSignin() {
      const email = emailInput.value.trim();
      if (!email) {
        showStatus('Please enter an email address', 'error');
        return;
      }

      markStepComplete(4);
      clearFlow();
      hideStatus();

      if (window.innerWidth <= 768) {
        const flowArea = document.getElementById('flowArea');
        if (flowArea) {
          flowArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      try {
        if (!window.PublicKeyCredential) {
          showStatus('WebAuthn is not supported in this browser', 'error');
          return;
        }

        if (!credentialStore[email]) {
          showStatus('No passkey found. Please register first.', 'info');
          return;
        }

        addMessage('1. Login Request', 'right', 20, 0);
        setTimeout(() => markStepComplete(5), 2500);
        await new Promise(resolve => setTimeout(resolve, 800));

        addArrow(true, 28, 0, false);
        await new Promise(resolve => setTimeout(resolve, 800));

        addMessage('2. Request Received', 'left', 20, 0);
        await new Promise(resolve => setTimeout(resolve, 1200));

        addMessage('3. Send Challenge', 'left', 70, 0);
        await new Promise(resolve => setTimeout(resolve, 800));

        addArrow(true, 78, 0, true);
        await new Promise(resolve => setTimeout(resolve, 800));

        addMessage('4. Challenge Received', 'right', 70, 0);
        await new Promise(resolve => setTimeout(resolve, 1200));

        addMessage('5. Prompt User', 'right', 120, 0);
        await new Promise(resolve => setTimeout(resolve, 800));

        const challenge = generateChallenge();
        const credentialId = base64ToBuffer(credentialStore[email].credentialId);
        const rpId = getRpId();

        const publicKeyCredentialRequestOptions = {
          challenge: challenge,
          allowCredentials: [{
            id: credentialId,
            type: 'public-key',
            transports: ['internal']
          }],
          timeout: 60000,
          userVerification: "preferred"
        };

        if (rpId) {
          publicKeyCredentialRequestOptions.rpId = rpId;
        }

        const assertion = await navigator.credentials.get({
          publicKey: publicKeyCredentialRequestOptions
        });

        if (assertion) {
          addMessage('6. Retrieve Private Key', 'right', 170, 0);
          await new Promise(resolve => setTimeout(resolve, 1200));

          addMessage('7. Sign Challenge', 'right', 220, 0);
          await new Promise(resolve => setTimeout(resolve, 1200));

          addMessage('8. Send Signed Challenge', 'right', 270, 0);
          await new Promise(resolve => setTimeout(resolve, 800));

          addArrow(true, 278, 0, false);
          await new Promise(resolve => setTimeout(resolve, 800));

          addMessage('9. Verify Signature with Public Key', 'left', 270, 0);
          await new Promise(resolve => setTimeout(resolve, 1200));

          showStatus(`Successfully signed in as ${email}!`, 'success');

          if (window.innerWidth <= 768) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        clearFlow();

        if (error.name === 'NotAllowedError') {
          showStatus('Authentication cancelled or not allowed', 'warning');
        } else {
          showStatus(`Authentication failed: ${error.message}`, 'error');
        }
      }
    }
    signinBtn.addEventListener('click', handleSignin);

    // Cleanup on unmount
    return () => {
      emailInput.removeEventListener('input', handleEmailInput);
      registerBtn.removeEventListener('click', handleRegister);
      signinBtn.removeEventListener('click', handleSignin);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return null;
}
