/**
 * Math Quiz Game
 * Simple arithmetic quiz with operator and difficulty selection
 */

const MathQuiz = {
    currentQuestion: 0,
    totalQuestions: 10,
    score: 0,
    questions: [],
    operator: null,
    difficulty: null,
    
    /**
     * Initialize the game with operator and difficulty selection
     */
    init() {
        this.currentQuestion = 0;
        this.score = 0;
        this.questions = [];
        this.operator = null;
        this.difficulty = null;
        this.showOperatorSelection();
    },
    
    /**
     * Show operator selection screen
     */
    showOperatorSelection() {
        const content = `
            <div class="math-quiz-container">
                <h2 class="math-quiz-title">Math Quiz</h2>
                <div class="operator-buttons">
                    <button class="operator-btn" onclick="MathQuiz.selectOperator('+')">
                        <span class="operator-symbol">+</span>
                        <span class="operator-label">Addition</span>
                    </button>
                    <button class="operator-btn" onclick="MathQuiz.selectOperator('-')">
                        <span class="operator-symbol">−</span>
                        <span class="operator-label">Subtraction</span>
                    </button>
                    <button class="operator-btn" onclick="MathQuiz.selectOperator('*')">
                        <span class="operator-symbol">×</span>
                        <span class="operator-label">Multiplication</span>
                    </button>
                    <button class="operator-btn" onclick="MathQuiz.selectOperator('/')">
                        <span class="operator-symbol">÷</span>
                        <span class="operator-label">Division</span>
                    </button>
                </div>
            </div>
        `;
        document.getElementById('modal-arcade-content').innerHTML = content;
    },
    
    /**
     * Select operator and show difficulty selection
     */
    selectOperator(op) {
        this.operator = op;
        this.showDifficultySelection();
    },
    
    /**
     * Show difficulty selection screen
     */
    showDifficultySelection() {
        const operatorNames = {'+': 'Addition', '-': 'Subtraction', '*': 'Multiplication', '/': 'Division'};
        const content = `
            <div class="math-quiz-container">
                <h2 class="math-quiz-title">Difficulty</h2>
                <div class="difficulty-buttons">
                    <button class="difficulty-btn" onclick="MathQuiz.startQuiz('easy')">
                        <span class="difficulty-label">Easy</span>
                        <span class="difficulty-range">1-10</span>
                    </button>
                    <button class="difficulty-btn" onclick="MathQuiz.startQuiz('medium')">
                        <span class="difficulty-label">Medium</span>
                        <span class="difficulty-range">10-50</span>
                    </button>
                    <button class="difficulty-btn" onclick="MathQuiz.startQuiz('hard')">
                        <span class="difficulty-label">Hard</span>
                        <span class="difficulty-range">50-100</span>
                    </button>
                </div>
                <button class="back-btn" onclick="MathQuiz.showOperatorSelection()">Back</button>
            </div>
        `;
        document.getElementById('modal-arcade-content').innerHTML = content;
    },
    
    /**
     * Start the quiz with selected difficulty
     */
    startQuiz(difficulty) {
        this.difficulty = difficulty;
        this.generateQuestions();
        this.showQuestion();
    },
    
    /**
     * Generate all questions for the quiz
     */
    generateQuestions() {
        const ranges = {
            easy: {min: 1, max: 10},
            medium: {min: 10, max: 50},
            hard: {min: 50, max: 100}
        };
        
        const range = ranges[this.difficulty];
        
        for (let i = 0; i < this.totalQuestions; i++) {
            let num1 = this.randomInt(range.min, range.max);
            let num2 = this.randomInt(range.min, range.max);
            let answer;
            
            // Special handling for subtraction to ensure non-negative results
            if (this.operator === '-') {
                // Ensure num1 >= num2 for positive results
                if (num1 < num2) {
                    [num1, num2] = [num2, num1]; // Swap if needed
                }
                answer = this.calculate(num1, num2);
            }
            // Special handling for division to ensure whole numbers
            else if (this.operator === '/') {
                answer = this.randomInt(range.min, Math.floor(range.max / 2));
                num1 = answer * num2; // Ensure clean division
            } else {
                answer = this.calculate(num1, num2);
            }
            
            this.questions.push({num1, num2, answer});
        }
    },
    
    /**
     * Calculate the answer based on operator
     */
    calculate(num1, num2) {
        switch(this.operator) {
            case '+': return num1 + num2;
            case '-': return num1 - num2;
            case '*': return num1 * num2;
            case '/': return num1 / num2;
            default: return 0;
        }
    },
    
    /**
     * Generate random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Display current question
     */
    showQuestion() {
        const question = this.questions[this.currentQuestion];
        const operatorDisplay = {'+': '+', '-': '−', '*': '×', '/': '÷'}[this.operator];
        
        const content = `
            <div class="math-quiz-container">
                <div class="question-progress">Question ${this.currentQuestion + 1}/${this.totalQuestions}</div>
                <div class="question-display">
                    <div class="math-problem-vertical">
                        <div class="math-number">${question.num1}</div>
                        <div class="math-operator">${operatorDisplay} ${question.num2}</div>
                        <div class="math-answer-line">
                            <input type="number" id="answer-input" class="answer-input-inline" placeholder="" autofocus>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modal-arcade-content').innerHTML = content;
        
        // Focus on input and add Enter key listener
        setTimeout(() => {
            const input = document.getElementById('answer-input');
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    MathQuiz.submitAnswer();
                }
            });
        }, 100);
    },
    
    /**
     * Submit and check the answer
     */
    submitAnswer() {
        const input = document.getElementById('answer-input');
        const userAnswer = parseFloat(input.value);
        const correctAnswer = this.questions[this.currentQuestion].answer;
        
        // Check if answer is correct
        if (Math.abs(userAnswer - correctAnswer) < 0.01) {
            this.score++;
        }
        
        // Move to next question or show results
        this.currentQuestion++;
        if (this.currentQuestion < this.totalQuestions) {
            this.showQuestion();
        } else {
            this.showResults();
        }
    },
    
    /**
     * Show final results
     */
    showResults() {
        const content = `
            <div class="math-quiz-container">
                <h2 class="math-quiz-title">Quiz Complete!</h2>
                <div class="results-display">
                    <div class="score-number">${this.score} / ${this.totalQuestions}</div>
                </div>
                <div class="results-buttons">
                    <button class="try-again-btn" onclick="MathQuiz.init()">Try Again</button>
                </div>
            </div>
        `;
        document.getElementById('modal-arcade-content').innerHTML = content;
    }
};

// Make MathQuiz globally accessible
window.MathQuiz = MathQuiz;
