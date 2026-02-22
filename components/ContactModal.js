'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby0dSZvJuUNuqUUPbe_X7JyqgchIauBbAQtcz0lGdhF3cgOhK0W_tjVyPVh2g_ciaZw/exec';

export default function ContactModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  // Expose open/close globally for chatbot.js
  useEffect(() => {
    window.openContactModal = () => setIsOpen(true);
    window.openModal = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      setIsOpen(true);
    };
    window.closeModal = () => setIsOpen(false);
    return () => {
      delete window.openContactModal;
      delete window.openModal;
      delete window.closeModal;
    };
  }, []);

  // Auto-open if ?contact=1
  useEffect(() => {
    if (window.location.search.includes('contact=1')) {
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const form = formRef.current;
    const newErrors = {};

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const helpWith = form.helpWith.value.trim();
    const message = form.message.value.trim();

    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!helpWith) newErrors.helpWith = 'Please select an option';
    if (!message) newErrors.message = 'Message is required';

    const hasRecaptcha = typeof window.grecaptcha !== 'undefined';
    const recaptchaResponse = hasRecaptcha ? window.grecaptcha.getResponse() : '';
    if (hasRecaptcha && !recaptchaResponse) newErrors.captcha = 'Please complete the reCAPTCHA';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const formData = new URLSearchParams();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('helpWith', helpWith);
      formData.append('message', message);
      if (hasRecaptcha) formData.append('recaptchaToken', recaptchaResponse);

      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      form.reset();
      if (hasRecaptcha) window.grecaptcha.reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Form submission error:', error);
      if (hasRecaptcha) window.grecaptcha.reset();
    } finally {
      setSubmitting(false);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" id="contactModal" onClick={(e) => {
      if (e.target === e.currentTarget) setIsOpen(false);
    }}>
      <div className="modal">
        <button className="modal-close" onClick={() => setIsOpen(false)}>&times;</button>
        <h2>Get in touch</h2>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="helpWith">I need help with...</label>
            <select id="helpWith" name="helpWith" className={errors.helpWith ? 'error' : ''}>
              <option value="">Select an option</option>
              <option value="IAM Health Check">IAM Health Check</option>
              <option value="IAM Strategy">IAM Strategy</option>
              <option value="Vendor Evaluation">Vendor Proof-of-Concepts</option>
              <option value="Identity Verification">Identity Verification</option>
              <option value="Single Sign-On">Single Sign-On</option>
              <option value="Multi-Factor Authentication">Multi-Factor Authentication</option>
              <option value="Passwordless Authentication">Passwordless Authentication</option>
              <option value="Conversational AI">Conversational AI</option>
              <option value="AI Agent Development">AI Agent Development</option>
              <option value="AI Agent Security">AI Agent Security</option>
              <option value="Github Repo Access">Github Repo Access</option>
            </select>
            {errors.helpWith && <div className="field-error">{errors.helpWith}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" className={errors.name ? 'error' : ''} />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" className={errors.email ? 'error' : ''} />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows="2" className={errors.message ? 'error' : ''} />
            {errors.message && <div className="field-error">{errors.message}</div>}
          </div>
          <div className="captcha-container">
            <div className="g-recaptcha" data-sitekey="6LePBVAsAAAAALJ6-5iWAx1mISKz7Rr9hwA8RSld"></div>
          </div>
          {errors.captcha && <div className="field-error" style={{ textAlign: 'center', marginBottom: '12px' }}>{errors.captcha}</div>}
          <button type="submit" className="form-submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </div>
    </div>
  );
}
