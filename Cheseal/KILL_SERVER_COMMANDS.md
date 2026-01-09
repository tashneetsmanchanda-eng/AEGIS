# PowerShell Commands to Kill and Restart Cheseal Server

## Quick One-Liner (Copy-Paste Ready)

```powershell
Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*main.py*" } | Stop-Process -Force; Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*main.py*" -or (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)" | Select-Object -ExpandProperty CommandLine) -like "*main.py*" } | Stop-Process -Force
```

## Step-by-Step Commands (Recommended)

### Step 1: Find Processes Running main.py

```powershell
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*main.py*" -and ($_.Name -eq "python.exe" -or $_.Name -eq "pythonw.exe") } | Select-Object ProcessId, CommandLine
```

### Step 2: Kill All Python Processes (Safe - kills all Python processes)

```powershell
Get-Process python* -ErrorAction SilentlyContinue | Stop-Process -Force
```

**OR** More targeted (only if main.py is in command line):

```powershell
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*main.py*" -and ($_.Name -eq "python.exe" -or $_.Name -eq "pythonw.exe") } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

### Step 3: Verify Processes Are Dead

```powershell
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*main.py*" -and ($_.Name -eq "python.exe" -or $_.Name -eq "pythonw.exe") } | Select-Object ProcessId, CommandLine
```

Should return nothing if all processes are killed.

### Step 4: Restart Server

```powershell
python main.py
```

## Alternative: Simple Kill All Python (Fastest but less precise)

If you want to kill ALL Python processes (including test scripts):

```powershell
Get-Process python* -ErrorAction SilentlyContinue | Stop-Process -Force
```

Then restart:
```powershell
python main.py
```


