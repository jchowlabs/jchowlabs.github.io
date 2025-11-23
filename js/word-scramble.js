/**
 * Word Scramble Game
 * Unscramble words to test vocabulary and pattern recognition
 */

const WordScramble = {
    difficulty: null,
    words: [],
    currentWordIndex: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    startTime: null,
    
    // Comprehensive word bank
    wordBank: {
        easy: [
            'CAT', 'DOG', 'BOOK', 'TREE', 'STAR', 'FISH', 'BIRD', 'MOON', 'RAIN', 'SNOW',
            'ROAD', 'PARK', 'HAND', 'FOOT', 'HEAD', 'FACE', 'DOOR', 'WIND', 'FIRE', 'LAKE',
            'BEAR', 'DEER', 'FROG', 'SHIP', 'BIKE', 'BELL', 'BALL', 'GAME', 'CUBE', 'SONG',
            'KING', 'QUEEN', 'GOLD', 'RING', 'BEAN', 'CORN', 'BREAD', 'MILK', 'CAKE', 'SALT',
            'RAIN', 'CLOUD', 'LIGHT', 'SAND', 'ROCK', 'HILL', 'WAVE', 'LEAF', 'SEED', 'FARM'
        ],
        medium: [
            'PLANET', 'GARDEN', 'BRIDGE', 'CASTLE', 'MOUNTAIN', 'OCEAN', 'FOREST', 'RIVER', 'ISLAND', 'DESERT',
            'FRIEND', 'FAMILY', 'SCHOOL', 'TEACHER', 'STUDENT', 'WINDOW', 'KITCHEN', 'BEDROOM', 'PICTURE', 'FLOWER',
            'GUITAR', 'PIANO', 'TRUMPET', 'VIOLIN', 'SINGING', 'DANCING', 'READING', 'WRITING', 'PAINTING', 'COOKING',
            'ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'BUTTERFLY', 'RAINBOW', 'THUNDER', 'LIGHTNING', 'SEASON', 'WEATHER',
            'WINTER', 'SPRING', 'SUMMER', 'AUTUMN', 'MONDAY', 'TUESDAY', 'SUNDAY', 'MORNING', 'EVENING', 'TONIGHT'
        ],
        hard: [
            'BEAUTIFUL', 'WONDERFUL', 'IMPORTANT', 'DIFFERENT', 'INTERESTING', 'ADVENTURE', 'EDUCATION', 'KNOWLEDGE', 'STRENGTH', 'HAPPINESS',
            'CHOCOLATE', 'HAMBURGER', 'SPAGHETTI', 'SANDWICH', 'BREAKFAST', 'VEGETABLE', 'STRAWBERRY', 'PINEAPPLE', 'WATERMELON', 'BLUEBERRY',
            'COMPUTER', 'TELEPHONE', 'TELEVISION', 'REFRIGERATOR', 'MICROWAVE', 'YESTERDAY', 'TOMORROW', 'BIRTHDAY', 'CELEBRATE', 'UNDERSTAND',
            'FANTASTIC', 'EXCELLENT', 'BRILLIANT', 'CHAMPION', 'TREASURE', 'MYSTERY', 'DICTIONARY', 'LIBRARY', 'UNIVERSE', 'BUTTERFLY',
            'ELEPHANT', 'CROCODILE', 'KANGAROO', 'PARROT', 'PEACOCK', 'SYMPHONY', 'ORCHESTRA', 'MAGAZINE', 'NEWSPAPER', 'HOLIDAY'
        ]
    },
    
    /**
     * Initialize the game
     */
    init() {
        this.difficulty = null;
        this.words = [];
        this.currentWordIndex = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.startTime = null;
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
                    <button class="difficulty-btn" onclick="WordScramble.startGame('easy')">
                        <span class="difficulty-label">Easy</span>
                        <span class="difficulty-range">3-5 Letters</span>
                    </button>
                    <button class="difficulty-btn" onclick="WordScramble.startGame('medium')">
                        <span class="difficulty-label">Medium</span>
                        <span class="difficulty-range">5-8 Letters</span>
                    </button>
                    <button class="difficulty-btn" onclick="WordScramble.startGame('hard')">
                        <span class="difficulty-label">Hard</span>
                        <span class="difficulty-range">8+ Letters</span>
                    </button>
                </div>
            </div>
        `;
        document.getElementById('modal-arcade-content').innerHTML = content;
    },
    
    /**
     * Scramble a word
     */
    scrambleWord(word) {
        const letters = word.split('');
        let scrambled;
        let attempts = 0;
        
        // Keep scrambling until result is different from original
        do {
            scrambled = letters
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
                .join('');
            attempts++;
        } while (scrambled === word && attempts < 50);
        
        return scrambled;
    },
    
    /**
     * Start game with selected difficulty
     */
    startGame(difficulty) {
        this.difficulty = difficulty;
        this.startTime = Date.now();
        
        // Select 10 random words from the difficulty level
        const wordPool = [...this.wordBank[difficulty]];
        this.words = [];
        
        for (let i = 0; i < 10; i++) {
            const randomIndex = Math.floor(Math.random() * wordPool.length);
            const word = wordPool.splice(randomIndex, 1)[0];
            this.words.push({
                original: word,
                scrambled: this.scrambleWord(word)
            });
        }
        
        this.currentWordIndex = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.showWord();
    },
    
    /**
     * Show current word
     */
    showWord() {
        const currentWord = this.words[this.currentWordIndex];
        const progress = this.currentWordIndex + 1;
        
        const content = `
            <div class="word-scramble-container">
                <div class="word-scramble-header">
                    <h2 class="word-scramble-title">Word Scramble</h2>
                    <div class="word-scramble-progress">Word ${progress}/10</div>
                </div>
                
                <div class="scrambled-word">${currentWord.scrambled}</div>
                
                <div class="word-input-container">
                    <input type="text" 
                           id="word-input" 
                           class="word-input" 
                           placeholder=""
                           autocomplete="off"
                           autocorrect="off"
                           autocapitalize="characters"
                           spellcheck="false">
                </div>
            </div>
        `;
        
        document.getElementById('modal-arcade-content').innerHTML = content;
        
        // Focus input and add event listener
        const input = document.getElementById('word-input');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
    },
    
    /**
     * Check the user's answer
     */
    checkAnswer() {
        const input = document.getElementById('word-input');
        const userAnswer = input.value.trim().toUpperCase();
        const currentWord = this.words[this.currentWordIndex];
        
        if (!userAnswer) return;
        
        if (userAnswer === currentWord.original) {
            // Correct answer
            this.correctAnswers++;
            this.showFeedback(true);
        } else {
            // Wrong answer
            this.wrongAnswers++;
            this.showFeedback(false);
        }
    },
    
    /**
     * Show feedback and move to next word
     */
    showFeedback(isCorrect) {
        const input = document.getElementById('word-input');
        const container = document.querySelector('.word-input-container');
        
        // Add feedback class
        if (isCorrect) {
            container.classList.add('correct-feedback');
        } else {
            container.classList.add('wrong-feedback');
        }
        
        // Disable input
        input.disabled = true;
        
        // Move to next word after delay
        setTimeout(() => {
            this.currentWordIndex++;
            
            if (this.currentWordIndex < this.words.length) {
                this.showWord();
            } else {
                this.showResults();
            }
        }, 800);
    },
    
    /**
     * Show results screen
     */
    showResults() {
        const timeElapsed = (Date.now() - this.startTime) / 1000;
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = Math.floor(timeElapsed % 60);
        const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
        
        const totalWords = this.words.length;
        const percentage = Math.round((this.correctAnswers / totalWords) * 100);
        
        const content = `
            <div class="math-quiz-container">
                <h2 class="math-quiz-title">Results</h2>
                <div class="results-display">
                    <div class="word-scramble-score">
                        <div class="score-main">${this.correctAnswers}/${totalWords}</div>
                    </div>
                </div>
                <div class="results-buttons">
                    <button class="try-again-btn" onclick="WordScramble.init()">Try Again</button>
                </div>
            </div>
        `;
        
        document.getElementById('modal-arcade-content').innerHTML = content;
    }
};

// Make WordScramble globally accessible
window.WordScramble = WordScramble;
