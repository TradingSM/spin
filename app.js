// --- Game Configuration ---
const GAME_CONFIG = {
    initialDiamonds: 100,
    spinDuration: 4000, // milliseconds
    extraSpins: 5, // Number of full 360 rotations for realistic spin
    wheelSegments: 8, // Total segments on the wheel (must match CSS)
    // segmentMap defines the color for each 45-degree segment, starting from 0 (top) clockwise.
    // Ensure this directly corresponds to your CSS conic-gradient.
    // Example: [Green (0-45), Red (45-90), Green (90-135), ...]
    segmentMap: [
        'green', // 0-45
        'red',   // 45-90
        'green', // 90-135
        'red',   // 135-180
        'green', // 180-225
        'red',   // 225-270
        'green', // 270-315
        'red'    // 315-360
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
    updateResultMessage("Place your stake and choose a color!");
    stakeInput.value = 10; // Set default stake

    // Ensure initial active class is set for red choice and aria-checked
    colorChoices.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
    });
    const redChoice = document.querySelector('.red-circle');
    redChoice.classList.add('active');
    redChoice.setAttribute('aria-checked', 'true');

    // Set wheel transition property once
    wheel.style.transition = `transform ${GAME_CONFIG.spinDuration / 1000}s cubic-bezier(0.33, 1, 0.68, 1)`;
}

// --- Event Listeners ---
colorChoices.forEach(choice => {
    choice.addEventListener('click', () => {
        if (spinning) return; // Prevent changing choice while spinning
        
        // Remove active class and aria-checked from all choices
        colorChoices.forEach(c => {
            c.classList.remove('active');
            c.setAttribute('aria-checked', 'false');
        });

        // Add active class and aria-checked to the clicked choice
        choice.classList.add('active');
        choice.setAttribute('aria-checked', 'true');
        
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
    updateResultMessage("Spinning...");
    
    diamonds -= stake;
    diamondsEl.textContent = diamonds;
    
    // Play spin sound and ensure it starts from beginning
    if (spinSound) {
        spinSound.currentTime = 0;
        spinSound.play();
    }

    // Calculate random degrees and total rotation for the spin
    // Ensure randomDegrees results in a precise landing within a segment
    // We want the pointer to land precisely at the *center* of a winning/losing segment.
    // Each segment is 45 degrees. The center of a segment is 22.5, 67.5, 112.5, etc.
    const segmentAngle = 360 / GAME_CONFIG.wheelSegments; // 45 degrees
    const randomSegmentIndex = Math.floor(Math.random() * GAME_CONFIG.wheelSegments);
    
    // Calculate the target angle so the pointer lands in the middle of a segment
    // E.g., for segment 0 (0-45deg), center is 22.5deg. For segment 1 (45-90deg), center is 67.5deg.
    const targetAngleWithinWheel = (randomSegmentIndex * segmentAngle) + (segmentAngle / 2);
    
    // Add full rotations for visual effect. Ensure the final rotation is positive.
    currentRotation = (currentRotation - (currentRotation % 360)) + (360 * GAME_CONFIG.extraSpins) + targetAngleWithinWheel;
    
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    // --- End Spin Logic ---
    setTimeout(() => {
        if (spinSound) {
            spinSound.pause();
            spinSound.currentTime = 0; // Reset sound for next spin
        }

        // Determine the actual stopping angle relative to 0-359
        // The wheel rotated clockwise. The pointer is fixed at the top (0 degrees).
        // If the wheel has rotated X degrees, the angle under the pointer is X % 360.
        const normalizedAngle = currentRotation % 360; 
        
        // Find which segment this angle falls into
        const resultColor = determineResultColor(normalizedAngle);

        let resultMessage;
        let resultClass;

        if (chosenColor === resultColor) {
            const winnings = stake * 2;
            diamonds += winnings;
            resultMessage = `✅ ${resultColor.toUpperCase()} wins! You gain ${winnings} diamonds.`;
            resultClass = "win";
            if (winSound) winSound.play();
        } else {
            resultMessage = `❌ ${resultColor.toUpperCase()} wins! You lose ${stake} diamonds.`;
            resultClass = "lose";
            if (loseSound) loseSound.play();
        }

        diamondsEl.textContent = diamonds;
        updateResultMessage(resultMessage, resultClass);
        spinButton.disabled = false;
        spinning = false;

        // Reset game if no diamonds left
        if (diamonds <= 0) {
            setTimeout(() => {
                if (diamonds <= 0 && !spinning) {
                    updateResultMessage("You've run out of diamonds! Resetting...", "error");
                    setTimeout(resetGame, 2000);
                }
            }, 1000);
        }

    }, GAME_CONFIG.spinDuration);
});

resetButton.addEventListener('click', resetGame);

// --- Helper Functions ---

/**
 * Determines the winning color based on the final rotation angle.
 * This function is crucial for matching the visual wheel to the game logic.
 * It uses the `segmentMap` from GAME_CONFIG, which should accurately represent
 * the `conic-gradient` in style.css.
 *
 * @param {number} angle The normalized angle (0-359 degrees) where the wheel stopped.
 * This angle is relative to the wheel's original 0-degree point,
 * which is directly under the fixed pointer.
 * @returns {string} The color that the pointer landed on ('red' or 'green').
 */
function determineResultColor(angle) {
    const segmentAngleSize = 360 / GAME_CONFIG.wheelSegments; // 45 degrees for 8 segments
    
    // Calculate which segment the angle falls into
    // Example:
    // angle = 20  -> floor(20 / 45) = 0 (Segment 0)
    // angle = 60  -> floor(60 / 45) = 1 (Segment 1)
    // angle = 350 -> floor(350 / 45) = 7 (Segment 7)
    const segmentIndex = Math.floor(angle / segmentAngleSize);

    // Use the pre-defined segment map for the color
    if (segmentIndex >= 0 && segmentIndex < GAME_CONFIG.segmentMap.length) {
        return GAME_CONFIG.segmentMap[segmentIndex];
    }
    
    // Fallback in case of unexpected angle (shouldn't happen with correct logic)
    console.error("Angle out of segment map range:", angle);
    return GAME_CONFIG.segmentMap[0]; // Default to the first segment's color
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
    currentRotation = 0; // Reset wheel rotation visually
    diamondsEl.textContent = diamonds;
    updateResultMessage("Game reset! Place your stake.", "");
    
    // Reset wheel visual
    wheel.style.transform = 'rotate(0deg)'; 
    
    chosenColor = 'red';
    // Reset active color choice and aria-checked
    colorChoices.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
    });
    const redChoice = document.querySelector('.red-circle');
    redChoice.classList.add('active');
    redChoice.setAttribute('aria-checked', 'true');

    spinButton.disabled = false;
    spinning = false;
    stakeInput.value = 10; // Reset stake input
}

// Initial call to set up the game display
initializeGame();
