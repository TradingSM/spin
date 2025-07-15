let diamonds = 100;
let currentRotation = 0;
let chosenColor = 'red';
const diamondsEl = document.getElementById('diamonds');
const resultEl = document.getElementById('result');
const stakeInput = document.getElementById('stake');
const wheel = document.getElementById('wheel');
let spinning = false;

const colorChoices = document.querySelectorAll('.color-choice');
colorChoices.forEach(choice => {
    choice.addEventListener('click', () => {
        colorChoices.forEach(c => c.classList.remove('active'));
        choice.classList.add('active');
        chosenColor = choice.dataset.color;
        resultEl.textContent = `You selected: ${chosenColor.toUpperCase()}`;
    });
});

document.getElementById('spin').addEventListener('click', () => {
    if (spinning) return;

    const stake = parseInt(stakeInput.value);
    if (isNaN(stake) || stake <= 0) {
        resultEl.textContent = "❗ Invalid stake amount.";
        return;
    }
    if (stake > diamonds) {
        resultEl.textContent = "❗ Cannot bet more than your diamonds.";
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
        let resultColor;

        if ((normalizedAngle >= 0 && normalizedAngle < 90) || (normalizedAngle >= 180 && normalizedAngle < 270)) {
            resultColor = 'red';
        } else {
            resultColor = 'green';
        }

        let resultMessage;
        if (chosenColor === resultColor) {
            const winnings = stake * 2;
            diamonds += winnings;
            resultMessage = `✅ ${resultColor.toUpperCase()} wins! You gain ${winnings} diamonds.`;
        } else {
            resultMessage = `❌ ${resultColor.toUpperCase()} wins! You lose ${stake} diamonds.`;
        }

        diamondsEl.textContent = diamonds;
        resultEl.textContent = resultMessage;
        spinning = false;
    }, 4000);
});

document.getElementById('reset').addEventListener('click', () => {
    diamonds = 100;
    currentRotation = 0;
    diamondsEl.textContent = diamonds;
    resultEl.textContent = "";
    wheel.style.transform = 'rotate(0deg)';
    chosenColor = 'red';
    colorChoices.forEach(c => c.classList.remove('active'));
    document.querySelector('.red-circle').classList.add('active');
});
