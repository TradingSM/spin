let diamonds = 100;
let currentRotation = 0;
let chosenColor = null;
const diamondsEl = document.getElementById('diamonds');
const resultEl = document.getElementById('result');
const stakeInput = document.getElementById('stake');
const wheel = document.getElementById('wheel');
let spinning = false;

document.getElementById('choose-red').addEventListener('click', () => {
    chosenColor = 'red';
    resultEl.textContent = 'You selected: Red';
});

document.getElementById('choose-green').addEventListener('click', () => {
    chosenColor = 'green';
    resultEl.textContent = 'You selected: Green';
});

document.getElementById('spin').addEventListener('click', () => {
    const stake = Math.max(1, parseInt(stakeInput.value));

    if (!chosenColor) {
        resultEl.textContent = "Please select Red or Green!";
        return;
    }
    if (spinning || diamonds <= 0 || stake > diamonds) {
        resultEl.textContent = stake > diamonds ? "❗ Cannot bet more than your diamonds." : "";
        return;
    }

    spinning = true;
    diamonds -= stake;
    diamondsEl.textContent = diamonds;

    const extraSpins = 5;
    const randomDegrees = Math.floor(Math.random() * 360);
    currentRotation += 360 * extraSpins + randomDegrees;
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        const normalizedAngle = currentRotation % 360;
        let resultColor = (normalizedAngle >= 0 && normalizedAngle < 90) || (normalizedAngle >= 180 && normalizedAngle < 270) ? 'green' : 'red';

        let result;
        if (chosenColor === resultColor) {
            const winnings = stake * 2;
            diamonds += winnings;
            result = `✅ Correct! ${chosenColor.toUpperCase()} wins. You get ${winnings} diamonds.`;
        } else {
            result = `❌ Wrong! ${resultColor.toUpperCase()} wins. You lost ${stake} diamonds.`;
        }

        diamondsEl.textContent = diamonds;
        resultEl.textContent = result;
        spinning = false;
    }, 4000);
});

document.getElementById('reset').addEventListener('click', () => {
    diamonds = 100;
    currentRotation = 0;
    diamondsEl.textContent = diamonds;
    resultEl.textContent = "";
    wheel.style.transform = 'rotate(0deg)';
    chosenColor = null;
});
