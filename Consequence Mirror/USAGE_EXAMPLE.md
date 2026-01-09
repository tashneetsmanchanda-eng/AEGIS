# ConsequenceMirror Component Usage

## Overview

`ConsequenceMirror` is a controlled, reusable React component designed for seamless integration into dashboards. It visualizes disaster consequences with a cinematic timeline and real-time intervention controls.

## Props API

### `currentRiskData` (Object, required)
The simulation data object with the following structure:

```javascript
{
  disaster_type: string,        // e.g., "Flood", "Volcano"
  delay_days: number,           // 0-7 days of intervention delay
  readiness_score: number,       // 0-100 Early-Warning Readiness Score
  timeline: [                    // Array of phase objects
    {
      phase: string,            // e.g., "Day 0 - Initial Impact"
      day: string,              // "0", "3", "10", "30"
      human_layer: {
        scene: string           // Human impact narrative
      },
      infrastructure_layer: {
        scene: string           // Infrastructure impact narrative
      },
      health_layer: {
        scene: string           // Health impact narrative
      },
      displaced_families: number,
      readiness_score: number,
      chain_reactions: string[]  // Array of chain reaction tags
    }
  ]
}
```

### `onInterventionChange` (Function, required)
Callback function that receives the new delay days value when the slider is moved.

```javascript
onInterventionChange: (delayDays: number) => void
```

## Basic Integration Example

```javascript
import React, { useState, useEffect } from 'react'
import ConsequenceMirror from './components/ConsequenceMirror'
import axios from 'axios'

function MyDashboard() {
  const [riskData, setRiskData] = useState(null)
  const [delayDays, setDelayDays] = useState(0)

  useEffect(() => {
    // Fetch simulation data from your API
    const fetchData = async () => {
      const response = await axios.post('/api/simulate', {
        disaster_type: 'Flood',
        delay_days: delayDays
      })
      setRiskData(response.data)
    }
    fetchData()
  }, [delayDays])

  const handleInterventionChange = (newDelay) => {
    setDelayDays(newDelay)
    // Your dashboard can handle this change however needed
    // The useEffect will automatically fetch new data
  }

  return (
    <div>
      <ConsequenceMirror
        currentRiskData={riskData}
        onInterventionChange={handleInterventionChange}
      />
    </div>
  )
}
```

## Features

### 1. Vertical Scroll Timeline
- Cards fade in as user scrolls using Framer Motion `whileInView`
- Smooth animations with blur effects
- Each phase (Day 0, 3, 10, 30) appears sequentially

### 2. Layered Mirror
- Three distinct layers per card:
  - 🏠 **Human Layer** - Personal impact narratives
  - ⚡ **Infrastructure Layer** - System failures and breakdowns
  - 🏥 **Health Layer** - Medical and health consequences
- Staggered animations for each layer

### 3. Real-time Rewrite Animation
- When the intervention slider changes, cards show a "rewrite" effect
- Content blurs and fades to show the future being altered
- Visual feedback that consequences are being recalculated

### 4. Sticky Intervention Slider
- Fixed at the bottom of the viewport
- Prominent, glowing red slider
- Updates in real-time as user drags

### 5. Risk-based Glitch Effects
- High-risk phases (Day 10+, delay 5+ days) show glitch animations
- Critical phases (Day 10+, delay 5+ days) have stronger visual warnings
- Color-coded borders (green → yellow → orange → red)

## Styling

The component uses CSS Modules (`.module.css`) to prevent style leakage:
- All styles are scoped to the component
- Mission Control theme (deep blacks, warning reds) is contained
- Won't affect your main dashboard styles

## Dependencies

- `react` (^18.2.0)
- `framer-motion` (^10.16.4)
- `ReadinessGauge` component (included)

## Notes

- Component is fully controlled - it doesn't manage its own state
- All data comes from props
- Callback pattern allows parent to control when/how data updates
- Designed for integration into existing dashboards

