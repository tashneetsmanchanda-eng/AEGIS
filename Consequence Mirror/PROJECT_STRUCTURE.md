# CHESEAL_INTEGRATED - Unified Project Structure

## 📁 Project Organization

```
CHESEAL_INTEGRATED/
├── backend/                    # Backend API (FastAPI)
│   ├── __init__.py
│   ├── main.py                 # Unified FastAPI entry point
│   ├── cheseal_brain.py        # AI Agent reasoning logic
│   ├── mirror_logic.py         # Consequence Mirror simulation engine
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # React Frontend (Vite)
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── Dashboard.jsx      # Analytics dashboard
│   │   ├── components/
│   │   │   ├── ConsequenceMirror.jsx      # Temporal simulation UI
│   │   │   ├── ButterflySwarm.jsx         # Butterfly Effect animation
│   │   │   ├── ReadinessGauge.jsx         # Readiness score gauge
│   │   │   ├── PulseAlert.jsx             # Critical alerts
│   │   │   └── WelcomeMessage.jsx         # Welcome transition
│   │   ├── hooks/
│   │   │   └── useButterflySwarm.js       # Butterfly trigger logic
│   │   └── utils/
│   │       └── soundEffects.js             # Audio utilities
│   ├── package.json
│   └── vite.config.js
│
└── README.md                   # Project documentation
```

---

## 🔗 Unified Backend (main.py)

### API Endpoints

1. **POST /analyze** - Cheseal AI Agent
   - Analyzes disaster risk using AI reasoning
   - Returns: disaster_type, risk_level, confidence, recommendations

2. **POST /simulate** - Consequence Mirror
   - Simulates temporal consequences (Day 0, 3, 10, 30)
   - Returns: timeline, readiness_score, impact layers

3. **GET /disaster-types** - Utility
   - Lists all available disaster types

4. **GET /health** - Health Check
   - API status verification

5. **GET /** - Root
   - API information and endpoint list

### CORS Configuration
- **Primary**: `http://localhost:5173` (Vite default)
- **Additional**: `localhost:3000`, `localhost:5174`
- **Methods**: All (`*`)
- **Headers**: All (`*`)
- **Credentials**: Enabled

---

## 🎬 Frontend Integration Flow

### State Management (App.jsx)

**Lifted State:**
- `riskData` - Simulation results
- `disasterType` - Predicted disaster
- `riskLevel` - Risk assessment
- `delayDays` - Intervention delay
- `readinessScore` - Readiness metric
- `analysisData` - AI Agent response

**Data Flow:**
```
User clicks "Analyze" 
  → POST /analyze (Cheseal AI)
  → AI Response received
  → 🦋 Butterfly Swarm triggers (first analysis only)
  → setDisasterType(response.disaster_type)
  → useEffect triggers
  → POST /simulate (Consequence Mirror)
  → setRiskData(simulation)
  → Dashboard + ConsequenceMirror update
```

### Component Hierarchy

```
App.jsx
├── ButterflySwarm (conditional - on AI analysis)
├── WelcomeMessage (after swarm)
└── Dashboard
    ├── Analytics Section
    └── ConsequenceMirror (conditional - when riskData exists)
        ├── ReadinessGauge
        ├── Timeline (Day 0, 3, 10, 30)
        └── Intervention Slider
```

---

## 🦋 Butterfly Effect Trigger

### Trigger Logic

**When**: AI Agent analysis completes successfully  
**Frequency**: Once per session (sessionStorage)  
**Location**: Center of screen (where analysis results appear)  
**Purpose**: Cinematic transition into Consequence Mirror timeline

### Implementation

```javascript
// In App.jsx - handleAnalyzeDisaster()
const response = await axios.post('http://localhost:8000/analyze', {...})
triggerOnAnalysis(response.data) // Triggers butterfly swarm

// In useButterflySwarm.js
const triggerOnAnalysis = (analysisData) => {
  const hasTriggered = sessionStorage.getItem('butterfly_swarm_triggered_session')
  if (hasTriggered === 'true') return // Already shown this session
  
  if (analysisData?.disaster_type) {
    setShowSwarm(true)
    sessionStorage.setItem('butterfly_swarm_triggered_session', 'true')
  }
}
```

### Session-Based Storage
- Uses `sessionStorage` (not `localStorage`)
- Resets when browser tab/window closes
- Allows animation to play again in new session

---

## 🚀 Running the Project

### Backend
```bash
cd backend
python main.py
```
Server: `http://127.0.0.1:8000`  
Docs: `http://127.0.0.1:8000/docs`

### Frontend
```bash
npm install
npm run dev
```
App: `http://localhost:5173`

---

## ✅ Integration Checklist

- ✅ Backend unified in `/backend` folder
- ✅ Frontend organized in `/src` folder
- ✅ AI Agent endpoint (`/analyze`) connected
- ✅ Consequence Mirror endpoint (`/simulate`) connected
- ✅ CORS configured for `localhost:5173`
- ✅ State management flows from AI → Mirror
- ✅ Butterfly Swarm triggers on AI analysis
- ✅ Session-based trigger (once per session)
- ✅ ConsequenceMirror receives props from App.jsx
- ✅ Readiness Gauge updates in real-time

---

## 📊 User Flow

1. **User opens app** → Dashboard displays
2. **User clicks "Analyze Disaster Risk"** → Loading state
3. **AI Agent analyzes** → POST /analyze
4. **Response received** → 🦋 Butterfly Swarm animation (first time only)
5. **Welcome message** → Brief transition
6. **Simulation auto-triggers** → POST /simulate
7. **ConsequenceMirror reveals** → Timeline with Day 0, 3, 10, 30
8. **User adjusts slider** → Real-time updates across all components

---

## 🎯 Key Features

- **Unified Backend**: Single FastAPI app with both AI and Simulation
- **Seamless Integration**: AI results automatically trigger simulation
- **Cinematic Transitions**: Butterfly Swarm on first analysis
- **Real-Time Updates**: Slider changes update all components instantly
- **Session-Based Animation**: Butterfly plays once per session
- **Professional Structure**: Clean, organized, production-ready

---

**Project Status**: ✅ Fully Integrated and Operational

