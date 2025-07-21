// --- Game Configuration ---
const GAME_CONFIG = {
    initialDiamonds: 100,
    spinDuration: 4000, // milliseconds
    extraSpins: 5, // Number of full 360 rotations for realistic spin
    wheelSegments: 8, // Total segments on the wheel (must match CSS)
    // segmentMap defines the color for each 45-degree segment, starting from 0 (top) clockwise.
    // IMPORTANT: This MUST perfectly match the order in your style.css conic-gradient.
    // Current CSS conic-gradient starts with RED from 0-45deg.
    segmentMap: [
        'red',   // 0-45 degrees (Segment 0)
        'green', // 45-90 degrees (Segment 1)
        'red',   // 90-135 degrees (Segment 2)
        'green', // 135-180 degrees (Segment 3)
        'red',   // 180-225 degrees (Segment 4)
        'green', // 225-270 degrees (Segment 5)
        'red',   // 270-315 degrees (Segment 6)
        'green'  // 315-360 degrees (Segment 7)
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
let currentRotation = 0; // Stores the cumulative rotation value
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

    // Set wheel transition property once for smoother animation
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
        updateResultMessage("❗ Invalid stake amount. Please enter a positive number.", "error");
        return;
    }
    if (stake > diamonds) {
        updateResultMessage("❗ Cannot bet more than your diamonds. Reduce your stake.", "error");
        return;
    }

    // --- Start Spin ---
    spinning = true;
    spinButton.disabled = true;
    updateResultMessage("Spinning..."); // Clear previous message
    
    diamonds -= stake;
    diamondsEl.textContent = diamonds;
    
    // Play spin sound and ensure it starts from beginning
    if (spinSound) {
        spinSound.currentTime = 0;
        spinSound.play();
    }

    // Calculate the target angle for the spin.
    // We want the pointer to land precisely at the *center* of a randomly chosen segment.
    const segmentAngle = 360 / GAME_CONFIG.wheelSegments; // E.g., 45 degrees for 8 segments
    const randomSegmentIndex = Math.floor(Math.random() * GAME_CONFIG.wheelSegments);
    
    // Calculate the target angle for the wheel to stop at the center of the chosen segment.
    // The pointer is fixed at the top (0 degrees).
    // If segment 0 is 0-45, its center is 22.5.
    // If segment 1 is 45-90, its center is 67.5.
    const targetAngleWithinWheel = (randomSegmentIndex * segmentAngle) + (segmentAngle / 2);
    
    // Add multiple full rotations for visual effect to make it look like a good spin.
    // We need to ensure the new rotation value is always higher than the current one to spin forward.
    // Also, we add a random offset within 360 degrees to ensure it doesn't always land precisely same way if you change logic.
    const fullSpins = 360 * GAME_CONFIG.extraSpins;
    
    // Ensure the wheel always spins in the same direction and lands on a specific point.
    // `currentRotation` is cumulative. We want the *visual* landing angle to be `targetAngleWithinWheel`.
    // The trick is to ensure the final `currentRotation` effectively points to `targetAngleWithinWheel` when `mod 360`.
    
    // Let's make sure the current rotation value is reset to a baseline that ensures forward spinning
    // without "unwinding" in weird ways if currentRotation gets too large.
    // Get current visual angle:
    const currentVisualAngle = currentRotation % 360; 
    let rotationNeeded = targetAngleWithinWheel - currentVisualAngle;

    // If target is behind current, add a full spin to ensure forward motion
    if (rotationNeeded < 0) {
        rotationNeeded += 360;
    }
    
    // Add extra full spins for dramatic effect
    currentRotation += fullSpins + rotationNeeded;

    wheel.style.transform = `rotate(${currentRotation}deg)`;

    // --- End Spin Logic ---
    setTimeout(() => {
        if (spinSound) {
            spinSound.pause();
            spinSound.currentTime = 0; // Reset sound for next spin
        }

        // Determine the actual stopping color based on `randomSegmentIndex`
        // since we precisely targeted the center of that segment.
        const resultColor = GAME_CONFIG.segmentMap[randomSegmentIndex];

        let resultMessage;
        let resultClass;

        if (chosenColor === resultColor) {
            const winnings = stake * 2;
            diamonds += winnings;
            resultMessage = `✅ ${resultColor.toUpperCase()} WINS! You gain ${winnings} diamonds.`;
            resultClass = "win";
            if (winSound) winSound.play();
        } else {
            resultMessage = `❌ ${resultColor.toUpperCase()} WINS! You lose ${stake} diamonds.`;
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
                // Ensure no double reset if user somehow gained diamonds quickly
                if (diamonds <= 0 && !spinning) { 
                    updateResultMessage("You've run out of diamonds! Resetting...", "error");
                    setTimeout(resetGame, 2500); // Give user time to read before full reset
                }
            }, 1000);
        }

    }, GAME_CONFIG.spinDuration);
});

resetButton.addEventListener('click', resetGame);

// --- Helper Functions ---

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
    currentRotation = 0; // Reset cumulative rotation for clean spins
    diamondsEl.textContent = diamonds;
    updateResultMessage("Game reset! Place your stake.", "");
    
    // Visually reset wheel to 0 degrees
    wheel.style.transform = 'rotate(0deg)'; 
    
    chosenColor = 'red';
    // Reset active color choice and aria-checked state
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
