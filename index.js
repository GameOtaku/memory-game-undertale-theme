/**
 * UNDERTALE MEMORY GAME
 * 
 * This is a memory matching game themed around the popular indie game Undertale.
 * Players flip cards to match pairs of characters, but there's a twist - finding Flowey
 * triggers a special bullet-hell fight sequence that the player must survive!
 */

// Character images for the cards
const paparyus = 'https://img.icons8.com/ios/50/papyrus.png';
const toriel = 'https://img.icons8.com/ios/50/toriel.png';
const asgore = 'https://img.icons8.com/ios/50/asgore.png';
const sans = 'https://img.icons8.com/ios/50/sans.png';
const flowey = 'https://img.icons8.com/ios/50/flowey.png';
const floweyEvil = './images/flowey.png';

// Audio files for different game events
const paparyusMatch = new Audio('./voices/paparyus.mp3');
const torielMatch = new Audio('./voices/toriel.mp3');
const asgoreMatch = new Audio('./voices/asgore.mp3');
const sansMatch = new Audio('./voices/sans.mp3');
const floweySpecial = new Audio('./voices/flowey.mp3');
const floweyFind = new Audio('./voices/flowey-talking.mp3');
const wrong = new Audio('./sfx/death.mp3');
const fight = new Audio('./sfx/battle.mp3');
const wind = new Audio('./sfx/mus_f_wind1.ogg');
const alarm = new Audio('./sfx/mus_f_alarm.ogg');
const survived = new Audio('./sfx/survived.mp3');
const death = new Audio('./sfx/death2.mp3');
const winning = new Audio('./sfx/afterWIN.ogg');
const evil = new Audio('./sfx/evil.ogg');
// Game state variables
let floweyTriggered = false;
let matchedPairs = 0;
let gameInProgress = true;
let fightCompleted = false;

// Fight sequence variables
let seconds = 30;
let intervalId = null;
let bulletIntervalId = null;

// Player and UI elements
window.kat = document.getElementById('cat');
window.timerElement = document.getElementById('timer');
window.timeContainer = document.getElementById('time');
window.container = document.getElementById('container');

// Player movement
let topPos = 250;
let leftPos = 250;
let moveSpeed = 8;
let keysPressed = {};
let fightActive = false;
let bullets = [];

// Card matching variables
const cards = document.querySelectorAll('.col');
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

// Creates a bullet that spawns from a random edge and moves toward the center
function createBullet() {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');

  const side = Math.floor(Math.random() * 4);
  let x, y, vx, vy;

  switch (side) {
    case 0: // Top
      x = Math.random() * container.clientWidth;
      y = -15;
      vx = (Math.random() - 0.5) * 6;
      vy = 10 + Math.random() * 3;
      break;
    case 1: // Right
      x = container.clientWidth + 15;
      y = Math.random() * container.clientHeight;
      vx = -2 - Math.random() * 2;
      vy = (Math.random() - 0.5) * 8;
      break;
    case 2: // Bottom
      x = Math.random() * container.clientWidth;
      y = container.clientHeight + 15;
      vx = (Math.random() - 0.5) * 4;
      vy = -1 - Math.random() * 1;
      break;
    case 3: // Left
      x = -15;
      y = Math.random() * container.clientHeight;
      vx = 2 + Math.random() * 2;
      vy = (Math.random() - 0.5) * 4;
      break;
  }

  bullet.style.left = x + 'px';
  bullet.style.top = y + 'px';
  bullet.vx = vx;
  bullet.vy = vy;

  container.appendChild(bullet);
  bullets.push(bullet);
}

// Moves all bullets and removes ones that go off screen
function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    const currentX = parseFloat(bullet.style.left);
    const currentY = parseFloat(bullet.style.top);
    const newX = currentX + bullet.vx;
    const newY = currentY + bullet.vy;

    bullet.style.left = newX + 'px';
    bullet.style.top = newY + 'px';

    if (newX < -30 || newX > container.clientWidth + 30 ||
      newY < -30 || newY > container.clientHeight + 30) {
      bullet.remove();
      bullets.splice(i, 1);
    }
  }
}

