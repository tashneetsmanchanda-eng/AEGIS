/**
 * Sound Effects Utility
 * Handles flutter sound for Butterfly Swarm animation
 * Uses Web Audio API to generate subtle flutter sounds
 */

let audioContext = null
let flutterAudioBuffer = null

/**
 * Initialize audio context (must be called after user interaction)
 */
const initAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (error) {
      console.log('Web Audio API not available:', error)
      return null
    }
  }
  return audioContext
}

/**
 * Create flutter sound buffer
 */
const createFlutterSoundBuffer = (ctx) => {
  const duration = 0.08 // Short flutter
  const sampleRate = ctx.sampleRate
  const frameCount = Math.floor(duration * sampleRate)
  const buffer = ctx.createBuffer(1, frameCount, sampleRate)
  const data = buffer.getChannelData(0)

  // Generate flutter-like noise with envelope
  for (let i = 0; i < frameCount; i++) {
    const progress = i / frameCount
    // Exponential envelope for natural decay
    const envelope = Math.exp(-progress * 4)
    // White noise with slight filtering
    const noise = (Math.random() * 2 - 1) * envelope
    // Add slight frequency modulation for flutter effect
    const flutter = Math.sin(progress * Math.PI * 20) * 0.3
    data[i] = (noise + flutter) * 0.08 // Very quiet (0.08 gain)
  }

  return buffer
}

/**
 * Initialize flutter sound
 */
export const initFlutterSound = () => {
  const ctx = initAudioContext()
  if (!ctx) return

  try {
    flutterAudioBuffer = createFlutterSoundBuffer(ctx)
  } catch (error) {
    console.log('Failed to create flutter sound:', error)
  }
}

/**
 * Play flutter sound effect
 * Only plays if browser allows audio (user interaction required)
 */
export const playFlutterSound = () => {
  const ctx = initAudioContext()
  if (!ctx) {
    // Fallback to simple flutter
    playSimpleFlutter()
    return
  }

  // Resume audio context if suspended (required by some browsers)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {
      // Silently fail if resume is not allowed
      return
    })
  }

  if (!flutterAudioBuffer) {
    initFlutterSound()
  }

  if (flutterAudioBuffer && ctx) {
    try {
      // Play multiple flutter sounds with slight delays for swarm effect
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          try {
            const source = ctx.createBufferSource()
            const gainNode = ctx.createGain()
            
            source.buffer = flutterAudioBuffer
            gainNode.gain.value = 0.05 + Math.random() * 0.03 // Slight volume variation
            
            source.connect(gainNode)
            gainNode.connect(ctx.destination)
            
            // Slight pitch variation for realism
            source.playbackRate.value = 0.9 + Math.random() * 0.2
            
            source.start()
            source.stop(ctx.currentTime + 0.08)
          } catch (error) {
            // Silently fail individual flutter sounds
          }
        }, i * 40) // Staggered flutter sounds (40ms apart)
      }
    } catch (error) {
      // Fallback to simple flutter
      playSimpleFlutter()
    }
  } else {
    // Fallback to simple flutter
    playSimpleFlutter()
  }
}

/**
 * Alternative: Use a simple beep if Web Audio API is not available
 */
export const playSimpleFlutter = () => {
  const ctx = initAudioContext()
  if (!ctx) return

  // Resume audio context if suspended
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {
      return
    })
  }

  try {
    // Play multiple quiet beeps for flutter effect
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        try {
          const oscillator = ctx.createOscillator()
          const gainNode = ctx.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(ctx.destination)

          oscillator.frequency.value = 700 + Math.random() * 500 // Random frequency
          oscillator.type = 'sine'
          gainNode.gain.value = 0.008 // Very quiet

          oscillator.start()
          oscillator.stop(ctx.currentTime + 0.04)
        } catch (error) {
          // Silently fail individual beeps
        }
      }, i * 35)
    }
  } catch (error) {
    // Silently fail if audio is not available
  }
}

/**
 * Play urgency alarm sound
 * Volume increases with delay days
 */
export const playUrgencySound = (volume = 0.1) => {
  const ctx = initAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  try {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Alarm-like frequency pattern
    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2)

    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)

    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.2)
  } catch (error) {
    // Silently fail
  }
}

/**
 * Play heartbeat sound
 * Gets faster and louder as delay increases
 */
let heartbeatInterval = null

export const playHeartbeatSound = (volume = 0.15) => {
  const ctx = initAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  // Clear existing heartbeat
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
  }

  const playBeat = () => {
    try {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Low-frequency heartbeat sound
      oscillator.frequency.value = 60
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05)
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)

      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.15)
    } catch (error) {
      // Silently fail
    }
  }

  // Play initial beat
  playBeat()

  // Continue playing at heartbeat rate (adjust based on urgency)
  const rate = volume > 0.2 ? 600 : 800 // Faster if louder
  heartbeatInterval = setInterval(playBeat, rate)

  // Stop after 10 seconds
  setTimeout(() => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
  }, 10000)
}

/**
 * Stop heartbeat sound
 */
export const stopHeartbeatSound = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}

