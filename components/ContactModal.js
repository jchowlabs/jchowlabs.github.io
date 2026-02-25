'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby0dSZvJuUNuqUUPbe_X7JyqgchIauBbAQtcz0lGdhF3cgOhK0W_tjVyPVh2g_ciaZw/exec';

const RECAPTCHA_SITEKEY = '6LePBVAsAAAAALJ6-5iWAx1mISKz7Rr9hwA8RSld';

export default function ContactModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [helpWith, setHelpWith] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);
  const recaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Expose open/close globally for Chatbot component
  useEffect(() => {
    window.openContactModal = () => setIsOpen(true);
    window.closeContactModal = () => setIsOpen(false);
    window.openModal = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      setIsOpen(true);
    };
    window.closeModal = () => setIsOpen(false);
    return () => {
      delete window.openContactModal;
      delete window.closeContactModal;
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

  // Render reCAPTCHA widget when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const renderWidget = () => {
      if (!recaptchaRef.current) return;
      // If widget already rendered in this div, reset it
      if (widgetIdRef.current !== null) {
        try { window.grecaptcha.reset(widgetIdRef.current); } catch (e) {}
        return;
      }
      try {
        widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: RECAPTCHA_SITEKEY,
          theme: 'light',
        });
      } catch (e) {
        // Already rendered (edge case)
      }
    };

    // grecaptcha may not be ready yet — poll briefly
    if (window.grecaptcha && window.grecaptcha.render) {
      renderWidget();
    } else {
      const poll = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.render) {
          clearInterval(poll);
          renderWidget();
        }
      }, 200);
      return () => clearInterval(poll);
    }
  }, [isOpen]);

  // Reset widget id when modal closes so it re-renders next open
  useEffect(() => {
    if (!isOpen) {
      widgetIdRef.current = null;
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const form = formRef.current;
    const newErrors = {};

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!helpWith) newErrors.helpWith = 'Please select an option';
    if (!message) newErrors.message = 'Message is required';

    const hasRecaptcha = typeof window.grecaptcha !== 'undefined' && widgetIdRef.current !== null;
    const recaptchaResponse = hasRecaptcha ? window.grecaptcha.getResponse(widgetIdRef.current) : '';
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
      setHelpWith('');
      if (hasRecaptcha) window.grecaptcha.reset(widgetIdRef.current);
      setIsOpen(false);
    } catch (error) {
      console.error('Form submission error:', error);
      if (hasRecaptcha) window.grecaptcha.reset(widgetIdRef.current);
    } finally {
      setSubmitting(false);
    }
  }, [helpWith]);

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
            <select id="helpWith" className={`desktop-only ${errors.helpWith ? 'error' : ''}`} value={helpWith} onChange={(e) => setHelpWith(e.target.value)}>
              <option value="">Select an option</option>
              <option value="Identity & access strategy">Identity &amp; access strategy</option>
              <option value="Identity verification">Identity verification</option>
              <option value="Passwordless authentication">Passwordless authentication</option>
              <option value="Advanced authentication">Advanced authentication</option>
              <option value="AI agents & conversational AI">AI agents &amp; conversational AI</option>
              <option value="Securing AI systems">Securing AI systems</option>
              <option value="Vendor evaluation">Vendor evaluation</option>
              <option value="Exploratory conversation">Exploratory conversation</option>
            </select>
            <select className={`mobile-only ${errors.helpWith ? 'error' : ''}`} value={helpWith} onChange={(e) => setHelpWith(e.target.value)}>
              <option value="">Select an option</option>
              <option value="Identity & access strategy">IAM strategy</option>
              <option value="Identity verification">ID verification</option>
              <option value="Passwordless authentication">Passwordless auth</option>
              <option value="Advanced authentication">Advanced auth</option>
              <option value="AI agents & conversational AI">Agents &amp; Convo AI</option>
              <option value="Securing AI systems">Securing AI</option>
              <option value="Vendor evaluation">Vendor evals</option>
              <option value="Exploratory conversation">Exploratory convo</option>
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
            <div ref={recaptchaRef}></div>
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