// Checks if any bullets hit the player - if so, game over
function checkCollisions() {
  const katRect = {
    x: leftPos,
    y: topPos,
    width: 15,
    height: 15
  };

  for (let bullet of bullets) {
    const bulletRect = {
      x: parseFloat(bullet.style.left),
      y: parseFloat(bullet.style.top),
      width: 15,
      height: 15
    };

    if (katRect.x < bulletRect.x + bulletRect.width &&
      katRect.x + katRect.width > bulletRect.x &&
      katRect.y < bulletRect.y + bulletRect.height &&
      katRect.y + katRect.height > bulletRect.y) {

      clearInterval(intervalId);
      clearInterval(bulletIntervalId);
      fightActive = false;
      gameInProgress = false;
      wind.pause();
      death.play();
    
      evil.play();
    
      bullets.forEach(b => b.remove());
      bullets = [];

      document.getElementById('fightScreen').style.opacity = '0';
      document.getElementById('gameOver').style.display = 'block';
      return;
    }
  }
}

// Removes all bullets from the screen
function clearBullets() {
  bullets.forEach(bullet => bullet.remove());
  bullets = [];
}

// Shuffles an array randomly using Fisher-Yates algorithm
function fisherYatesShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Sets up a new game with shuffled cards and reset variables
function initializeGame() {
  floweyTriggered = false;
  matchedPairs = 0;
  gameInProgress = true;
  fightCompleted = false;

  const shuffledCharacters = fisherYatesShuffle([
    paparyus, asgore, toriel, asgore, sans, sans, flowey, toriel, paparyus
  ]);

  const choices = document.querySelectorAll('.icons');
  choices.forEach((choice, index) => {
    choice.innerHTML = '';
    const image = document.createElement('img');
    image.src = shuffledCharacters[index];
    image.alt = 'Character';
    image.width = 50;
    choice.dataset.character = shuffledCharacters[index];
    choice.appendChild(image);
  });

  const cards = document.querySelectorAll('.col');
  cards.forEach(card => {
    card.querySelector('.card').classList.remove('flip');
    card.querySelector('.back').style.backgroundColor = '';
    card.querySelector('.card').style.animation = '';
    card.addEventListener('click', flipCard);
  });

  resetBoard();

  const hearts = document.querySelectorAll('.heart');
  hearts.forEach((heart) => {
    heart.innerHTML = '';
    const life = document.createElement('img');
    life.src = './images/Undertale_red_soul.svg';
    life.alt = 'life';
    life.width = 50;
    heart.appendChild(life);
  });
}

// Handles when a player clicks on a card to flip it
function flipCard() {
  if (lockBoard || !gameInProgress) return;

  const card = this.querySelector('.card');
  if (card.classList.contains('flip')) return;

  card.classList.add('flip');
  const character = this.querySelector('.icons').dataset.character;

  if (character === flowey && !floweyTriggered && !fightCompleted) {
    triggerFloweySpecial(this);
    return;
  }

  if (character === floweyEvil && !fightCompleted) {
    playEvilFloweyEffect(this);
    return;
  }

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  secondCard = this;
  hasFlippedCard = false;
  checkForMatch();
}

// Triggers the special Flowey encounter with dramatic transformation
function triggerFloweySpecial(floweyCard) {
  floweyTriggered = true;
  gameInProgress = false;

  fight.play();
  document.querySelector('.frame').innerHTML = '';
  const Ftalk = document.querySelector('.frame')
  const Ftalking = document.createElement('div');
  Ftalking.classList.add('talking');
   Ftalking.innerHTML = `<img id='flowey' src= ./images/flowey-face.gif alt = "flowey talking" width = 50px>
   <p id=flowey-texy>You worthless insect. You thought you could defeat me? I'll tear your world apart piece by piece. I'll crush every hope, poison every moment, and rip you down to the last cell. No escape. No peace. Just pain — slow, personal, and endless. I will enjoy every second of your suffering.</p>`
  Ftalk.appendChild(Ftalking);
 
  paparyusMatch.pause();
  torielMatch.pause();
  asgoreMatch.pause();
  sansMatch.pause();

  setTimeout(() => {
    alarm.play()
  }, 4500)
  setTimeout(() => {
    wind.play();
  }, 5500)

  setTimeout(() => {
    floweySpecial.play();
  }, 1500);

  setTimeout(() => {
    const floweyImage = floweyCard.querySelector('.icons img');
    floweyImage.src = floweyEvil;
  }, 1500)

  floweyCard.querySelector('.icons').dataset.character = floweyEvil;
  floweyCard.querySelector('.card').style.animation = 'floweySpecial 0.5s ease-in-out';
  floweyCard.querySelector('.back').style.backgroundColor = 'darkred';

  setTimeout(() => {
    floweyCard.querySelector('.card').style.animation = '';
    startFightSequence();
  }, 10000);
}

