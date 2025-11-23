/**
 * Memory Match Game
 * Card matching memory game with difficulty levels
 */

const MemoryMatch = {
    difficulty: null,
    gridSize: null,
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    startTime: null,
    gameActive: false,
    
    // Emoji pairs for cards
    emojis: ['🍎', '🚗', '🎵', '⚽', '🌟', '🎨', '🐶', '🍕', '🎭', '🎪', '🎯', '🎸', '🏆', '🎮', '🎲', '🎺', '🎻', '🎬'],
    
    /**
     * Initialize the game
     */
    init() {
        this.difficulty = null;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.gameActive = false;
        this.showDifficultySelection();
    },
    
    /**
     * Show difficulty selection screen
     */
    showDifficultySelection() {
        const content = `
            <div class="math-quiz-container">
                <h2 class="math-quiz-title">Difficulty</h2>
                <div class="difficulty-buttons">
                    <button class="difficulty-btn" onclick="MemoryMatch.startGame('easy')">
                        <span class="difficulty-label">Easy</span>
                        <span class="difficulty-range">4x4 Grid</span>
                    </button>
                    <button class="difficulty-btn" onclick="MemoryMatch.startGame('medium')">
                        <span class="difficulty-label">Medium</span>
                        <span class="difficulty-range">4x6 Grid</span>
                    </button>
                    <button class="difficulty-btn" onclick="MemoryMatch.startGame('hard')">
                        <span class="difficulty-label">Hard</span>
                        <span class="difficulty-range">6x6 Grid</span>
                    </button>
                </div>
            </div>
        `;
        document.getElementById('modal-arcade-content').innerHTML = content;
    },
    
    /**
     * Start game with selected difficulty
     */
    startGame(difficulty) {
        this.difficulty = difficulty;
        
        // Set grid size based on difficulty
        const gridSizes = {
            easy: { rows: 4, cols: 4, pairs: 8 },
            medium: { rows: 4, cols: 6, pairs: 12 },
            hard: { rows: 6, cols: 6, pairs: 18 }
        };
        
        this.gridSize = gridSizes[difficulty];
        this.generateCards();
        this.renderGame();
    },
    
    /**
     * Generate card pairs
     */
    generateCards() {
        const pairs = this.gridSize.pairs;
        const selectedEmojis = this.emojis.slice(0, pairs);
        
        // Create pairs
        const cardPairs = [...selectedEmojis, ...selectedEmojis];
        
        // Shuffle cards
        this.cards = cardPairs
            .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }))
            .sort(() => Math.random() - 0.5);
    },
    
    /**
     * Render the game board
     */
    renderGame() {
        const gridClass = `memory-grid-${this.difficulty}`;
        
        const cardsHtml = this.cards.map(card => `
            <div class="memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}" 
                 data-id="${card.id}" 
                 onclick="MemoryMatch.flipCard(${card.id})">
                <div class="memory-card-inner">
                    <div class="memory-card-front">?</div>
                    <div class="memory-card-back">${card.emoji}</div>
                </div>
            </div>
        `).join('');
        
        const content = `
            <div class="memory-game-container">
                <div class="memory-game-header">
                    <div class="memory-stat">Moves: <span id="moves-count">${this.moves}</span></div>
                    <div class="memory-stat">Time: <span id="time-count">0:00</span></div>
                </div>
                <div class="memory-grid ${gridClass}">
                    ${cardsHtml}
                </div>
            </div>
        `;
        
        document.getElementById('modal-arcade-content').innerHTML = content;
        this.gameActive = true;
        this.startTimer();
    },
    
    /**
     * Flip a card
     */
    flipCard(cardId) {
        if (!this.gameActive) return;
        
        const card = this.cards.find(c => c.id === cardId);
        
        // Prevent flipping if card is already flipped or matched
        if (card.flipped || card.matched || this.flippedCards.length >= 2) return;
        
        // Flip the card
        card.flipped = true;
        this.flippedCards.push(card);
        this.updateCardDisplay(card);
        
        // Check for match when two cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            document.getElementById('moves-count').textContent = this.moves;
            this.checkMatch();
        }
    },
    
    /**
     * Update card display
     */
    updateCardDisplay(card) {
        const cardElement = document.querySelector(`[data-id="${card.id}"]`);
        if (card.flipped) {
            cardElement.classList.add('flipped');
        }
        if (card.matched) {
            cardElement.classList.add('matched');
        }
    },
    
    /**
     * Check if flipped cards match
     */
    checkMatch() {
        this.gameActive = false;
        
        setTimeout(() => {
            const [card1, card2] = this.flippedCards;
            
            if (card1.emoji === card2.emoji) {
                // Match found
                card1.matched = true;
                card2.matched = true;
                this.matchedPairs++;
                
                this.updateCardDisplay(card1);
                this.updateCardDisplay(card2);
                
                // Check for win
                if (this.matchedPairs === this.gridSize.pairs) {
                    setTimeout(() => this.showResults(), 500);
                }
            } else {
                // No match - flip cards back
                card1.flipped = false;
                card2.flipped = false;
                
                const cardElement1 = document.querySelector(`[data-id="${card1.id}"]`);
                const cardElement2 = document.querySelector(`[data-id="${card2.id}"]`);
                cardElement1.classList.remove('flipped');
                cardElement2.classList.remove('flipped');
            }
            
            this.flippedCards = [];
            this.gameActive = true;
        }, 1000);
    },
    
    /**
     * Start timer
     */
    startTimer() {
        this.startTime = Date.now();
        this.updateTimer();
    },
    
    /**
     * Update timer display
     */
    updateTimer() {
        if (!this.gameActive && this.matchedPairs !== this.gridSize.pairs) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        const timeElement = document.getElementById('time-count');
        if (timeElement) {
            timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (this.matchedPairs < this.gridSize.pairs) {
            setTimeout(() => this.updateTimer(), 1000);
        }
    },
    
    /**
     * Show results screen
     */
    showResults() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const content = `
            <div class="math-quiz-container">
                <h2 class="math-quiz-title">Game Complete!</h2>
                <div class="results-display">
                    <div class="memory-results">
                        <div class="memory-result-item">
                            <div class="memory-result-label">Time</div>
                            <div class="memory-result-value">${timeString}</div>
                        </div>
                        <div class="memory-result-item">
                            <div class="memory-result-label">Moves</div>
                            <div class="memory-result-value">${this.moves}</div>
                        </div>
                    </div>
                </div>
                <div class="results-buttons">
                    <button class="try-again-btn" onclick="MemoryMatch.init()">Play Again</button>
                </div>
            </div>
        `;
        document.getElementById('modal-arcade-content').innerHTML = content;
    }
};

// Make MemoryMatch globally accessible
window.MemoryMatch = MemoryMatch;
