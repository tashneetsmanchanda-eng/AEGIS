# Butterfly Swarm Animation

## ✅ One-Time Trigger System

### localStorage Implementation
- Checks for `has_seen_butterfly` key on component mount
- If key doesn't exist, animation is ready to trigger
- On first click/touch, sets key to `true` in localStorage
- Animation will never trigger again for that user

### Trigger Mechanism
- Listens for click/touch events on the main App container
- Captures click coordinates (x, y)
- Triggers animation from click point
- Works on both mouse clicks and touch events

---

## ✅ Butterfly Swarm Animation (Framer Motion)

### Butterfly Generation
- **Count**: 15-20 butterflies (randomized)
- **Colors**: Vibrant palette including:
  - Blues (#4A90E2)
  - Oranges (#E2B84A, #E24A4A)
  - Purples (#9B4AE2)
  - Cyans (#4AE2B8)
  - Pinks (#E24AD4)
  - Greens (#4AE24A)
  - Yellows (#E2E24A)

### Flight Path Animation
- **Origin**: Click/touch point coordinates
- **Destination**: Random points at screen edges
- **Path Type**: Parabolic arcs
- **Animation**: 
  - Uses Framer Motion's `animate` prop
  - Three-point path: start → mid (arc peak) → end
  - Random arc heights (100-300px)
  - Random distances (300-700px)
  - Random angles for flight direction
  - Staggered delays (0-0.5s) for natural swarm effect

### Wing Flap Animation
- **Frequency**: ~12.5Hz (80ms per cycle)
- **Animation**: ScaleY from 1 → 0.3 → 1
- **Implementation**: Framer Motion variants with `repeat: Infinity`
- **Realism**: Left and right wings have 40ms offset for natural flapping
- **Smooth**: Uses `easeInOut` for natural motion

---

## ✅ Visual Feedback

### Glow & Trail Effects
- **Butterfly Glow**: Radial gradient glow around each butterfly
- **Pulsing Glow**: Animated pulse effect (0.2-0.4 opacity)
- **Drop Shadows**: Colored drop shadows matching butterfly color
- **Sparkle Effect**: Small white sparkles on wings
- **Trail**: Subtle glow trail that follows butterfly movement

### Fade Out Animation
- **Duration**: 7 seconds total
- **Fade Start**: At 85% (5.95s)
- **Complete Fade**: At 100% (7s)
- **Unmount**: After fade completes (7.5s)
- **Smooth**: Uses CSS keyframe animation

---

## ✅ Sound Effects (Optional/Subtle)

### Implementation
- **Primary**: Web Audio API with generated flutter sound
- **Fallback**: Simple oscillator-based beep
- **Volume**: Very quiet (0.01 gain)
- **Pattern**: Staggered flutter sounds (3 sounds, 50ms apart)
- **Frequency**: Random (800-1200Hz) for variation
- **Graceful Failure**: Silently fails if audio is unavailable

### Sound Generation
- Creates white noise with envelope
- Short duration (0.1s per flutter)
- Multiple flutters for swarm effect
- Very low volume to be subtle

---

## Component Structure

### ButterflySwarm.jsx
- Main animation component
- Generates butterflies on mount
- Handles fade out and unmount
- Triggers sound effects

### useButterflySwarm.js (Custom Hook)
- Manages localStorage check
- Handles click/touch events
- Tracks animation state
- Provides callbacks

### soundEffects.js (Utility)
- Web Audio API implementation
- Flutter sound generation
- Fallback mechanisms
- Error handling

---

## Integration

### App.jsx Integration
```javascript
// Hook usage
const {
  showSwarm,
  triggerPoint,
  handleFirstClick,
  handleSwarmComplete,
} = useButterflySwarm()

// Event handlers
<div onClick={handleFirstClick} onTouchStart={handleFirstClick}>
  {/* Butterfly Swarm */}
  {showSwarm && (
    <ButterflySwarm
      triggerPoint={triggerPoint}
      onComplete={handleSwarmComplete}
    />
  )}
</div>
```

---

## Animation Details

### Butterfly Properties
- **Size**: 20-35px (randomized)
- **Color**: Random from vibrant palette
- **Position**: Starts at click point
- **Rotation**: Follows flight direction
- **Opacity**: Fades in → full → fades out

### Flight Characteristics
- **Speed**: 3 seconds per butterfly
- **Arc Height**: 100-300px above direct path
- **Direction**: 360° spread from click point
- **Stagger**: 0-0.5s delay between butterflies

### Visual Effects
- **Wing Flapping**: Continuous at ~12.5Hz
- **Glow**: Pulsing radial gradient
- **Sparkles**: Animated white dots
- **Shadows**: Colored drop shadows
- **Trail**: Subtle glow following path

---

## User Experience

1. **First Visit**: User clicks anywhere → Butterflies swarm from click point
2. **Subsequent Visits**: No animation (localStorage remembers)
3. **Visual Impact**: Beautiful, memorable first impression
4. **Performance**: Smooth 60fps animation
5. **Accessibility**: Works with touch and mouse
6. **Sound**: Subtle, optional flutter sounds

---

## Files Created

- `src/components/ButterflySwarm.jsx` - Main animation component
- `src/components/ButterflySwarm.css` - Animation styles
- `src/hooks/useButterflySwarm.js` - Custom hook for state management
- `src/utils/soundEffects.js` - Sound effect utilities
- `src/App.jsx` - Updated with integration

---

## Testing

To test the animation:
1. Clear localStorage: `localStorage.removeItem('has_seen_butterfly')`
2. Refresh the page
3. Click anywhere on the dashboard
4. Watch the butterfly swarm animation!

The animation is complete and ready to create a magical first impression! 🦋

