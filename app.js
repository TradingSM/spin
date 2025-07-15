let diamonds = 100;
let currentRotation = 0;
let chosenColor = 'red';
const diamondsEl = document.getElementById('diamonds');
const resultEl = document.getElementById('result');
const stakeInput = document.getElementById('stake');
const wheel = document.getElementById('wheel');
const spinButton = document.getElementById('spin');
let spinning = false;

const colorChoices = document.querySelectorAll('.color-choice');
colorChoices.forEach(choice => {
    choice.addEventListener('click', () => {
        colorChoices.forEach(c => c.classList.remove('active'));
        choice.classList.add('active');
        chosenColor = choice.dataset.color;
        resultEl.textContent = `You selected: ${chosenColor.toUpperCase()}`;
        resultEl.className = "";
    });
});

spinButton.addEventListener('click', () => {
    if (spinning) return;

    const stake = parseInt(stakeInput.value);
    if (isNaN(stake) || stake <= 0) {
        resultEl.textContent = "❗ Invalid stake amount.";
        resultEl.className = "lose";
        return;
    }
    if (stake > diamonds) {
        resultEl.textContent = "❗ Cannot bet more than your diamonds.";
        resultEl.className = "lose";
        return;
    }

    spinning = true;
    spinButton.disabled = true;
    diamonds -= stake;
    diamondsEl.textContent = diamonds;

    const extraSpins = 5;
    const randomDegrees = Math.floor(Math.random() * 360);
    currentRotation += 360 * extraSpins + randomDegrees;
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        const normalizedAngle = currentRotation % 360;
        let resultColor;

        if (
            (normalizedAngle >= 0 && normalizedAngle < 45) ||
            (normalizedAngle >= 90 && normalizedAngle < 135) ||
            (normalizedAngle >= 180 && normalizedAngle < 225) ||
            (normalizedAngle >= 270 && normalizedAngle < 315)
        ) {
            resultColor = 'green';
        } else {
            resultColor = 'red';
        }

        let resultMessage;
        if (chosenColor === resultColor) {
            const winnings = stake * 2;
            diamonds += winnings;
            resultMessage = `✅ ${resultColor.toUpperCase()} wins! You gain ${winnings} diamonds.`;
            resultEl.className = "win";
        } else {
            resultMessage = `❌ ${resultColor.toUpperCase()} wins! You lose ${stake} diamonds.`;
            resultEl.className = "lose";
        }

        diamondsEl.textContent = diamonds;
        resultEl.textContent = resultMessage;
        spinButton.disabled = false;
        spinning = false;
    }, 4000);
});

document.getElementById('reset').addEventListener('click', () => {
    diamonds = 100;
    currentRotation = 0;
    diamondsEl.textContent = diamonds;
    resultEl.textContent = "";
    resultEl.className = "";
    wheel.style.transform = 'rotate(0deg)';
    chosenColor = 'red';
    colorChoices.forEach(c => c.classList.remove('active'));
    document.querySelector('.red-circle').classList.add('active');
});
