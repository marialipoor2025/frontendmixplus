# Shared helpers for MixPlus production deploy on Windows.
# Dot-source from full-deploy.ps1 / fast-deploy.ps1.

$script:MixPlusRepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$script:MixPlusFrontendDir = Join-Path $MixPlusRepoRoot "frontend"
$script:MixPlusApiProject = Join-Path $MixPlusRepoRoot "backend\src\Host\MixPlus.Api\MixPlus.Api.csproj"
$script:MixPlusApiLogDir = Join-Path $MixPlusRepoRoot "backend\logs"
$script:MixPlusFrontendLogDir = Join-Path $MixPlusFrontendDir "logs"
$script:MixPlusFrontendPort = 3000
$script:MixPlusApiPort = 5080
$script:MixPlusFrontendHost = "0.0.0.0"
$script:MixPlusApiUrl = "http://0.0.0.0:$MixPlusApiPort"
$script:MixPlusNodeExe = "C:\Program Files\nodejs\node.exe"

function Write-MixPlusStep {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Get-MixPlusPublicIp {
    $ip = "127.0.0.1"
    try {
        $detected = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
            Where-Object {
                $_.IPAddress -notlike "127.*" -and
                $_.IPAddress -notlike "169.254.*"
            } |
            Select-Object -First 1 -ExpandProperty IPAddress
        if ($detected) { $ip = $detected }
    } catch {}
    return $ip
}

function Ensure-MixPlusFirewallRule {
    param(
        [string]$Name,
        [int]$Port
    )
    netsh advfirewall firewall delete rule name="$Name" | Out-Null
    netsh advfirewall firewall add rule name="$Name" dir=in action=allow protocol=TCP localport=$Port | Out-Null
}

function Stop-MixPlusFrontend {
    Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
        Where-Object {
            $_.CommandLine -match "frontendmixplus" -and (
                $_.CommandLine -match "next" -or $_.CommandLine -match "start-server"
            )
        } |
        ForEach-Object {
            Write-Host "Stopping frontend PID $($_.ProcessId)"
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        }

    $listeners = Get-NetTCPConnection -State Listen -LocalPort $MixPlusFrontendPort -ErrorAction SilentlyContinue
    foreach ($listener in $listeners) {
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)" -ErrorAction SilentlyContinue
        if ($proc -and $proc.CommandLine -match "frontendmixplus|next") {
            Write-Host "Stopping frontend on port $MixPlusFrontendPort (PID $($listener.OwningProcess))"
            Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}

function Stop-MixPlusApi {
    Get-CimInstance Win32_Process -Filter "Name='dotnet.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -match "MixPlus\.Api" } |
        ForEach-Object {
            Write-Host "Stopping API PID $($_.ProcessId)"
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        }

    $listeners = Get-NetTCPConnection -State Listen -LocalPort $MixPlusApiPort -ErrorAction SilentlyContinue
    foreach ($listener in $listeners) {
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)" -ErrorAction SilentlyContinue
        if ($proc -and $proc.CommandLine -match "MixPlus\.Api|dotnet") {
            Write-Host "Stopping API on port $MixPlusApiPort (PID $($listener.OwningProcess))"
            Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}

function Build-MixPlusBackend {
    Write-MixPlusStep "Building backend (Release)"
    Push-Location $MixPlusRepoRoot
    try {
        dotnet build $MixPlusApiProject -c Release
        if ($LASTEXITCODE -ne 0) {
            throw "Backend build failed with exit code $LASTEXITCODE"
        }
    } finally {
        Pop-Location
    }
}

function Build-MixPlusFrontend {
    Write-MixPlusStep "Building frontend (production)"
    Push-Location $MixPlusFrontendDir
    try {
        if (-not (Test-Path "node_modules")) {
            Write-Host "node_modules missing; running npm ci"
            npm ci
            if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE" }
        }
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "Frontend build failed with exit code $LASTEXITCODE"
        }
    } finally {
        Pop-Location
    }
}

function Start-MixPlusApi {
    param([switch]$NoBuild)

    New-Item -ItemType Directory -Force -Path $MixPlusApiLogDir | Out-Null
    Ensure-MixPlusFirewallRule -Name "MixPlus API $MixPlusApiPort" -Port $MixPlusApiPort

    $outLog = Join-Path $MixPlusApiLogDir "api.out.log"
    $errLog = Join-Path $MixPlusApiLogDir "api.err.log"

    $args = @(
        "run",
        "--project", $MixPlusApiProject,
        "--urls", $MixPlusApiUrl
    )
    if ($NoBuild) {
        $args += @("-c", "Release", "--no-build")
    }

    Write-MixPlusStep "Starting API on $MixPlusApiUrl"
    Start-Process -FilePath "dotnet" -ArgumentList $args -WorkingDirectory $MixPlusRepoRoot `
        -WindowStyle Hidden -RedirectStandardOutput $outLog -RedirectStandardError $errLog
}

function Start-MixPlusFrontend {
    New-Item -ItemType Directory -Force -Path $MixPlusFrontendLogDir | Out-Null
    Ensure-MixPlusFirewallRule -Name "MixPlus Frontend $MixPlusFrontendPort" -Port $MixPlusFrontendPort

    if (-not (Test-Path (Join-Path $MixPlusFrontendDir ".next"))) {
        throw "Missing frontend build (.next). Run scripts/deploy/full-deploy.ps1 first."
    }

    if (-not (Test-Path $MixPlusNodeExe)) {
        throw "Node.js not found at $MixPlusNodeExe"
    }

    $nextBin = Join-Path $MixPlusFrontendDir "node_modules\next\dist\bin\next"
    $outLog = Join-Path $MixPlusFrontendLogDir "mixplus.out.log"
    $errLog = Join-Path $MixPlusFrontendLogDir "mixplus.err.log"

    $args = @(
        $nextBin,
        "start",
        "-H", $MixPlusFrontendHost,
        "-p", "$MixPlusFrontendPort"
    )

    Write-MixPlusStep "Starting frontend on http://${MixPlusFrontendHost}:$MixPlusFrontendPort"
    Start-Process -FilePath $MixPlusNodeExe -ArgumentList $args -WorkingDirectory $MixPlusFrontendDir `
        -WindowStyle Hidden -RedirectStandardOutput $outLog -RedirectStandardError $errLog
}

function Wait-MixPlusPort {
    param(
        [int]$Port,
        [int]$TimeoutSeconds = 45
    )
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $listening = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
        if ($listening) { return $true }
        Start-Sleep -Seconds 1
    }
    return $false
}

function Test-MixPlusHttp {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 10
    )
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $TimeoutSeconds
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
    } catch {
        return $false
    }
}

