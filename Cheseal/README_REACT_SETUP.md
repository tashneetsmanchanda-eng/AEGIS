# Cheseal Intelligence - React Frontend Setup

## Quick Start

### 1. Install Dependencies

In your React project directory:

```bash
npm install axios
```

### 2. Import and Use the Component

```jsx
import ChesealAnalyzer from './ChesealAnalyzer';
import { useState } from 'react';

function App() {
  // Your dashboard state (example)
  const [dashboardState] = useState({
    city: 'Miami',
    flood_risk: 0.85,
    predicted_disease: 'Cholera',
    confidence: 0.92
  });

  return (
    <div className="App">
      <ChesealAnalyzer dashboardState={dashboardState} />
    </div>
  );
}
```

### 3. Start Both Servers

**Terminal 1 (Backend):**
```bash
cd C:\Cheseal
.venv\Scripts\Activate.ps1
python main.py
```

**Terminal 2 (Frontend):**
```bash
cd your-react-project
npm run dev
```

## Features

✅ **CORS Enabled** - Backend allows requests from `http://localhost:5173`  
✅ **Loading States** - Button shows spinner during AI processing  
✅ **Error Handling** - User-friendly alerts for connection/API errors  
✅ **Chat Bubble UI** - Modern Tailwind CSS styling  
✅ **Risk Level Colors** - Critical (Red), Warning (Yellow), Safe (Green)  
✅ **Reasoning Toggle** - View ReAct Thought/Action/Observation trace  

## Component Props

- `dashboardState` (object, required): Current dashboard state with:
  - `city` (string)
  - `flood_risk` (number, 0-1)
  - `predicted_disease` (string)
  - `confidence` (number, 0-1)

## API Endpoint

The component calls: `POST http://localhost:8000/analyze`

Request body:
```json
{
  "question": "Analyze the current crisis situation...",
  "dashboard_state": { ... }
}
```

Response:
```json
{
  "response": "Cheseal's analysis...",
  "risk_level": "Critical|Warning|Safe",
  "reasoning": "ReAct trace information..."
}
```

