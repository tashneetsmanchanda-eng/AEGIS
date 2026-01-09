# PowerShell script to kill any process using port 8000
# Usage: .\kill_port_8000.ps1

Write-Host "Checking for processes on port 8000..." -ForegroundColor Yellow

try {
    $connections = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
    
    if ($connections) {
        $processes = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        
        foreach ($pid in $processes) {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "Killing process: $($process.ProcessName) (PID: $pid)" -ForegroundColor Red
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        
        Write-Host "Port 8000 is now free." -ForegroundColor Green
    } else {
        Write-Host "No processes found on port 8000." -ForegroundColor Green
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