function Test-MixPlusDeployHealth {
    param(
        [switch]$SkipApi,
        [switch]$SkipFrontend
    )

    Write-MixPlusStep "Health checks"
    $ok = $true

    if (-not $SkipApi) {
        if (-not (Wait-MixPlusPort -Port $MixPlusApiPort)) {
            Write-Host "API did not start listening on port $MixPlusApiPort" -ForegroundColor Red
            $ok = $false
        } elseif (-not (Test-MixPlusHttp -Url "http://127.0.0.1:$MixPlusApiPort/api/home")) {
            Write-Host "API health check failed: /api/home" -ForegroundColor Red
            $ok = $false
        } else {
            Write-Host "API OK" -ForegroundColor Green
        }
    }

    if (-not $SkipFrontend) {
        if (-not (Wait-MixPlusPort -Port $MixPlusFrontendPort)) {
            Write-Host "Frontend did not start listening on port $MixPlusFrontendPort" -ForegroundColor Red
            $ok = $false
        } elseif (-not (Test-MixPlusHttp -Url "http://127.0.0.1:$MixPlusFrontendPort/")) {
            Write-Host "Frontend health check failed: /" -ForegroundColor Red
            $ok = $false
        } else {
            Write-Host "Frontend OK" -ForegroundColor Green
        }
    }

    return $ok
}

function Write-MixPlusDeploySummary {
    param(
        [switch]$SkipApi,
        [switch]$SkipFrontend
    )

    $publicIp = Get-MixPlusPublicIp
    Write-Host ""
    Write-Host "MixPlus deploy complete" -ForegroundColor Green
    if (-not $SkipFrontend) {
        Write-Host "  Site:    http://${publicIp}:$MixPlusFrontendPort/"
        Write-Host "  Local:   http://127.0.0.1:$MixPlusFrontendPort/"
    }
    if (-not $SkipApi) {
        Write-Host "  API:     http://${publicIp}:$MixPlusApiPort/api/home"
        Write-Host "  Swagger: http://${publicIp}:$MixPlusApiPort/swagger"
    }
    Write-Host ""
    Write-Host "Logs:"
    if (-not $SkipApi) {
        Write-Host "  $($MixPlusApiLogDir)\api.out.log"
        Write-Host "  $($MixPlusApiLogDir)\api.err.log"
    }
    if (-not $SkipFrontend) {
        Write-Host "  $($MixPlusFrontendLogDir)\mixplus.out.log"
        Write-Host "  $($MixPlusFrontendLogDir)\mixplus.err.log"
    }
}

function Show-MixPlusDeployFailureLogs {
    param(
        [switch]$SkipApi,
        [switch]$SkipFrontend
    )
    if (-not $SkipApi) {
        $errLog = Join-Path $MixPlusApiLogDir "api.err.log"
        if (Test-Path $errLog) {
            Write-Host "--- API errors (tail) ---" -ForegroundColor Yellow
            Get-Content $errLog -Tail 30
        }
    }
    if (-not $SkipFrontend) {
        $errLog = Join-Path $MixPlusFrontendLogDir "mixplus.err.log"
        if (Test-Path $errLog) {
            Write-Host "--- Frontend errors (tail) ---" -ForegroundColor Yellow
            Get-Content $errLog -Tail 30
        }
    }
}
