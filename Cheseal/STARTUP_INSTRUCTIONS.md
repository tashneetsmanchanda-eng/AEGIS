# 🚀 Cheseal Intelligence - Startup Instructions

## ✅ Port 8000 Status
Port 8000 has been cleared and is ready for use.

## 📋 Startup Sequence

### Step 1: Start the Backend (FastAPI Server)

**Open Terminal 1 (PowerShell):**
```powershell
cd C:\Cheseal
.venv\Scripts\Activate.ps1
python main.py
```

**Expected Output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

✅ **Backend is ready when you see:** `Uvicorn running on http://0.0.0.0:8000`

---

### Step 2: Start the Frontend (React App)

**Open Terminal 2 (PowerShell or Command Prompt):**
```bash
cd your-react-project-directory
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ **Frontend is ready when you see:** `Local: http://localhost:5173/`

---

## 🧪 Testing the Integration

### 1. Open Your React App
Navigate to: `http://localhost:5173`

### 2. Click "🤖 Run AI Analysis" Button

### 3. Watch the Magic Happen:

**In React UI:**
- Button changes to: "Cheseal is thinking..." with spinner
- Response appears in chat bubble
- Risk badge shows (🔴 Critical / ⚠️ Warning / ✅ Safe)

**In Python Terminal:**
- You'll see the ReAct reasoning trace:
  ```
  Thought: I need to analyze...
  Action: AnalyzeRiskData
  Observation: ...
  Final Answer: ...
  ```

---

## 🔍 Verification Checklist

Before testing, verify:

- [ ] Backend is running on port 8000
- [ ] Frontend is running on port 5173
- [ ] No errors in Python terminal
- [ ] No CORS errors in browser console
- [ ] `.env` file has `GROQ_API_KEY` set

---

## 🛠️ Troubleshooting

### Port 8000 Still in Use?
```powershell
# Find what's using the port
Get-NetTCPConnection -LocalPort 8000

# Kill it
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force
```

### CORS Errors?
- Verify `main.py` has CORSMiddleware configured
- Check React is running on port 5173
- Ensure `allow_origins=["http://localhost:5173"]` in main.py

### Connection Refused?
- Ensure backend is running: `python main.py`
- Check backend shows: `Uvicorn running on http://0.0.0.0:8000`
- Verify no firewall blocking port 8000

### API Key Errors?
- Check `.env` file exists
- Verify `GROQ_API_KEY=your_key_here`
- Restart backend after changing `.env`

---

## 📊 Expected Flow

```
User clicks "Run AI Analysis"
    ↓
Button: "Cheseal is thinking..." (spinner)
    ↓
Axios POST → http://localhost:8000/analyze
    ↓
Backend processes (CORS allows)
    ↓
Python terminal: Shows ReAct reasoning
    ↓
Response returned to React
    ↓
UI: Chat bubble with response
    ↓
Button: Ready for next analysis
```

---

## 🎯 Success Indicators

✅ **Backend Working:**
- No errors in Python terminal
- `INFO: Uvicorn running on http://0.0.0.0:8000`

✅ **Frontend Working:**
- Button clickable
- Loading state shows spinner
- Response appears in chat bubble

✅ **Integration Working:**
- No CORS errors in browser console
- Response received from backend
- Risk badge displays correctly

---

**Ready to launch! 🚀**

