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
    
    // Anagram-free word bank (doubled word count, no words with common anagrams)
    wordBank: {
        easy: [
            'CAT', 'DOG', 'BOOK', 'TREE', 'FISH', 'BIRD', 'MOON', 'SNOW',
            'ROAD', 'PARK', 'HAND', 'FOOT', 'HEAD', 'FACE', 'DOOR', 'WIND', 'FIRE', 'LAKE',
            'FROG', 'SHIP', 'BIKE', 'BELL', 'BALL', 'GAME', 'CUBE', 'SONG',
            'KING', 'QUEEN', 'GOLD', 'RING', 'BEAN', 'CORN', 'BREAD', 'MILK', 'CAKE', 'SALT',
            'CLOUD', 'LIGHT', 'SAND', 'ROCK', 'HILL', 'WAVE', 'LEAF', 'SEED', 'FARM',
            'CHAIR', 'TABLE', 'MOUSE', 'HORSE', 'SPOON', 'KNIFE', 'PLATE', 'GLASS',
            'HOUSE', 'PHONE', 'WATCH', 'MONEY', 'CLOCK', 'BRUSH', 'TOWEL', 'PILLOW',
            'FRUIT', 'PLANT', 'STONE', 'METAL', 'PAPER', 'VOICE', 'SMILE', 'DREAM',
            'MAGIC', 'HAPPY', 'BRAVE', 'SMART', 'QUIET', 'FAST', 'SLOW', 'WARM',
            'COLD', 'SWEET', 'SOUR', 'ROUND', 'SQUARE', 'BRIGHT', 'DIRTY', 'CLEAN',
            'ROBOT', 'SPACE', 'WORLD', 'EARTH', 'WATER', 'JUICE', 'SUGAR', 'HONEY',
            'TIGER', 'ZEBRA', 'PANDA', 'WHALE', 'SHARK', 'SNAKE', 'LIZARD', 'SPIDER',
            'RIVER', 'SUNNY', 'RAINY', 'WINDY', 'FOGGY', 'STORM', 'BLOOM', 'GRASS',
            'BENCH', 'FENCE', 'SWING', 'SLIDE', 'CLIMB', 'JUMP', 'DANCE', 'MARCH',
            'LAUGH', 'SHOUT', 'WHISPER', 'SPEAK', 'THINK', 'POINT', 'GRASP', 'TOUCH',
            'MELON', 'LEMON', 'PEACH', 'PLUM', 'GRAPE', 'BERRY', 'MANGO', 'CHERRY',
            'PIZZA', 'PASTA', 'BACON', 'STEAK', 'SALAD', 'SOUP', 'BROTH', 'GRAVY',
            'LAMP', 'COUCH', 'SHELF', 'FRAME', 'QUILT', 'SHEET', 'BLANKET', 'DRAPES',
            'PENNY', 'DIME', 'NICKEL', 'DOLLAR', 'PIGGY', 'VAULT', 'CHEST', 'PURSE',
            'TRAIN', 'PLANE', 'TRUCK', 'WAGON', 'YACHT', 'CANOE', 'FERRY', 'LINER',
            'CROWN', 'JEWEL', 'MEDAL', 'BADGE', 'PRIZE', 'AWARD', 'TROPHY', 'BANNER',
            'SWORD', 'SHIELD', 'ARMOR', 'HELMET', 'SPEAR', 'ARROW', 'TORCH', 'LANTERN',
            'DUSTY', 'SHINY', 'FUZZY', 'ROUGH', 'SMOOTH', 'BUMPY', 'CRISP', 'FRESH',
            'YOUNG', 'ELDER', 'GIANT', 'TINY', 'GRAND', 'PLAIN', 'FANCY', 'BASIC'
        ],
        medium: [
            'PLANET', 'GARDEN', 'BRIDGE', 'CASTLE', 'MOUNTAIN', 'OCEAN', 'FOREST', 'RIVER', 'ISLAND', 'DESERT',
            'FRIEND', 'FAMILY', 'SCHOOL', 'TEACHER', 'STUDENT', 'WINDOW', 'KITCHEN', 'BEDROOM', 'PICTURE', 'FLOWER',
            'GUITAR', 'PIANO', 'TRUMPET', 'VIOLIN', 'DANCING', 'READING', 'WRITING', 'COOKING',
            'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'BUTTERFLY', 'RAINBOW', 'THUNDER', 'LIGHTNING', 'WEATHER',
            'SPRING', 'SUMMER', 'AUTUMN', 'MONDAY', 'TUESDAY', 'SUNDAY', 'MORNING', 'EVENING', 'TONIGHT',
            'JOURNEY', 'FREEDOM', 'PROBLEM', 'ANSWER', 'QUESTION', 'HISTORY', 'SCIENCE', 'NATURE',
            'HOLIDAY', 'VILLAGE', 'COUNTRY', 'SOLDIER', 'CAPTAIN', 'DRAGON', 'WIZARD',
            'CRYSTAL', 'DIAMOND', 'EMERALD', 'TOPAZ', 'SILVER', 'BRONZE', 'COPPER', 'MARBLE',
            'BLANKET', 'CURTAIN', 'CABINET', 'CUSHION', 'BUCKET', 'BASKET', 'BOTTLE',
            'BATTERY', 'MACHINE', 'ENGINE', 'FACTORY', 'WORKSHOP', 'BUILDING', 'STADIUM', 'AIRPORT',
            'GROCERY', 'BAKERY', 'LIBRARY', 'GALLERY', 'THEATER', 'CONCERT', 'FESTIVAL', 'PARADE',
            'CLIMATE', 'TORNADO', 'HURRICANE', 'VOLCANO', 'EARTHQUAKE', 'AVALANCHE', 'TSUNAMI',
            'BICYCLE', 'SCOOTER', 'MOTORCYCLE', 'AIRPLANE', 'HELICOPTER',
            'COMPASS', 'LANTERN', 'BACKPACK', 'COMPASS', 'ANCHOR', 'RUDDER', 'PADDLE', 'OARLOCK',
            'BLANKET', 'HAMMOCK', 'SHELTER', 'CAMPFIRE', 'BONFIRE', 'FIREWORK', 'SPARKLER', 'CANDLE',
            'PAINTER', 'SCULPTOR', 'MUSICIAN', 'SINGER', 'DANCER', 'JUGGLER', 'ACROBAT', 'CLOWN',
            'HOSPITAL', 'CLINIC', 'DOCTOR', 'DENTIST', 'SURGEON', 'PHARMACY', 'BANDAGE', 'MEDICINE',
            'MOUNTAIN', 'HILLSIDE', 'VALLEY', 'CANYON', 'PLATEAU', 'MEADOW', 'PRAIRIE', 'SAVANNA',
            'SANDWICH', 'HOTDOG', 'BURGER', 'NOODLE', 'DUMPLING', 'TACO', 'BURRITO', 'WAFFLE',
            'POCKET', 'ZIPPER', 'BUTTON', 'BUCKLE', 'VELCRO', 'RIBBON', 'THREAD', 'FABRIC',
            'CHAPTER', 'NOVEL', 'POETRY', 'JOURNAL', 'DIARY', 'NOTEBOOK', 'ALBUM', 'SCRAPBOOK',
            'HELMET', 'GOGGLES', 'GLOVES', 'MITTENS', 'SCARF', 'JACKET', 'SWEATER', 'CARDIGAN',
            'MARKER', 'CRAYON', 'PENCIL', 'ERASER', 'RULER', 'STAPLER', 'BINDER', 'FOLDER',
            'PRINTER', 'SCANNER', 'KEYBOARD', 'MONITOR', 'SPEAKER', 'WEBCAM', 'ROUTER', 'MODEM',
            'PUPPET', 'DOLLHOUSE', 'BLOCKS', 'PUZZLE', 'MARBLE', 'DOMINO', 'CHECKERS', 'CHESS',
            'BANDANA', 'BEANIE', 'FEDORA', 'BERET', 'VISOR', 'BONNET', 'TURBAN', 'TRILBY'
        ],
        hard: [
            'BEAUTIFUL', 'WONDERFUL', 'IMPORTANT', 'DIFFERENT', 'ADVENTURE', 'EDUCATION', 'KNOWLEDGE', 'STRENGTH', 'HAPPINESS',
            'CHOCOLATE', 'HAMBURGER', 'SPAGHETTI', 'SANDWICH', 'BREAKFAST', 'VEGETABLE', 'STRAWBERRY', 'PINEAPPLE', 'WATERMELON', 'BLUEBERRY',
            'COMPUTER', 'TELEPHONE', 'TELEVISION', 'REFRIGERATOR', 'MICROWAVE', 'YESTERDAY', 'TOMORROW', 'BIRTHDAY', 'CELEBRATE', 'UNDERSTAND',
            'FANTASTIC', 'EXCELLENT', 'BRILLIANT', 'CHAMPION', 'TREASURE', 'MYSTERY', 'DICTIONARY', 'LIBRARY', 'UNIVERSE',
            'CROCODILE', 'KANGAROO', 'PEACOCK', 'SYMPHONY', 'ORCHESTRA', 'MAGAZINE', 'NEWSPAPER', 'HOLIDAY',
            'SKYSCRAPER', 'PLAYGROUND', 'BASKETBALL', 'VOLLEYBALL', 'BASEBALL', 'FOOTBALL', 'SWIMMING', 'GYMNASTICS',
            'SAXOPHONE', 'TROMBONE', 'CLARINET', 'HARMONICA', 'ACCORDION', 'XYLOPHONE', 'TAMBOURINE', 'TRIANGLE',
            'MATHEMATICS', 'GEOGRAPHY', 'CHEMISTRY', 'PHYSICS', 'BIOLOGY', 'ASTRONOMY', 'ARCHAEOLOGY', 'PSYCHOLOGY',
            'ARCHITECTURE', 'ENGINEERING', 'TECHNOLOGY', 'PHILOSOPHY', 'LITERATURE', 'PHOTOGRAPHY', 'SCULPTURE', 'PAINTING',
            'GOVERNMENT', 'PRESIDENT', 'PARLIAMENT', 'DEMOCRACY', 'COMMUNITY', 'NEIGHBORHOOD', 'CITIZENSHIP', 'VOLUNTEER',
            'RESTAURANT', 'CAFETERIA', 'SUPERMARKET', 'DEPARTMENT', 'PHARMACY', 'HOSPITAL', 'UNIVERSITY', 'COLLEGE',
            'THUNDERSTORM', 'SNOWFLAKE', 'RAINDROP', 'SUNSHINE', 'MOONLIGHT', 'STARLIGHT', 'TWILIGHT', 'MIDNIGHT',
            'EXPEDITION', 'EXPLORATION', 'DISCOVERY', 'INVENTION', 'CREATION', 'INSPIRATION', 'IMAGINATION',
            'QUARTERBACK', 'GOALKEEPER', 'OUTFIELDER', 'MIDFIELDER', 'GOALKEEPER', 'PITCHER', 'CATCHER', 'SHORTSTOP',
            'MOTORCYCLE', 'SKATEBOARD', 'ROLLERBLADES', 'SCOOTER', 'HOVERBOARD', 'SEGWAY', 'UNICYCLE', 'TRICYCLE',
            'CHANDELIER', 'FIREPLACE', 'STAIRCASE', 'BALCONY', 'ELEVATOR', 'ESCALATOR', 'DOORWAY', 'HALLWAY',
            'SUITCASE', 'BACKPACK', 'BRIEFCASE', 'HANDBAG', 'LUGGAGE', 'DUFFEL', 'MESSENGER', 'TOTE',
            'PEPPERONI', 'MUSHROOM', 'ANCHOVY', 'JALAPENO', 'PINEAPPLE', 'ARTICHOKE', 'SPINACH', 'BROCCOLI',
            'BIOGRAPHY', 'AUTOBIOGRAPHY', 'ENCYCLOPEDIA', 'ANTHOLOGY', 'MANUSCRIPT', 'TEXTBOOK', 'HANDBOOK', 'GUIDEBOOK',
            'INSTRUMENT', 'PERCUSSION', 'WOODWIND', 'STRINGED', 'KEYBOARD', 'ELECTRONIC', 'ACOUSTIC', 'SYMPHONY',
            'CONSTELLATION', 'HEMISPHERE', 'EQUATOR', 'TROPICS', 'LATITUDE', 'LONGITUDE', 'MERIDIAN', 'TIMEZONE',
            'SPECTACULAR', 'MAGNIFICENT', 'EXTRAORDINARY', 'REMARKABLE', 'INCREDIBLE', 'PHENOMENAL', 'OUTSTANDING', 'MARVELOUS',
            'TRANSPORTATION', 'COMMUNICATION', 'ORGANIZATION', 'INFORMATION', 'CELEBRATION', 'DECORATION', 'PRESENTATION', 'REGISTRATION',
            'RESPONSIBILITY', 'OPPORTUNITY', 'PERSONALITY', 'CREATIVITY', 'PRODUCTIVITY', 'FLEXIBILITY', 'SENSITIVITY', 'RELIABILITY',
            'REFRIGERATOR', 'DISHWASHER', 'TOASTER', 'BLENDER', 'COFFEEMAKER', 'JUICER', 'GRIDDLE', 'PROCESSOR',
            'QUARTERBACK', 'LINEBACKER', 'DEFENDER', 'STRIKER', 'FORWARD', 'MIDFIELDER', 'SWEEPER', 'WINGBACK'
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
                    <div id="correct-answer-display" class="correct-answer-display"></div>
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
        const answerDisplay = document.getElementById('correct-answer-display');
        const currentWord = this.words[this.currentWordIndex];
        
        // Add feedback class
        if (isCorrect) {
            container.classList.add('correct-feedback');
        } else {
            container.classList.add('wrong-feedback');
            // Show correct answer
            if (answerDisplay) {
                answerDisplay.textContent = currentWord.original;
                answerDisplay.style.display = 'block';
            }
        }
        
        // Disable input
        input.disabled = true;
        
        // Move to next word after delay (1.5s for wrong, 0.8s for correct)
        const delay = isCorrect ? 800 : 1500;
        setTimeout(() => {
            this.currentWordIndex++;
            
            if (this.currentWordIndex < this.words.length) {
                this.showWord();
            } else {
                this.showResults();
            }
        }, delay);
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
