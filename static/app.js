function openModal(e) {
    e.preventDefault();
    document.getElementById('contactModal').classList.add('active');
}

function closeModal() {
    document.getElementById('contactModal').classList.remove('active');
}

function handleSubmit(e) {
    e.preventDefault();
    
    // Clear previous errors
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
    // Validate fields
    let isValid = true;
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    
    if (!name.value.trim()) {
        document.getElementById('name-error').textContent = 'Please enter your name';
        name.classList.add('error');
        isValid = false;
    }
    
    if (!email.value.trim()) {
        document.getElementById('email-error').textContent = 'Please enter your email';
        email.classList.add('error');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        document.getElementById('email-error').textContent = 'Please enter a valid email address';
        email.classList.add('error');
        isValid = false;
    }
    
    if (!message.value.trim()) {
        document.getElementById('message-error').textContent = 'Please enter a message';
        message.classList.add('error');
        isValid = false;
    }
    
    if (!isValid) return;
    
    alert('Message sent! (This is a demo)');
    closeModal();
    
    // Reset form
    name.value = '';
    email.value = '';
    message.value = '';
}

// Close modal on overlay click
document.getElementById('contactModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// Hamburger menu toggle
function toggleMenu() {
    const nav = document.querySelector('nav');
    const hamburger = document.querySelector('.hamburger');
    nav.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Close mobile menu when clicking on a link
document.addEventListener('DOMContentLoaded', function() {
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