// Restarts the entire game by recreating the fight screen and resetting everything
const restart = () => {
    const fightScreen = document.createElement('div');
    fightScreen.className = 'fight-screen';
    fightScreen.id = 'fightScreen';
    
    fightScreen.innerHTML = `
        <div id="time">get ready to fight after 30s</div>
        <div id="timer">30</div>
        <div id="container">
            <img src="./images/Undertale_red_soul.svg" id="cat" alt="heart soul">
        </div>
        <p style="margin-top: 20px;">Use arrow keys to move and survive!</p>
    `;
    
    document.body.appendChild(fightScreen);
    
    window.kat = document.getElementById('cat');
    window.timerElement = document.getElementById('timer');
    window.timeContainer = document.getElementById('time');
    window.container = document.getElementById('container');
    
    initializeGame();
};

// Starts the bullet-hell fight sequence where player must survive 30 seconds
function startFightSequence() {
  document.getElementById('fightScreen').style.display = 'flex';
  fightActive = true;

  seconds = 30;
  topPos = 250;
  leftPos = 250;

  kat.style.top = topPos + 'px';
  kat.style.left = leftPos + 'px';

  clearBullets();
  
  setTimeout(() => {
    startTimer();
    bulletIntervalId = setInterval(createBullet, 500);
  }, 5000);

  requestAnimationFrame(gameLoop);
}

// Main game loop that runs every frame during the fight
function gameLoop() {
  if (!fightActive) return;

  if (keysPressed['ArrowUp']) topPos -= moveSpeed;
  if (keysPressed['ArrowDown']) topPos += moveSpeed;
  if (keysPressed['ArrowLeft']) {
    leftPos -= moveSpeed;
    kat.style.transform = "scaleX(-1)";
  }
  if (keysPressed['ArrowRight']) {
    leftPos += moveSpeed;
    kat.style.transform = "scaleX(1)";
  }

  topPos = Math.max(0, Math.min(container.clientHeight - kat.clientHeight, topPos));
  leftPos = Math.max(0, Math.min(container.clientWidth - kat.clientWidth, leftPos));

  kat.style.top = topPos + 'px';
  kat.style.left = leftPos + 'px';

  updateBullets();
  checkCollisions();

  requestAnimationFrame(gameLoop);
}

// Starts the 30-second countdown timer for the fight
function startTimer() {
  const msg = document.createElement('p');
  msg.textContent = 'The battle has begun...';
  timeContainer.appendChild(msg);

  intervalId = setInterval(() => {
    seconds--;
    timerElement.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(intervalId);
      clearInterval(bulletIntervalId);
      fightActive = false;
      fightCompleted = true;
      survived.play();
      const endMsg = document.createElement('p');
      endMsg.textContent = "You survived! Flowey retreats...";
      msg.textContent = '';
      timeContainer.appendChild(endMsg);

      setTimeout(() => {
        document.getElementById('fightScreen').style.display = 'none';
        gameInProgress = true;
      }, 2000);
    }
  }, 1000);
}

