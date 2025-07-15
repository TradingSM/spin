let diamonds = 100;
let currentRotation = 0;
const diamondsEl = document.getElementById('diamonds');
const resultEl = document.getElementById('result');
const wheel = document.getElementById('wheel');
let spinning = false;

document.getElementById('spin').addEventListener('click', () => {
    if (spinning || diamonds <= 0) return;
    spinning = true;

    const extraSpins = 5;
    const randomDegrees = Math.floor(Math.random() * 360);
    currentRotation += 360 * extraSpins + randomDegrees;

    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        const normalizedAngle = currentRotation % 360;
        let result;
        if ((normalizedAngle >= 0 && normalizedAngle < 90) || (normalizedAngle >= 180 && normalizedAngle < 270)) {
            diamonds += 20;
            result = "💎 You won 20 diamonds!";
        } else {
            diamonds -= 10;
            result = "💔 You lost 10 diamonds!";
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
