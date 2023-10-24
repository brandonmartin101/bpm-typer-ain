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

  soundBoard: {
    // https://soundbible.com/1908-2-Minute-Storm.html
    rain: new Audio('audio/2-minute-storm_mike-koenig.mp3'),
    // https://soundbible.com/2154-Text-Message-Alert-1.html
    sfxGood: new Audio('audio/sms-alert-1-daniel_simon.mp3'),
    // https://soundbible.com/2181-Dial-Tone-American.html
    sfxBad: new Audio('audio/america-dial-tone-daniel_simon.mp3'),
  },

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
      if (!ain.soundBoard.sfxBad.muted) {
        const sfxBad = ain.soundBoard.sfxBad.cloneNode()
        sfxBad.volume = 0.05
        sfxBad.play()
        setTimeout(() => {
          sfxBad.pause()
          sfxBad.currentTime = 0
        }, 500)
      }
      //TODO decrease health bar (once implemented)
      ain.currentScore -= 1
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
      if (!ain.soundBoard.sfxGood.muted) {
        const sfxGood = ain.soundBoard.sfxGood.cloneNode()
        sfxGood.volume = 0.2
        sfxGood.play()
      }
      //TODO increase health bar maybe? heal with successful keys?
      matched = true
      ain.currentScore++
      ain.chars.splice(i, 1)
      break
    }
  }
  if (!matched) {
    if (!ain.soundBoard.sfxBad.muted) {
      const sfxBad = ain.soundBoard.sfxBad.cloneNode()
      sfxBad.volume = 0.1
      sfxBad.play()
      setTimeout(() => {
        sfxBad.pause()
        sfxBad.currentTime = 0
      }, 500)
    }
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
  //TODO initialize health bar that will be used in the game
  ainLoop()
})

document.querySelector('#rain-mute').addEventListener('click', (e) => {
  if (ain.soundBoard.rain.paused) {
    ain.soundBoard.rain.play()
    localStorage.setItem('ainRainMuted', 'false')
    document.querySelector('#rain-mute-img').src = 'images/droplet.svg'
  } else {
    ain.soundBoard.rain.pause()
    localStorage.setItem('ainRainMuted', 'true')
    document.querySelector('#rain-mute-img').src = 'images/droplet-slash.svg'
  }
})

document.querySelector('#sfx-mute').addEventListener('click', (e) => {
  if (ain.soundBoard.sfxGood.muted && ain.soundBoard.sfxBad.muted) {
    ain.soundBoard.sfxGood.muted = false
    ain.soundBoard.sfxBad.muted = false
    localStorage.setItem('ainSfxMuted', 'false')
    document.querySelector('#sfx-mute-img').src = 'images/volume-high.svg'
  } else {
    ain.soundBoard.sfxGood.muted = true
    ain.soundBoard.sfxBad.muted = true
    localStorage.setItem('ainSfxMuted', 'true')
    document.querySelector('#sfx-mute-img').src = 'images/volume-off.svg'
  }
})

document.addEventListener('DOMContentLoaded', (e) => {
  if (localStorage.getItem('ainRainMuted') === 'false') {
    document.querySelector('#rain-mute').click()
  }
  if (localStorage.getItem('ainSfxMuted') === 'false') {
    document.querySelector('#sfx-mute').click()
  }
})
