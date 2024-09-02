// Fetch the game data from the external JSON file
async function fetchGameData() {
    const response = await fetch('./owasp-list.json');
    const data = await response.json();
    return data;
}

// Initialize the game
async function initGame() {
    const gameData = await fetchGameData();
    populateAutocomplete(gameData);
    startNewRound(gameData);
}

// Populate the datalist for autocomplete
function populateAutocomplete(gameData) {
    const datalist = document.getElementById('owasp-categories');
    gameData.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        datalist.appendChild(option);
    });
}

// Start a new round of the game
function startNewRound(gameData) {
    const currentCategory = gameData[Math.floor(Math.random() * gameData.length)];
    let revealedHints = 0;
    let score = 1000;
    const previousGuesses = [];

    document.getElementById('hints').innerHTML = '';
    document.getElementById('hints-count').textContent = '0';
    document.getElementById('feedback').textContent = '';
    document.getElementById('guess-input').value = '';
    document.getElementById('reveal-hint').disabled = false;
    document.getElementById('submit-guess').disabled = false;
    document.getElementById('new-game').style.display = 'none';

    updatePreviousGuesses(previousGuesses);

    // Event listeners for buttons
    document.getElementById('reveal-hint').addEventListener('click', () => revealHint(currentCategory, revealedHints, score));
    document.getElementById('submit-guess').addEventListener('click', () => checkGuess(currentCategory, score, previousGuesses));
    document.getElementById('new-game').addEventListener('click', () => startNewRound(gameData));
}

// Reveal the next hint
function revealHint(currentCategory, revealedHints, score) {
    if (revealedHints < 5) {
        const hintElement = document.createElement('p');
        hintElement.textContent = currentCategory.hints[revealedHints];
        document.getElementById('hints').appendChild(hintElement);
        revealedHints++;
        document.getElementById('hints-count').textContent = revealedHints;
        score -= 50;
        updateScore(score);
    }
    if (revealedHints === 5) {
        document.getElementById('reveal-hint').disabled = true;
    }
}

// Check the player's guess
function checkGuess(currentCategory, score, previousGuesses) {
    const guess = document.getElementById('guess-input').value.trim();
    const feedback = document.getElementById('feedback');

    if (guess.toLowerCase() === currentCategory.name.toLowerCase()) {
        // Display the correct guess with a clickable link
        feedback.innerHTML = `Correct! Well done! Learn more about it <a href="${currentCategory.link}" target="_blank">${currentCategory.id}</a>`;
        feedback.className = 'win';
        document.getElementById('submit-guess').disabled = true;
        document.getElementById('reveal-hint').disabled = true;
        document.getElementById('new-game').style.display = 'block';
    } else {
        feedback.textContent = 'Incorrect. Try again or reveal another hint.';
        feedback.className = 'lose';
        score -= 100;
        updateScore(score);
        previousGuesses.push(guess);
        updatePreviousGuesses(previousGuesses);
    }
    document.getElementById('guess-input').value = '';
}

// Update the score display
function updateScore(score) {
    document.getElementById('score').textContent = score;
}

// Update the display of previous guesses
function updatePreviousGuesses(previousGuesses) {
    const guessesElement = document.getElementById('previous-guesses');
    guessesElement.innerHTML = '<h3>Previous Guesses:</h3>';
    previousGuesses.forEach(guess => {
        const guessElement = document.createElement('p');
        guessElement.textContent = guess;
        guessElement.className = 'wrong-guess';
        guessesElement.appendChild(guessElement);
    });
}

// Start the game initialization
initGame();

