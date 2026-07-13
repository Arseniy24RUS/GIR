@echo off
setlocal
chcp 65001 >nul
title GIR Quick Local Start

set "ROOT=%~dp0"
set "HOST=127.0.0.1"
set "PORT=8011"
set "URL=http://%HOST%:%PORT%"
set "LOG_DIR=%ROOT%logs"
set "STDOUT_LOG=%LOG_DIR%\open_platform.stdout.log"
set "STDERR_LOG=%LOG_DIR%\open_platform.stderr.log"
set "PID_FILE=%LOG_DIR%\open_platform.pid"
set "PYTHONUTF8=1"
set "PYTHONIOENCODING=utf-8"
set "GIIP_LAUNCH_ROOT=%ROOT%"
set "GIIP_LAUNCH_HOST=%HOST%"
set "GIIP_LAUNCH_PORT=%PORT%"
set "GIIP_LAUNCH_STDOUT=%STDOUT_LOG%"
set "GIIP_LAUNCH_STDERR=%STDERR_LOG%"
set "GIIP_LAUNCH_PID=%PID_FILE%"

cd /d "%ROOT%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

where python >nul 2>nul
if errorlevel 1 (
    echo Python was not found in PATH.
    echo Install Python 3.12+ or open this project from an environment where python is available.
    if /i not "%GIIP_NO_PAUSE%"=="1" pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -UseBasicParsing -Uri '%URL%/api/health' -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } } catch {}; exit 1"
if errorlevel 1 (
    echo Starting GIR - Global Index Ranker...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $python=(Get-Command python).Source; $arguments=@('-m','giip.cli','runserver','--host',$env:GIIP_LAUNCH_HOST,'--port',$env:GIIP_LAUNCH_PORT); $process=Start-Process -FilePath $python -ArgumentList $arguments -WorkingDirectory $env:GIIP_LAUNCH_ROOT -WindowStyle Hidden -RedirectStandardOutput $env:GIIP_LAUNCH_STDOUT -RedirectStandardError $env:GIIP_LAUNCH_STDERR -PassThru; Set-Content -LiteralPath $env:GIIP_LAUNCH_PID -Value $process.Id -Encoding ascii"
    if errorlevel 1 (
        echo Could not start the GIR server.
        if exist "%STDERR_LOG%" type "%STDERR_LOG%"
        if /i not "%GIIP_NO_PAUSE%"=="1" pause
        exit /b 1
    )
) else (
    echo GIR - Global Index Ranker is already running.
)

echo Waiting for the platform to become ready...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$url = '%URL%/api/health'; $ready = $false; for ($i = 0; $i -lt 60; $i++) { try { $r = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2; if ($r.StatusCode -eq 200) { $ready = $true; break } } catch {}; Start-Sleep -Seconds 1 }; if ($ready) { exit 0 } else { exit 1 }"
if errorlevel 1 (
    echo The platform did not start within 60 seconds.
    echo Server log: %STDERR_LOG%
    if exist "%STDERR_LOG%" type "%STDERR_LOG%"
    if /i not "%GIIP_NO_PAUSE%"=="1" pause
    exit /b 1
)

if /i "%GIIP_NO_BROWSER%"=="1" (
    echo GIR is ready at %URL%.
    exit /b 0
)

echo Opening %URL% ...
start "" "%URL%"
exit /b 0
