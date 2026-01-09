# Unified Integration - Dashboard & Consequence Mirror

## ✅ Backend Consolidation (main.py)

### APIRouter Structure
The backend now uses distinct APIRouter instances for clear separation:

1. **Cheseal Router** (`/analyze`)
   - Prefix: `/analyze`
   - Tag: "Cheseal AI"
   - Endpoint: `POST /analyze` - Disaster risk analysis

2. **Mirror Router** (`/simulate`)
   - Prefix: `/simulate`
   - Tag: "Consequence Mirror"
   - Endpoint: `POST /simulate` - Temporal consequence simulation

3. **Utility Router**
   - Tag: "Utility"
   - Endpoints: `/disaster-types`, `/health`

### CORS Configuration
- Single CORSMiddleware configuration
- Primary port: `http://localhost:5173` (Vite default)
- Also supports: `localhost:3000`, `localhost:5174`

---

## ✅ Frontend Connectivity (App.jsx)

### Lifted State
All global state is now managed in `App.jsx` and shared between components:

```javascript
// Lifted State in App.jsx
const [riskData, setRiskData] = useState(null)        // Shared with Mirror
const [disasterType, setDisasterType] = useState(null) // Shared
const [riskLevel, setRiskLevel] = useState(null)      // Shared
const [delayDays, setDelayDays] = useState(0)          // Shared
const [readinessScore, setReadinessScore] = useState(100) // Shared
const [analysisData, setAnalysisData] = useState(null)   // Shared
```

### State Flow
1. **Dashboard** receives props from App.jsx
2. **ConsequenceMirror** receives `riskData` from App.jsx
3. **Intervention Slider** updates `delayDays` → triggers simulation → updates `riskData` → updates `readinessScore`
4. **Readiness Gauge** updates in real-time from `readinessScore`
5. **Human Impact scenes** rewrite automatically when `riskData` changes

---

## ✅ Pulsing Button & Smooth Scroll

### Pulsing "View Mirror" Button
- Located in dashboard header
- Uses Framer Motion for pulsing animation
- Scale animation: 1 → 1.05 → 1 (infinite loop)
- Glowing box-shadow effect
- Hover effects for interactivity

### Smooth Scroll Transition
- Uses `scrollIntoView` with `behavior: 'smooth'`
- Scrolls to Mirror section when button clicked
- `scroll-margin-top: 100px` for proper offset
- Smooth continuity from dashboard to Mirror

---

## ✅ Real-Time Updates

### Intervention Delay Slider
When user moves the slider in ConsequenceMirror:

1. **Immediate Callback**: `onInterventionChange(newDelay)` called
2. **State Update**: `setDelayDays(newDelay)` in App.jsx
3. **Automatic Simulation**: `useEffect` triggers simulation fetch
4. **Data Update**: `setRiskData(response.data)` updates all data
5. **Readiness Update**: `setReadinessScore(response.data.readiness_score)`
6. **Gauge Update**: ReadinessGauge receives new score → updates color/gradient
7. **Scene Rewrite**: All Human/Infrastructure/Health scenes update with new data
8. **Pulse Alert**: If score < 50, Pulse Alert appears automatically

### Unified Story Flow
```
User moves slider
  ↓
delayDays updates
  ↓
Simulation API called
  ↓
riskData updates
  ↓
ReadinessGauge updates (color, gradient, pulsing)
  ↓
All timeline cards rewrite (Human/Infrastructure/Health scenes)
  ↓
Pulse Alert appears if score < 50
```

---

## Component Architecture

### App.jsx (State Manager)
- Manages all global state
- Handles API calls
- Coordinates between Dashboard and Mirror
- Provides callbacks to child components

### Dashboard.jsx (Display Component)
- Receives props from App.jsx
- Displays analysis results
- Shows readiness score
- Contains pulsing "View Mirror" button
- No internal state management (fully controlled)

### ConsequenceMirror.jsx (Display Component)
- Receives `riskData` from App.jsx
- Calls `onInterventionChange` when slider moves
- Displays timeline with rewrite animations
- Shows Pulse Alert when score < 50
- No internal state management (fully controlled)

---

## User Flow

1. **User clicks "Analyze Disaster Risk"**
   - Calls `/analyze` endpoint (Cheseal AI)
   - Receives disaster prediction
   - Automatically triggers simulation

2. **User clicks "🔎 View Future Consequence Mirror"**
   - Smooth scroll to Mirror section
   - Timeline appears with fade-in animations

3. **User moves Intervention Slider**
   - Real-time update of readiness score
   - Gauge color changes dynamically
   - All scenes rewrite with new consequences
   - Pulse Alert appears if critical

4. **Unified Experience**
   - All updates happen instantly
   - No page refreshes
   - Smooth animations throughout
   - Consistent state across components

---

## Files Updated

- `backend/main.py` - Refactored with distinct APIRouters
- `src/App.jsx` - Lifted state, manages global state
- `src/Dashboard.jsx` - Receives props, displays data
- `src/App.css` - Added mirror section styles
- `src/Dashboard.css` - Enhanced button styles, added analysis details

---

## Key Features

✅ **Unified Backend**: Distinct routes for Cheseal and Mirror  
✅ **Lifted State**: Shared state between Dashboard and Mirror  
✅ **Pulsing Button**: Animated button to view Mirror  
✅ **Smooth Scroll**: Seamless transition to Mirror  
✅ **Real-Time Updates**: Instant updates when slider moves  
✅ **Unified Story**: All components stay in sync  

The integration is complete and provides a seamless, unified user experience!

