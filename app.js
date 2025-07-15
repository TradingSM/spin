let diamonds = 100;
const diamondsEl = document.getElementById('diamonds');
const resultEl = document.getElementById('result');
const wheel = document.getElementById('wheel');
let spinning = false;

document.getElementById('spin').addEventListener('click', () => {
    if (spinning || diamonds <= 0) return;
    spinning = true;

    const spinAngle = 360 * 5 + Math.floor(Math.random() * 360); // 5 full spins + random
    wheel.style.transform = `rotate(${spinAngle}deg)`;

    setTimeout(() => {
        const normalizedAngle = spinAngle % 360;
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
    diamondsEl.textContent = diamonds;
    resultEl.textContent = "";
    wheel.style.transform = 'rotate(0deg)';
});
