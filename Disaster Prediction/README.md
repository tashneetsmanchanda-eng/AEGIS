# Disaster & Disease Prediction System

A real-time flood risk and disease outbreak prediction dashboard for India, built with React and powered by live data from global flood monitoring systems.

**Created by:** Tasneet Singh Manchanda - Woxsen University

---

## 🌊 Data Sources

### Live APIs

| Source | Provider | Data Type | Update Frequency |
|--------|----------|-----------|------------------|
| [Open-Meteo Weather API](https://open-meteo.com/en/docs) | Open-Meteo | Temperature, humidity, rainfall, wind | Real-time |
| [Open-Meteo Flood API](https://open-meteo.com/en/docs/flood-api) | European Commission (GloFAS) | River discharge (m³/s) | Daily |

### Historical Data

| Source | Provider | Records | Coverage |
|--------|----------|---------|----------|
| [Dartmouth Flood Observatory](https://floodobservatory.colorado.edu) | University of Colorado | 263 India flood events | 1985-Present |
| [EM-DAT](https://www.emdat.be) | Centre for Research on the Epidemiology of Disasters | International disasters | 1900-Present |

**GloFAS** (Global Flood Awareness System) is operated by the **Copernicus Emergency Management Service** of the European Commission. It provides:
- Real-time river discharge forecasts
- Historical discharge averages (1984-present)
- 7-month flood forecasts

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 7.x | Build Tool & Dev Server |
| CSS3 | - | Glassmorphism UI, Animations |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | REST API Server |
| Uvicorn | ASGI Server |
| Python | 3.10+ |
| Pandas | Data Processing |
| Scikit-learn | Machine Learning |
| XGBoost | Gradient Boosting Models |

---

## 📁 Project Structure

```
Disaster Prediction/
├── dashboard-react/           # React Frontend
│   ├── src/
│   │   ├── App.tsx           # Main Dashboard Component
│   │   ├── App.css           # Glassmorphism Styles
│   │   ├── services/
│   │   │   ├── weatherApi.ts       # Open-Meteo Weather
│   │   │   ├── floodApi.ts         # GloFAS Flood Data
│   │   │   └── historicalFloodData.ts  # EMDAT/Dartmouth
│   │   └── data/
│   │       ├── locations.ts        # 36 States, 140+ Cities
│   │       └── indiaFloodHistory.json  # Processed Flood Records
│   └── package.json
├── api/                       # FastAPI Backend
│   ├── main.py               # API Endpoints
│   └── schemas.py            # Pydantic Models
├── models/                    # ML Models
│   ├── flood_model.py        # Flood Prediction
│   ├── disease_model.py      # Disease Outbreak
│   └── combined_predictor.py # Ensemble Model
├── data/                      # Data Processing
│   ├── feature_pipeline.py   # Feature Engineering
│   └── disease_data_generator.py
├── FloodArchive.xlsx          # Dartmouth Flood Data
├── disasterpredict.bat        # Windows Launch Script
└── README.md                  # This File
```

---

## 🚀 How to Run

### Quick Start (Windows)
```bash
# Double-click disasterpredict.bat
# Then open http://localhost:5173 in browser
```

### Manual Start
```bash
# Terminal 1 - Frontend
cd dashboard-react
npm install
npm run dev

# Terminal 2 - Backend (optional)
python -m uvicorn api.main:app --reload
```

---

## 📊 Features

- **Auto-detect location** on startup
- **36 Indian states/UTs** with 140+ cities
- **Real-time weather** from Open-Meteo
- **Live river discharge** from GloFAS (European Commission)
- **Historical flood records** from Dartmouth/EMDAT (263 events)
- **Disease outbreak prediction** (Malaria, Cholera, Leptospirosis, Hepatitis)
- **Glassmorphism UI** with animations

---

## 📚 References

1. **GloFAS** - Global Flood Awareness System  
   Copernicus Emergency Management Service, European Commission  
   https://www.globalfloods.eu

2. **Open-Meteo** - Free Weather API  
   https://open-meteo.com

3. **Dartmouth Flood Observatory**  
   University of Colorado  
   https://floodobservatory.colorado.edu

4. **EM-DAT** - International Disaster Database  
   Centre for Research on the Epidemiology of Disasters (CRED)  
   https://www.emdat.be

---

## 📄 License

This project was created for educational purposes at Woxsen University.

**Data Attribution:**
- Weather data: Open-Meteo (CC BY 4.0)
- Flood forecasts: Copernicus/GloFAS (Open License)
- Historical floods: Dartmouth Flood Observatory
