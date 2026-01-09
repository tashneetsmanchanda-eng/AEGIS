# Consequence Mirror

A high-visibility, cinematic simulation engine that models the 'Butterfly Effect' of disaster delays. This standalone module visualizes cascading consequences across 4 temporal phases with a mission control aesthetic.

## Features

- **Temporal State Machine**: Simulates cascading risks over 4 phases (Day 0, Day 3, Day 10, Day 30)
- **Chain Reaction Logic**: 10 disaster types with specific secondary triggers
- **Intervention Multiplier**: Exponential impact scaling based on delay days (0-7)
- **Cinematic UI**: Vertical scroll timeline with Framer Motion animations and glitch effects
- **Layered Visuals**: Three distinct status layers (Human, Infrastructure, Health)
- **Real-time Readiness Gauge**: Sticky circular gauge showing Early-Warning Readiness Score

## Project Structure

```
Consequence Mirror/
├── mirror_logic.py          # Core simulation engine
├── api_server.py            # FastAPI backend server
├── requirements.txt         # Python dependencies
├── package.json            # Node.js dependencies
├── vite.config.js          # Vite configuration
├── index.html              # HTML entry point
└── src/
    ├── main.jsx           # React entry point
    ├── App.jsx            # Main app component
    ├── index.css          # Global styles
    └── components/
        ├── ConsequenceMirror.jsx    # Main timeline component
        ├── ConsequenceMirror.css    # Timeline styles
        ├── ReadinessGauge.jsx       # Readiness gauge component
        └── ReadinessGauge.css       # Gauge styles
```

## Setup Instructions

### Backend Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Start the FastAPI server:
```bash
python api_server.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### POST /simulate
Simulate disaster consequences based on type and intervention delay.

**Request:**
```json
{
  "disaster_type": "Flood",
  "delay_days": 3
}
```

**Response:**
```json
{
  "disaster_type": "Flood",
  "delay_days": 3,
  "readiness_score": 45.2,
  "timeline": [
    {
      "phase": "Day 0 - Initial Impact",
      "day": "0",
      "human_layer": {...},
      "infrastructure_layer": {...},
      "health_layer": {...},
      "displaced_families": 1234,
      "readiness_score": 45.2,
      "chain_reactions": [...]
    },
    ...
  ]
}
```

### GET /disaster-types
Get list of available disaster types.

## Disaster Types

- Volcano
- Cyclone
- Tsunami
- Earthquake
- Flood
- Wildfire
- Drought
- Pandemic
- Terrorism
- Nuclear

## Visual Design

- **Color Scheme**: Deep blacks (#000000), high-contrast red/white text
- **Aesthetic**: Mission Control feel with glowing effects
- **Typography**: Courier New monospace font
- **Animations**: Framer Motion with glitch effects for high-risk phases

## Usage

1. Select a disaster type from the dropdown
2. Adjust the intervention delay slider (0-7 days)
3. Watch the readiness score update in real-time
4. Scroll through the timeline to see cascading consequences
5. Observe the three layers (Human, Infrastructure, Health) for each phase

The simulation demonstrates how each day of delay exponentially increases human impact and decreases early-warning readiness.

