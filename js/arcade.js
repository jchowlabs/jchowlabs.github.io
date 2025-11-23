/**
 * Arcade Modal System
 * Handles opening/closing modals and loading game content
 */

// Modal elements
const modal = document.getElementById('game-modal');
const modalContent = document.getElementById('modal-arcade-content');
const closeBtn = document.querySelector('.modal-close');

// Get all game cards
const gameCards = document.querySelectorAll('.arcade-game-card');

/**
 * Open modal with specific game content
 */
function openModal(gameName) {
    // Load game content based on game name
    loadGameContent(gameName);
    
    // Get modal content element
    const modalContentEl = document.querySelector('.modal-content');
    
    // Add special class for larger modals (only Memory Match needs it on open)
    modalContentEl.classList.remove('memory-match-modal', 'typing-speed-modal');
    
    if (gameName === 'memory-match') {
        modalContentEl.classList.add('memory-match-modal');
    }
    // Note: typing-speed-modal class is added by TypingSpeed.startGame() after difficulty selection
    
    // Show modal
    modal.classList.add('active');
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

/**
 * Close modal
 */
function closeModal() {
    modal.classList.remove('active');
    
    // Re-enable body scroll
    document.body.style.overflow = 'auto';
    
    // Clear modal content after animation
    setTimeout(() => {
        modalContent.innerHTML = '';
    }, 300);
}

/**
 * Load game content into modal
 */
function loadGameContent(gameName) {
    switch(gameName) {
        case 'math-quiz':
            // Initialize the Math Quiz game
            if (window.MathQuiz) {
                MathQuiz.init();
            } else {
                modalContent.innerHTML = '<p>Game failed to load</p>';
            }
            break;
        case 'memory-match':
            // Initialize the Memory Match game
            if (window.MemoryMatch) {
                MemoryMatch.init();
            } else {
                modalContent.innerHTML = '<p>Game failed to load</p>';
            }
            break;
        case 'typing-speed':
            // Initialize the Typing Speed game
            if (window.TypingSpeed) {
                TypingSpeed.init();
            } else {
                modalContent.innerHTML = '<p>Game failed to load</p>';
            }
            break;
        default:
            modalContent.innerHTML = '<p>Game not found</p>';
    }
}

/**
 * Event Listeners
 */

// Add click event to all game cards
gameCards.forEach(card => {
    card.addEventListener('click', () => {
        const gameName = card.getAttribute('data-game');
        openModal(gameName);
    });
});

// Close button click
closeBtn.addEventListener('click', closeModal);

// Click outside modal to close
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// ESC key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Expose closeModal function globally for inline onclick handlers
window.closeModal = closeModal;
