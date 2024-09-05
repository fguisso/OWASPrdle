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
    const inp = document.getElementById("guess-input");
    var currentFocus;
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        for (i = 0; i < gameData.length; i++) {
            if (gameData[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase() || gameData[i].id.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                b = document.createElement("DIV");
                b.innerHTML = "<span class='item-id'>" + gameData[i].id + "</span>";
                b.innerHTML += "<span class='item-name'>" + gameData[i].name + "</span>";
                b.innerHTML += "<input type='hidden' value='" + gameData[i].name + "'>";
                b.addEventListener("click", function(e) {
                    inp.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) {
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
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
    revealHint();
}

function revealHint() {
    if (revealedHints < 5) {
        const hintElement = document.createElement('p');
        hintElement.textContent = currentCategory.hints[revealedHints];
        document.getElementById('hints').appendChild(hintElement);
        if (revealedHints != 0) score -= 50;
        revealedHints++;
        document.getElementById('hints-count').textContent = revealedHints;
        updateScore();
    }
    if (revealedHints === 5) {
        document.getElementById('reveal-hint').disabled = true;
    }
}

function checkGuess() {
    const guessInput = document.getElementById('guess-input');
    const guess = guessInput.value.trim();
    const feedback = document.getElementById('feedback');

    if (isValidGuess(guess)) {
        const correctAnswer = currentCategory.name;

        if (guess.toLowerCase() === correctAnswer.toLowerCase()) {
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
            updateScore();
            previousGuesses.push(guess);
            updatePreviousGuesses();
        }
        guessInput.value = '';
        guessInput.style.borderColor = ''; // Reset border color
    } else {
        feedback.textContent = 'Invalid guess. Please select an option from the list.';
        feedback.className = 'lose';
        guessInput.style.borderColor = 'red';
    }
}
function isValidGuess(guess) {
    return gameData.some(category => category.name.toLowerCase() === guess.toLowerCase());
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

const infoIcon = document.querySelector('.info-icon');
const infoCard = document.querySelector('.info-card');

infoIcon.addEventListener('mouseenter', () => {
    infoCard.style.display = 'block';
});

infoIcon.addEventListener('mouseleave', () => {
    infoCard.style.display = 'none';
});

// Event listeners
document.getElementById('reveal-hint').addEventListener('click', revealHint);
document.getElementById('submit-guess').addEventListener('click', checkGuess);
document.getElementById('new-game').addEventListener('click', startNewRound);

// Initialize the game after loading the data
fetchGameData();

