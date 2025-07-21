// --- Game Configuration ---
const GAME_CONFIG = {
    initialDiamonds: 100,
    spinDuration: 4000, // milliseconds
    extraSpins: 5, // Number of full 360 rotations for realistic spin
    wheelSegments: 8, // Total segments on the wheel (must match CSS)
    segmentColors: ['red', 'green'], // Colors in order around the wheel
    // This defines which angles correspond to which color, assuming start from 0 deg (top) and rotate clockwise
    // E.g., for 8 segments, each is 45 degrees.
    // Red: 0-45, 90-135, 180-225, 270-315
    // Green: 45-90, 135-180, 225-270, 315-360
    segmentMap: [
        { color: 'green', start: 0, end: 45 },
        { color: 'red', start: 45, end: 90 },
        { color: 'green', start: 90, end: 135 },
        { color: 'red', start: 135, end: 180 },
        { color: 'green', start: 180, end: 225 },
        { color: 'red', start: 225, end: 270 },
        { color: 'green', start: 270, end: 315 },
        { color: 'red', start: 315, end: 360 }
    ]
};

// --- DOM Elements ---
const diamondsEl = document.getElementById('diamonds');
const resultEl = document.getElementById('result');
const stakeInput = document.getElementById('stake');
const wheel = document.getElementById('wheel');
const spinButton = document.getElementById('spin');
const colorChoices = document.querySelectorAll('.color-choice');
const resetButton = document.getElementById('reset');

// --- Audio Elements ---
const spinSound = document.getElementById('spinSound');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');

// --- Game State Variables ---
let diamonds = GAME_CONFIG.initialDiamonds;
let currentRotation = 0;
let chosenColor = 'red'; // Default selected color
let spinning = false;

// --- Initialization ---
function initializeGame() {
    diamondsEl.textContent = diamonds;
    resultEl.textContent = "Place your stake and choose a color!";
    resultEl.className = ""; // Clear any previous classes
    document.querySelector('.red-circle').classList.add('active'); // Ensure red is active by default
    stakeInput.value = 10; // Set default stake
    wheel.style.transition = `transform ${GAME_CONFIG.spinDuration / 1000}s cubic-bezier(0.33, 1, 0.68, 1)`;
}

// --- Event Listeners ---
colorChoices.forEach(choice => {
    choice.addEventListener('click', () => {
        if (spinning) return; // Prevent changing choice while spinning
        colorChoices.forEach(c => c.classList.remove('active'));
        choice.classList.add('active');
        chosenColor = choice.dataset.color;
        updateResultMessage(`You selected: ${chosenColor.toUpperCase()}`);
    });
});

spinButton.addEventListener('click', () => {
    if (spinning) return;

    const stake = parseInt(stakeInput.value);

    // Input Validation
    if (isNaN(stake) || stake <= 0) {
        updateResultMessage("❗ Invalid stake amount.", "error");
        return;
    }
    if (stake > diamonds) {
        updateResultMessage("❗ Cannot bet more than your diamonds.", "error");
        return;
    }

    // --- Start Spin ---
    spinning = true;
    spinButton.disabled = true;
    updateResultMessage("Spinning..."); // Clear previous message
    resultEl.className = ""; // Remove win/lose/error classes

    diamonds -= stake;
    diamondsEl.textContent = diamonds;
    spinSound.play(); // Play spin sound

    // Calculate random degrees and total rotation
    const randomDegrees = Math.floor(Math.random() * 360);
    currentRotation += 360 * GAME_CONFIG.extraSpins + randomDegrees;
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    // --- End Spin Logic ---
    setTimeout(() => {
        spinSound.pause();
        spinSound.currentTime = 0; // Reset sound for next spin

        const normalizedAngle = currentRotation % 360; // Get the final angle within 0-359
        let resultColor = determineResultColor(normalizedAngle);

        let resultMessage;
        let resultClass;

        if (chosenColor === resultColor) {
            const winnings = stake * 2;
            diamonds += winnings;
            resultMessage = `✅ ${resultColor.toUpperCase()} wins! You gain ${winnings} diamonds.`;
            resultClass = "win";
            winSound.play(); // Play win sound
        } else {
            resultMessage = `❌ ${resultColor.toUpperCase()} wins! You lose ${stake} diamonds.`;
            resultClass = "lose";
            loseSound.play(); // Play lose sound
        }

        diamondsEl.textContent = diamonds;
        updateResultMessage(resultMessage, resultClass);
        spinButton.disabled = false;
        spinning = false;

        // Reset game if no diamonds left (optional, but good UX)
        if (diamonds <= 0) {
            setTimeout(() => {
                if (diamonds <= 0 && !spinning) { // Double check in case user gained diamonds just after check
                    updateResultMessage("You've run out of diamonds! Resetting...", "error");
                    setTimeout(resetGame, 2000); // Give user time to read
                }
            }, 1000);
        }

    }, GAME_CONFIG.spinDuration);
});

resetButton.addEventListener('click', resetGame);

// --- Helper Functions ---

/**
 * Determines the winning color based on the final rotation angle.
 * The wheel segments are defined in GAME_CONFIG.segmentMap.
 * The pointer is at the top (0 degrees).
 *
 * @param {number} angle The normalized angle (0-359 degrees) where the wheel stopped.
 * @returns {string} The color that the pointer landed on ('red' or 'green').
 */
function determineResultColor(angle) {
    // Adjust angle for the pointer's position. The pointer points at the top,
    // so 0 degrees on the wheel's conic gradient is directly under the pointer.
    // If the wheel segment mapping starts from 0 at the top, no adjustment needed here for logical mapping.
    // However, if your CSS `conic-gradient` starts green at 0deg 45deg (meaning the first segment is green),
    // and the pointer is at the top, then the angle directly under the pointer determines the win.

    // Let's assume 0 degrees on the wheel is the start of the first green segment.
    // The pointer is directly above 0 degrees.
    // We need to find which segment the angle falls into.

    // Given the `conic-gradient` setup:
    // Green: 0-45, 90-135, 180-225, 270-315
    // Red:   45-90, 135-180, 225-270, 315-360

    for (const segment of GAME_CONFIG.segmentMap) {
        if (angle >= segment.start && angle < segment.end) {
            return segment.color;
        }
    }
    // Fallback for edge cases (e.g., angle exactly 360 or rounding issues)
    return GAME_CONFIG.segmentMap[0].color; // Default to the first segment's color
}


/**
 * Updates the result message displayed to the user.
 * @param {string} message The text content for the result element.
 * @param {string} [className] Optional class to add to the result element (e.g., 'win', 'lose', 'error').
 */
function updateResultMessage(message, className = "") {
    resultEl.textContent = message;
    resultEl.className = className; // Replaces existing classes
}

function resetGame() {
    diamonds = GAME_CONFIG.initialDiamonds;
    currentRotation = 0;
    diamondsEl.textContent = diamonds;
    updateResultMessage("Game reset! Place your stake.", "");
    wheel.style.transform = 'rotate(0deg)';
    chosenColor = 'red';
    colorChoices.forEach(c => c.classList.remove('active'));
    document.querySelector('.red-circle').classList.add('active'); // Reactivate red choice
    spinButton.disabled = false;
    spinning = false;
    stakeInput.value = 10; // Reset stake input
}

// Initial call to set up the game display
initializeGame();
