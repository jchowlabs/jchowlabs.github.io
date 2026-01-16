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