// Checks if two flipped cards match and handles the result
function checkForMatch() {
  const firstCharacter = firstCard.querySelector('.icons').dataset.character;
  const secondCharacter = secondCard.querySelector('.icons').dataset.character;

  if (firstCharacter === secondCharacter) {
    matchedPairs++;

    if (firstCharacter === paparyus) {
      paparyusMatch.play();
      torielMatch.pause();
      sansMatch.pause();
      asgoreMatch.pause();
      document.querySelector('.frame').innerHTML = '';
      const Ptalk = document.querySelector('.frame')
      const Ptalking = document.createElement('div');
      Ptalking.classList.add('talking');
      Ptalking.innerHTML = `<img id='papyrus' src= ./images/paparyus_face.png alt = "paparyus talking" width = 50px>
      <p id="papyrus-text">HEY!  YOU  FOUND  ME <br>AFTER  ALL  THIS  WE  NEED  SOME  SPAGHETTI  ON  OUR  SECOND  DATE<br>NYEHEHEHEHEHEHE</p>`;
      Ptalk.appendChild(Ptalking);

    } else if (firstCharacter === toriel) {
      torielMatch.play();
      paparyusMatch.pause();
      asgoreMatch.pause();
      sansMatch.pause();
      document.querySelector('.frame').innerHTML = '';
      const Ttalk = document.querySelector('.frame')
      const Ttalking = document.createElement('div');
      Ttalking.classList.add('talking');
      Ttalking.innerHTML = `<img id='toriel' src= ./images/toriel_face.png alt = "toriel talking" width = 50px>
      <p id = 'toriel-text'>My child, you found me!, Be careful!</p>`;
      Ttalk.appendChild(Ttalking);
    } else if (firstCharacter === asgore) {
      asgoreMatch.play();
      paparyusMatch.pause();
      torielMatch.pause();
      sansMatch.pause();
      document.querySelector('.frame').innerHTML = '';
      const Atalk = document.querySelector('.frame')
      const Atalking = document.createElement('div');
      Atalking.classList.add('talking');
      Atalking.innerHTML = `<img id='asgore' src= ./images/Asgore_face.png alt = "asgore talking" width = 50px>
      <p id = 'asgore-text'>You found me, my child! Toriel will be so happy, we can finally be a family again.</p>`;
      Atalk.appendChild(Atalking);
    } else if (firstCharacter === sans) {
      sansMatch.play();
      asgoreMatch.pause();
      torielMatch.pause();
      paparyusMatch.pause();
      document.querySelector('.frame').innerHTML = '';
      const Stalk = document.querySelector('.frame')
      const Stalking = document.createElement('div');
      Stalking.classList.add('talking');
      Stalking.innerHTML = `<img id='sans' src="./images/sans-face.png" width = 50px>
      <p id = 'sans-text'>Heh, you found me, human. Nice j*b!</p>`;
      Stalk.appendChild(Stalking);
    } else if (firstCharacter === floweyEvil) {
      floweyFind.play();
    }

    setTimeout(() => {
      firstCard.querySelector('.back').style.backgroundColor = 'green';
      secondCard.querySelector('.back').style.backgroundColor = 'green';
      disableCards();

      if (matchedPairs >= 4) {
        setTimeout(() => {
        winning.play();
        },4000)
        gameInProgress = false;
        setTimeout(() => {
          location.href = 'name.html'
        }, 16000);
      }
    }, 500);
  } else {
    wrong.play();

    const hearts = document.querySelectorAll('.heart');
    for (let heart of hearts) {
      const life = heart.querySelector('img');
      if (life) {
        life.remove();
        break;
      }
    }

    const remainingHearts = document.querySelectorAll('.heart img');
    if (remainingHearts.length === 0) {
      gameOver();
      return;
    }

    firstCard.querySelector('.back').style.backgroundColor = '';
    secondCard.querySelector('.back').style.backgroundColor = '';
    firstCard.querySelector('.card').style.animation = '';
    secondCard.querySelector('.card').style.animation = '';

    setTimeout(() => {
      firstCard.querySelector('.back').style.backgroundColor = 'red';
      secondCard.querySelector('.back').style.backgroundColor = 'red';
      firstCard.querySelector('.card').style.animation = 'wrongMatch 0.2s ease-in-out';
      secondCard.querySelector('.card').style.animation = 'wrongMatch 0.2s ease-in-out';

      setTimeout(() => {
        firstCard.querySelector('.back').style.backgroundColor = '';
        secondCard.querySelector('.back').style.backgroundColor = '';
      }, 200);
    }, 200);

    unflipCards();
  }
}

// Handles game over when player runs out of hearts
function gameOver() {
  fightActive = false;
  gameInProgress = false;
  clearInterval(intervalId);
  clearInterval(bulletIntervalId);
  clearBullets();
 
  death.play();
  document.getElementById('gameOver').style.display = 'block';
   evil.play();
}

// Restarts the game after game over
function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    const fightScreen = document.getElementById('fightScreen');
    if (fightScreen) {
        fightScreen.remove();
    }
    document.querySelector('.frame').innerHTML = '';
    wind.pause();
    restart();
}

// Flips non-matching cards back face down after a delay
function unflipCards() {
  lockBoard = true;

  setTimeout(() => {
    firstCard.querySelector('.card').classList.remove('flip');
    secondCard.querySelector('.card').classList.remove('flip');
    resetBoard();
  }, 500);
}

// Permanently disables cards that have been matched
function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  resetBoard();
}

// Clears the current card selection for the next matching attempt
function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

// Tracks which keys are pressed for smooth player movement
window.addEventListener('keydown', e => {
  if (fightActive) {
    keysPressed[e.key] = true;
  }
});

// Stops movement when keys are released
window.addEventListener('keyup', e => {
  if (fightActive) {
    keysPressed[e.key] = false;
  }
});

// Start the game when page loads
initializeGame();