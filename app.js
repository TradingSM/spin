let diamonds = 100;
let currentRotation = 0;
const diamondsEl = document.getElementById('diamonds');
const resultEl = document.getElementById('result');
const stakeInput = document.getElementById('stake');
const wheel = document.getElementById('wheel');
let spinning = false;

document.getElementById('spin').addEventListener('click', () => {
    const stake = parseInt(stakeInput.value);

    if (spinning || diamonds <= 0 || isNaN(stake) || stake <= 0) return;
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
        let result;
        if ((normalizedAngle >= 0 && normalizedAngle < 90) || (normalizedAngle >= 180 && normalizedAngle < 270)) {
            diamonds += stake * 2;
            result = `💎 You won ${stake * 2} diamonds!`;
        } else {
            result = `💔 You lost ${stake} diamonds!`;
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
});
