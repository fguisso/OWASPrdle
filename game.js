// game.js

let gameData = [];
let currentCategory;
let revealedHints = 0;
let score = 1000;
let previousGuesses = [];

// Load the JSON data asynchronously
async function fetchGameData() {
    try {
        const response = await fetch('https://guisso.dev/OWASPrdle/owasp-list.json');
        gameData = await response.json();
        populateAutocomplete();
        startNewRound();
    } catch (error) {
        console.error('Failed to fetch game data:', error);
    }
}

function populateAutocomplete() {
    const datalist = document.getElementById('owasp-categories');
    gameData.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        datalist.appendChild(option);
    });
}

function startNewRound() {
    currentCategory = gameData[Math.floor(Math.random() * gameData.length)];
    revealedHints = 0;
    document.getElementById('hints').innerHTML = '';
    document.getElementById('hints-count').textContent = '0';
    document.getElementById('feedback').textContent = '';
    document.getElementById('guess-input').value = '';
    document.getElementById('reveal-hint').disabled = false;
    document.getElementById('submit-guess').disabled = false;
    document.getElementById('new-game').style.display = 'none';
    previousGuesses = [];
    updatePreviousGuesses();
}

function revealHint() {
    if (revealedHints < 5) {
        const hintElement = document.createElement('p');
        hintElement.textContent = currentCategory.hints[revealedHints];
        document.getElementById('hints').appendChild(hintElement);
        revealedHints++;
        document.getElementById('hints-count').textContent = revealedHints;
        score -= 50;
        updateScore();
    }
    if (revealedHints === 5) {
        document.getElementById('reveal-hint').disabled = true;
    }
}

function checkGuess() {
    const guess = document.getElementById('guess-input').value.trim();
    const correctAnswer = currentCategory.name;
    const feedback = document.getElementById('feedback');

    if (guess.toLowerCase() === correctAnswer.toLowerCase()) {
        feedback.textContent = 'Correct! Well done!';
        feedback.className = 'win';
        document.getElementById('submit-guess').disabled = true;
        document.getElementById('reveal-hint').disabled = true;
        document.getElementById('new-game').style.display = 'block';
    } else {
        feedback.textContent = 'Incorrect. Try again or reveal another hint.';
        feedback.className = 'lose';
        score -= 100;
        updateScore();
        previousGuesses.push(guess);
        updatePreviousGuesses();
    }
    document.getElementById('guess-input').value = '';
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function updatePreviousGuesses() {
    const guessesElement = document.getElementById('previous-guesses');
    guessesElement.innerHTML = '<h3>Previous Guesses:</h3>';
    previousGuesses.forEach(guess => {
        const guessElement = document.createElement('p');
        guessElement.textContent = guess;
        guessElement.className = 'wrong-guess';
        guessesElement.appendChild(guessElement);
    });
}

// Event listeners
document.getElementById('reveal-hint').addEventListener('click', revealHint);
document.getElementById('submit-guess').addEventListener('click', checkGuess);
document.getElementById('new-game').addEventListener('click', startNewRound);

// Initialize the game after loading the data
fetchGameData();

