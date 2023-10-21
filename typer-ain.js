//* Init
let ain = {
  // DOM sections
  gameArea: document.querySelector('#ain-game'),
  scoreArea: {
    currentScore: document.querySelector('#ain-current-score'),
    highScore: document.querySelector('#ain-high-score'),
    spawnRate: document.querySelector('#ain-spawn-rate'),
  },
  highScore: localStorage.getItem('ainHighScore') || 0,

  // game functions
  getRandomChar: (special) => {
    if (special) {
      //* special character
      return String.fromCharCode(Math.floor(Math.random() * 33) + 32)
    } else {
      //* caseless
      return String.fromCharCode(Math.floor(Math.random() * 26) + 97)
    }
  },
  getRandomX: () => {
    return Math.floor(Math.random() * (ain.gameArea.width - 20) + 10)
  },
}

ain.scoreArea.currentScore.textContent = `CurrentScore: 0`
ain.scoreArea.highScore.textContent = `High Score: ${ain.highScore}`
ain.scoreArea.spawnRate.textContent = `Spawn Rate: 1.8/second`

//* Main loop once the game starts
const ainLoop = () => {
  const ctx = ain.gameArea.getContext('2d')
  ctx.clearRect(0, 0, ain.gameArea.width, ain.gameArea.height)
  ctx.font = '24px monospace'

  // generate char
  ain.charSpawnRate = 0.03 + ain.currentScore * 0.0005
  ain.scoreArea.spawnRate.textContent = `Spawn Rate: ${(ain.charSpawnRate * 60).toFixed(2)}/second`
  if (Math.random() < ain.charSpawnRate) {
    const newChar = {
      letter: ain.getRandomChar(),
      x: ain.getRandomX(),
      y: 0,
    }
    ain.chars.push(newChar)
  }

  ain.chars.forEach((char, index) => {
    // move chars
    //TODO make the speed variable for each char
    char.y += 1
    if (char.y > ain.gameArea.height) {
      // letter was missed
      ain.currentScore -= 5
      ain.deadChars.push(char)
      ain.chars.splice(index, 1)
    }
    // place chars on screen
    ctx.fillStyle = 'black'
    ctx.fillText(char.letter, char.x, char.y)
  })

  ain.deadChars.forEach((char, index) => {
    char.y -= 1
    char.letter = ain.getRandomChar(true)
    if (char.y < 0) {
      ain.deadChars.splice(index, 1)
    }
    ctx.fillStyle = 'red'
    ctx.fillText(char.letter, char.x, char.y)
  })

  if (ain.chars.length > 100) {
    ain.chars.shift()
  }

  // handle score output
  if (ain.currentScore < 0) ain.currentScore = 0
  if (ain.currentScore > ain.highScore) {
    ain.highScore = ain.currentScore
    localStorage.setItem('ainHighScore', ain.highScore)
  }
  ain.scoreArea.currentScore.textContent = `CurrentScore: ${ain.currentScore}`
  ain.scoreArea.highScore.textContent = `High Score: ${ain.highScore}`

  ain.animationFrame = requestAnimationFrame(ainLoop)
}

//* Event Listeners
document.addEventListener('keypress', (e) => {
  let matched = false
  for (let i = 0; i < ain.chars.length; i++) {
    if (e.key === ain.chars[i].letter) {
      matched = true
      ain.currentScore++
      ain.chars.splice(i, 1)
      break
    }
  }
  if (!matched) {
    ain.currentScore--
    ain.deadChars.push({
      letter: ain.getRandomChar(true),
      x: ain.getRandomX(),
      y: ain.gameArea.height,
    })
  }
})
document.querySelector('#ain-start').addEventListener('click', (e) => {
  e.target.textContent = 'Restart'
  e.target.blur()
  cancelAnimationFrame(ain.animationFrame)
  ain.currentScore = 0
  ain.charSpawnRate = 0.03
  ain.chars = [] // [{ letter:'a', x:0, y:0 },...]
  ain.deadChars = []
  ainLoop()
})
