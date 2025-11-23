/**
 * Typing Speed Test Game
 * Test typing speed and accuracy with generated sentences
 */

const TypingSpeed = {
    difficulty: null,
    referenceText: '',
    currentPosition: 0,
    errors: 0,
    startTime: null,
    timerInterval: null,
    
    // Word banks for sentence generation
    wordBanks: {
        easy: {
            templates: [
                'The cat runs in the park.',
                'I like to read books every day.',
                'The sun shines brightly today.',
                'We play games after school.',
                'She walks to the store daily.',
                'The dog sits by the tree.',
                'My friend plays with me.',
                'A bird flies in the sky.',
                'The child sleeps at night.',
                'I eat lunch at noon.'
            ]
        },
        medium: {
            templates: [
                'The tall building stands proudly because it was built with care.',
                'When people exercise regularly, they usually feel much better.',
                'Although it was raining heavily, Maria decided to walk anyway.',
                'The teacher explained the lesson clearly to all the students.',
                'My neighbor always waters the garden early in the morning.',
                'The children laughed happily as they played in the yard.',
                'She carefully prepared dinner for her family every evening.'
            ]
        },
        hard: {
            templates: [
                'James completed the challenging project, but his manager didn\'t understand why it took so long.',
                'After working diligently for several hours, the team finally discovered the optimal solution.',
                'The ancient building, which had stood majestically for centuries, collapsed suddenly during the earthquake.',
                'Nevertheless, the committee decided to postpone the important decision until further evidence could be gathered.',
                'The experienced scientist carefully analyzed the experimental results before publishing her groundbreaking findings.',
                'Although the circumstances were extremely difficult, they managed to accomplish their ambitious goals successfully.',
                'The comprehensive report, which included detailed statistics and analysis, was submitted before the deadline.'
            ]
        }
    },
    
    /**
     * Initialize the game
     */
    init() {
        this.difficulty = null;
        this.referenceText = '';
        this.currentPosition = 0;
        this.errors = 0;
        this.startTime = null;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.showDifficultySelection();
    },
    
    /**
     * Show difficulty selection screen
     */
    showDifficultySelection() {
        // Remove the larger modal class for difficulty screen
        const modalContentEl = document.querySelector('.modal-content');
        if (modalContentEl) {
            modalContentEl.classList.remove('typing-speed-modal');
        }
        
        const content = `
            <div class="math-quiz-container">
                <h2 class="math-quiz-title">Difficulty</h2>
                <div class="difficulty-buttons">
                    <button class="difficulty-btn" onclick="TypingSpeed.startGame('easy')">
                        <span class="difficulty-label">Easy</span>
                        <span class="difficulty-range">Simple Sentences</span>
                    </button>
                    <button class="difficulty-btn" onclick="TypingSpeed.startGame('medium')">
                        <span class="difficulty-label">Medium</span>
                        <span class="difficulty-range">Complex Sentences</span>
                    </button>
                    <button class="difficulty-btn" onclick="TypingSpeed.startGame('hard')">
                        <span class="difficulty-label">Hard</span>
                        <span class="difficulty-range">Advanced Text</span>
                    </button>
                </div>
            </div>
        `;
        document.getElementById('modal-arcade-content').innerHTML = content;
    },
    
    /**
     * Generate text based on difficulty
     */
    generateText(difficulty) {
        const templates = this.wordBanks[difficulty].templates;
        const sentenceCount = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 4 : 3;
        
        // Randomly select sentences
        const selectedSentences = [];
        const usedIndices = new Set();
        
        while (selectedSentences.length < sentenceCount && usedIndices.size < templates.length) {
            const randomIndex = Math.floor(Math.random() * templates.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                selectedSentences.push(templates[randomIndex]);
            }
        }
        
        // Join with single space and trim any extra whitespace
        const generatedText = selectedSentences.join(' ').replace(/\s+/g, ' ').trim();
        return generatedText;
    },
    
    /**
     * Start game with selected difficulty
     */
    startGame(difficulty) {
        // Add the larger modal class for game screen
        const modalContentEl = document.querySelector('.modal-content');
        if (modalContentEl) {
            modalContentEl.classList.add('typing-speed-modal');
        }
        
        this.difficulty = difficulty;
        this.referenceText = this.generateText(difficulty);
        this.currentPosition = 0;
        this.errors = 0;
        this.startTime = null;
        this.renderGame();
    },
    
    /**
     * Render the game screen
     */
    renderGame() {
        const content = `
            <div class="typing-game-container">
                <div class="typing-header">
                    <h2 class="typing-title">Typing Speed Test</h2>
                    <div class="typing-timer">Time: <span id="typing-time">0:00</span></div>
                </div>
                <div class="typing-text-container">
                    <div id="typing-text" class="typing-text"></div>
                </div>
                <input type="text" id="typing-input" class="typing-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
            </div>
        `;
        
        document.getElementById('modal-arcade-content').innerHTML = content;
        this.renderText();
        
        // Focus input and add event listener
        const input = document.getElementById('typing-input');
        input.focus();
        input.addEventListener('input', (e) => this.handleInput(e));
        input.addEventListener('keydown', (e) => this.handleKeyDown(e));
    },
    
    /**
     * Render text with character states
     */
    renderText() {
        const textContainer = document.getElementById('typing-text');
        const words = this.referenceText.split(' ');
        let charIndex = 0;
        
        const htmlParts = [];
        
        // Get the current input value to check for errors
        const inputElement = document.getElementById('typing-input');
        const currentInput = inputElement ? inputElement.value : '';
        
        words.forEach((word, wordIdx) => {
            const wordChars = word.split('').map((char) => {
                let className = 'char untyped';
                
                if (charIndex < this.currentPosition) {
                    // Check if this character was typed correctly
                    if (currentInput[charIndex] === char) {
                        className = 'char correct';
                    } else {
                        className = 'char error';
                    }
                }
                
                const html = `<span class="${className}" data-index="${charIndex}">${char}</span>`;
                charIndex++;
                
                // Add cursor after this character if it's the current position
                if (charIndex === this.currentPosition) {
                    return html + '<span class="typing-cursor"></span>';
                }
                
                return html;
            }).join('');
            
            htmlParts.push(`<span class="word">${wordChars}</span>`);
            
            // Add space after word (except last word)
            if (wordIdx < words.length - 1) {
                let spaceClass = 'char untyped';
                
                if (charIndex < this.currentPosition) {
                    // Check if space was typed correctly
                    if (currentInput[charIndex] === ' ') {
                        spaceClass = 'char correct';
                    } else {
                        spaceClass = 'char error';
                    }
                }
                
                const spaceHtml = `<span class="${spaceClass}" data-index="${charIndex}">&nbsp;</span>`;
                htmlParts.push(spaceHtml);
                
                charIndex++;
                
                // Add cursor after space if it's the current position
                if (charIndex === this.currentPosition) {
                    htmlParts.push('<span class="typing-cursor"></span>');
                }
            }
        });
        
        // Add cursor at the very beginning if position is 0 (before any text)
        if (this.currentPosition === 0) {
            textContainer.innerHTML = '<span class="typing-cursor"></span>' + htmlParts.join('');
        } else {
            textContainer.innerHTML = htmlParts.join('');
        }
    },
    
    /**
     * Handle keyboard input
     */
    handleKeyDown(e) {
        // Start timer on first keypress
        if (!this.startTime && e.key.length === 1) {
            this.startTime = Date.now();
            this.startTimer();
        }
    },
    
    /**
     * Handle input changes
     */
    handleInput(e) {
        const input = e.target.value;
        
        // Check for errors on the last character typed
        if (input.length > this.currentPosition) {
            // New character was added
            const lastChar = input[input.length - 1];
            const expectedChar = this.referenceText[input.length - 1];
            if (lastChar !== expectedChar) {
                this.errors++;
            }
        }
        
        // Update position
        this.currentPosition = input.length;
        
        // Re-render the text display
        this.renderText();
        
        // Check if complete - user has typed at least as many characters as reference
        if (input.length >= this.referenceText.length) {
            // User has typed enough characters - finish the game
            setTimeout(() => {
                this.finishGame();
            }, 100);
        }
    },
    
    /**
     * Update text display based on input (deprecated - now using renderText)
     */
    updateTextDisplay(input) {
        // This function is no longer used - renderText() handles everything
        this.renderText();
    },
    
    /**
     * Start timer
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            const timeElement = document.getElementById('typing-time');
            if (timeElement) {
                timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    },
    
    /**
     * Finish game and show results
     */
    finishGame() {
        // Stop timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Calculate results
        const timeElapsed = (Date.now() - this.startTime) / 1000; // seconds
        const minutes = timeElapsed / 60;
        const characterCount = this.referenceText.length;
        const words = characterCount / 5; // Standard: 5 characters = 1 word
        const wpm = Math.round(words / minutes);
        
        // Format time
        const timeMinutes = Math.floor(timeElapsed / 60);
        const timeSeconds = Math.floor(timeElapsed % 60);
        const timeString = timeMinutes > 0 
            ? `${timeMinutes}m ${timeSeconds}s` 
            : `${timeSeconds}s`;
        
        this.showResults(wpm, this.errors, timeString);
    },
    
    /**
     * Show results screen
     */
    showResults(wpm, errors, time) {
        const content = `
            <div class="math-quiz-container">
                <h2 class="math-quiz-title">Results</h2>
                <div class="results-display">
                    <div class="typing-results">
                        <div class="typing-result-item">
                            <div class="typing-result-label">Speed (WPM)</div>
                            <div class="typing-result-value">${wpm}</div>
                        </div>
                        <div class="typing-result-item">
                            <div class="typing-result-label">Errors</div>
                            <div class="typing-result-value">${errors}</div>
                        </div>
                        <div class="typing-result-item">
                            <div class="typing-result-label">Time (Sec)</div>
                            <div class="typing-result-value">${Math.floor(parseFloat(time))}</div>
                        </div>
                    </div>
                </div>
                <div class="results-buttons">
                    <button class="try-again-btn" onclick="TypingSpeed.init()">Try Again</button>
                </div>
            </div>
        `;
        document.getElementById('modal-arcade-content').innerHTML = content;
    }
};

// Make TypingSpeed globally accessible
window.TypingSpeed = TypingSpeed;
