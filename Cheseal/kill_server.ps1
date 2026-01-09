# PowerShell Script: Kill and Restart Cheseal Server
# This script forcefully terminates any Python process running main.py

Write-Host "==================================================================================" -ForegroundColor Yellow
Write-Host "  CHESEAL SERVER PROCESS PURGE" -ForegroundColor Yellow
Write-Host "==================================================================================" -ForegroundColor Yellow
Write-Host ""

# Step 1: Find processes running main.py
Write-Host "[1/4] Searching for Python processes running main.py..." -ForegroundColor Cyan

# Get all Python processes with command line containing main.py
$processes = Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%main.py%' AND Name='python.exe' OR Name='pythonw.exe'"

if ($processes.Count -eq 0) {
    Write-Host "[INFO] No Python processes running main.py found." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[FOUND] $($processes.Count) process(es) running main.py:" -ForegroundColor Yellow
    foreach ($proc in $processes) {
        Write-Host "  PID: $($proc.ProcessId) | Command: $($proc.CommandLine)" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Step 2: Kill the processes
    Write-Host "[2/4] Terminating processes..." -ForegroundColor Cyan
    foreach ($proc in $processes) {
        try {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
            Write-Host "  [KILLED] PID $($proc.ProcessId)" -ForegroundColor Red
        } catch {
            Write-Host "  [ERROR] Failed to kill PID $($proc.ProcessId): $_" -ForegroundColor Red
        }
    }
    Write-Host ""
    
    # Step 3: Wait a moment and verify
    Write-Host "[3/4] Waiting 2 seconds for processes to terminate..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    
    $remaining = Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%main.py%' AND Name='python.exe' OR Name='pythonw.exe'"
    if ($remaining.Count -eq 0) {
        Write-Host "[VERIFIED] All processes terminated successfully." -ForegroundColor Green
    } else {
        Write-Host "[WARNING] $($remaining.Count) process(es) still running. Trying force kill..." -ForegroundColor Yellow
        foreach ($proc in $remaining) {
            try {
                taskkill /F /PID $proc.ProcessId
                Write-Host "  [FORCE KILLED] PID $($proc.ProcessId)" -ForegroundColor Red
            } catch {
                Write-Host "  [ERROR] Could not force kill PID $($proc.ProcessId)" -ForegroundColor Red
            }
        }
    }
    Write-Host ""
}

# Step 4: Final verification
Write-Host "[4/4] Final verification..." -ForegroundColor Cyan
$final_check = Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%main.py%' AND Name='python.exe' OR Name='pythonw.exe'"
if ($final_check.Count -eq 0) {
    Write-Host "[SUCCESS] No processes running main.py found. Server is stopped." -ForegroundColor Green
} else {
    Write-Host "[WARNING] $($final_check.Count) process(es) still detected:" -ForegroundColor Yellow
    foreach ($proc in $final_check) {
        Write-Host "  PID: $($proc.ProcessId)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "==================================================================================" -ForegroundColor Yellow
Write-Host "  To restart the server, run: python main.py" -ForegroundColor Cyan
Write-Host "==================================================================================" -ForegroundColor Yellow
Write-Host ""


