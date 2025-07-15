let diamonds = 100;
const diamondsEl = document.getElementById('diamonds');
const resultEl = document.getElementById('result');

document.getElementById('spin').addEventListener('click', () => {
    if (diamonds <= 0) {
        resultEl.textContent = "You're out of diamonds! Reset to play again.";
        return;
    }

    const outcome = Math.random();
    if (outcome < 0.5) {
        diamonds -= 10;
        resultEl.textContent = "💔 You lost 10 diamonds!";
    } else {
        diamonds += 20;
        resultEl.textContent = "💎 You won 20 diamonds!";
    }
    diamondsEl.textContent = diamonds;
});

document.getElementById('reset').addEventListener('click', () => {
    diamonds = 100;
    diamondsEl.textContent = diamonds;
    resultEl.textContent = "";
});
