# Backend Setup Instructions

## Project Structure

```
Consequence Mirror/
├── backend/
│   ├── __init__.py
│   ├── main.py              # Unified entry point
│   ├── mirror_logic.py      # Consequence Mirror simulation engine
│   └── cheseal_brain.py     # Cheseal AI Agent (placeholder)
├── requirements.txt
└── ...
```

## Running the Backend

1. **Install Dependencies:**
```bash
pip install -r requirements.txt
```

2. **Run from Project Root:**
```bash
# From the project root directory
cd backend
python main.py
```

Or using uvicorn directly:
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### POST /analyze
Cheseal AI Agent disaster analysis endpoint.

**Request:**
```json
{
  "location": "Coastal Region",
  "risk_factors": {
    "seismic_activity": 6.5,
    "weather_patterns": "unstable"
  },
  "historical_data": {}
}
```

**Response:**
```json
{
  "disaster_type": "Tsunami",
  "risk_level": "high",
  "confidence": 0.75,
  "reasoning": "Based on analysis...",
  "predicted_impact": {...},
  "recommendations": [...]
}
```

### POST /simulate
Consequence Mirror simulation endpoint.

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
  "timeline": [...]
}
```

### GET /disaster-types
Get list of available disaster types.

### GET /health
Health check endpoint.

## CORS Configuration

The backend is configured to accept requests from:
- http://localhost:5173 (Vite default)
- http://localhost:3000 (React default)
- http://localhost:5174 (Vite alternative)

## Notes

- The ChesealAgent in `cheseal_brain.py` is a placeholder. Replace with actual LangChain/Groq integration.
- All backend logic is consolidated in the `/backend` folder.
- The unified `main.py` serves as the single entry point for all endpoints.

