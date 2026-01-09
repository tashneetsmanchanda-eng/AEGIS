# Kill Zombie Server Process
# Finds and forcefully terminates any Python process running main.py

Write-Host "Searching for processes running main.py..." -ForegroundColor Cyan

$processes = Get-CimInstance Win32_Process | Where-Object { 
    $_.CommandLine -like "*main.py*" -and ($_.Name -eq "python.exe" -or $_.Name -eq "pythonw.exe") 
}

if ($processes) {
    foreach ($proc in $processes) {
        Write-Host "Found PID $($proc.ProcessId): $($proc.CommandLine)" -ForegroundColor Yellow
        Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
        Write-Host "  -> Killed" -ForegroundColor Red
    }
    Write-Host "`nZombie Server Killed" -ForegroundColor Green
} else {
    Write-Host "No processes running main.py found." -ForegroundColor Green
}

Write-Host "`nTo restart, run: python main.py" -ForegroundColor Cyan


