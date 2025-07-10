let currentName = '';
const maxLength = 10;
const nameDisplay = document.getElementById('nameText');
const specialMessage = document.getElementById('specialMessage');
const easterEgg = document.getElementById('easterEgg');
const easterTitle = document.getElementById('easterTitle');
const easterText = document.getElementById('easterText');

// All the special names and what happens when you type them
const specialNames = {
    'FRISK': {
        type: 'message',
        text: 'WARNING: This name will make your life hell.\nProceed anyway?'
    },
    'CHARA': {
        type: 'easter',
        title: 'The true name.',
        text: 'You feel like you\'re going to have a bad time...',
        location:'https://www.youtube.com/watch?v=WmuHkjc_rsI&pp=ygUPY2hhcmEganVtcHNjYXJl'
    },
    'SANS': {
        type: 'message',
        text: 'nah, i\'m good.\n\n...wait, that\'s not how this works.'
    },
    'PAPYRUS': {
        type: 'message',
        text: 'I\'LL ALLOW IT!!!'
    },
    'UNDYNE': {
        type: 'message',
        text: 'Get your OWN name!',
        location:'https://youtu.be/i29t-5tEp_o?si=HdY2chZgFxpNlYVG'
    },
    'TORIEL': {
        type: 'message',
        text: 'I think you should think of your own name, my child.'
    },
    'ASGORE': {
        type: 'message',
        text: 'You cannot.'
    },
    'GASTER': {
        type: 'easter',
        title: 'W. D. GASTER',
        text: '[REDACTED]'
    },
    'ALPHYS': {
        type: 'message',
        text: 'D-don\'t do that.'
    },
    'FLOWEY': {
        type: 'message',
        text: 'I already CHOSE that name.'
    },
    'ASRIEL': {
        type: 'message',
        text: '...'
    },
    'METTATON': {
        type: 'message',
        text: 'You\'re not a robot, you know.'
    },

    'ALEXANDER': {
        type: 'message',
        text: 'thats me......'
    },
};

// Updates the name display with animated letters
function updateDisplay() {
    nameDisplay.innerHTML = '';
    for (let i = 0; i < currentName.length; i++) {
        const letter = document.createElement('span');
        letter.textContent = currentName[i];
        letter.className = 'name-letter';
        letter.style.animationDelay = `${i * 0.1}s`;
        nameDisplay.appendChild(letter);
    }
}

// Adds a letter to the current name if there's room
function addLetter(letter) {
    if (currentName.length < maxLength) {
        currentName += letter;
        updateDisplay();
    }
}

// Removes the last letter from the current name
function removeLetter() {
    if (currentName.length > 0) {
        currentName = currentName.slice(0, -1);
        updateDisplay();
    }
}

// Checks if the current name is special and shows the appropriate response
function checkSpecialName() {
    const upperName = currentName.toUpperCase();
    if (specialNames[upperName]) {
        const special = specialNames[upperName];

        if (upperName === 'GASTER') {
            playGasterAudio();
        }

        if (special.type === 'message') {
            specialMessage.textContent = special.text;
            specialMessage.classList.add('show');

            if (special.location) {
                setTimeout(() => {
                    window.location.href = special.location;
                }, 2000);
            } else {
                setTimeout(() => {
                    specialMessage.classList.remove('show');
                }, 3000);
            }
        } else if (special.type === 'easter') {
            easterTitle.textContent = special.title;
            easterText.textContent = special.text;
            easterEgg.style.display = 'flex';

            if (special.location) {
                setTimeout(() => {
                    window.location.href = special.location;
                }, 3000);
            }
        }
        return true;
    }
    return false;
}

// Plays the spooky Gaster audio when his name is entered
function playGasterAudio() {
    const audio = new Audio('./sfx/afterDeath.ogg');
    audio.volume = 1;
    audio.play().catch(e => console.log('Audio play failed:', e));
}

// Clears the current name and resets the display
function resetName() {
    currentName = '';
    updateDisplay();
}

// Set up click handlers for all letter buttons
document.querySelectorAll('.letter-btn').forEach((btn, index) => {
    btn.style.animationDelay = `${Math.random() * 0.5}s`;
    
    btn.addEventListener('click', () => {
        addLetter(btn.dataset.letter);
    });
});

// Set up the backspace button
document.getElementById('backspaceBtn').addEventListener('click', removeLetter);

// Set up the done button - finishes name entry
document.getElementById('doneBtn').addEventListener('click', () => {
    if (currentName.length > 0) {
        if (!checkSpecialName()) {
            alert(`You chose the name: ${currentName}`);
        }
    }
});

// Set up the quit button with confirmation
document.getElementById('quitBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to quit?')) {
        location.href = 'https://youtu.be/cUpJZAk9YAk?si=t69kwPaEPp_KiVY1';
    }
});

// Set up the back button for easter eggs
document.getElementById('backBtn').addEventListener('click', () => {
    easterEgg.style.display = 'none';
    resetName();
});

// Handle keyboard input for typing names
document.addEventListener('keydown', (e) => {
    if (e.key >= 'A' && e.key <= 'Z') {
        addLetter(e.key.toUpperCase());
    } else if (e.key >= 'a' && e.key <= 'z') {
        addLetter(e.key.toUpperCase());
    } else if (e.key === 'Backspace') {
        removeLetter();
    } else if (e.key === 'Enter') {
        if (currentName.length > 0) {
            if (!checkSpecialName()) {
                alert(`You chose the name: ${currentName}`);
            }
        }
    } else if (e.key === 'Escape') {
        resetName();
    }
});

// Start with an empty name display
updateDisplay();
