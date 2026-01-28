function openModal(e) {
    e.preventDefault();
    document.getElementById('contactModal').classList.add('active');
}

function closeModal() {
    document.getElementById('contactModal').classList.remove('active');
}

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby0dSZvJuUNuqUUPbe_X7JyqgchIauBbAQtcz0lGdhF3cgOhK0W_tjVyPVh2g_ciaZw/exec';

async function handleSubmit(event) {
    event.preventDefault();

    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('input, textarea, select').forEach(el => el.classList.remove('error'));

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const helpWithInput = document.getElementById('helpWith');
    const messageInput = document.getElementById('message');

    const name = nameInput?.value?.trim() || '';
    const email = emailInput?.value?.trim() || '';
    const helpWith = helpWithInput?.value?.trim() || '';
    const message = messageInput?.value?.trim() || '';

    const hasRecaptcha = typeof window.grecaptcha !== 'undefined';
    const recaptchaResponse = hasRecaptcha ? window.grecaptcha.getResponse() : '';

    let hasError = false;

    if (!name) {
        const el = document.getElementById('name-error');
        if (el) el.textContent = 'Name is required';
        if (nameInput) nameInput.classList.add('error');
        hasError = true;
    }

    if (!email) {
        const el = document.getElementById('email-error');
        if (el) el.textContent = 'Email is required';
        if (emailInput) emailInput.classList.add('error');
        hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        const el = document.getElementById('email-error');
        if (el) el.textContent = 'Please enter a valid email';
        if (emailInput) emailInput.classList.add('error');
        hasError = true;
    }

    if (!helpWith) {
        const el = document.getElementById('helpWith-error');
        if (el) el.textContent = 'Please select an option';
        if (helpWithInput) helpWithInput.classList.add('error');
        hasError = true;
    }

    if (!message) {
        const el = document.getElementById('message-error');
        if (el) el.textContent = 'Message is required';
        if (messageInput) messageInput.classList.add('error');
        hasError = true;
    }

    if (hasRecaptcha && !recaptchaResponse) {
        const el = document.getElementById('captcha-error');
        if (el) el.textContent = 'Please complete the reCAPTCHA';
        hasError = true;
    }

    if (hasError) return;

    const submitBtn = event.target?.querySelector?.('.form-submit');
    const originalText = submitBtn?.textContent || '';

    if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
    }

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
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        event.target?.reset?.();
        if (hasRecaptcha) window.grecaptcha.reset();
        closeModal();

    } catch (error) {
        console.error('Form submission error:', error);
        if (hasRecaptcha) window.grecaptcha.reset();
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText || 'Send message';
            submitBtn.disabled = false;
        }
    }
}

// Hamburger menu toggle
function toggleMenu() {
    const nav = document.querySelector('nav');
    const hamburger = document.querySelector('.hamburger');
    nav.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Close mobile menu when clicking on a link
document.addEventListener('DOMContentLoaded', async function() {
    // Load modal HTML from shared component
    try {
        const modalPath = window.location.pathname.includes('/insights/') || 
                         window.location.pathname.includes('/research/') || 
                         window.location.pathname.includes('/lab/') 
                         ? '../includes/modal.html' 
                         : 'includes/modal.html';
        
        const response = await fetch(modalPath);
        const html = await response.text();
        document.body.insertAdjacentHTML('afterbegin', html);
    } catch (error) {
        console.error('Failed to load modal:', error);
    }
    
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't close if it's the contact modal link
            if (!this.getAttribute('onclick')?.includes('openModal')) {
                const nav = document.querySelector('nav');
                const hamburger = document.querySelector('.hamburger');
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const nav = document.querySelector('nav');
        const hamburger = document.querySelector('.hamburger');
        if (nav.classList.contains('active') && 
            !nav.contains(e.target) && 
            !hamburger.contains(e.target)) {
            nav.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});
