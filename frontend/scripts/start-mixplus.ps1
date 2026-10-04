# Start MixPlus Next.js production server on port 3000 (all interfaces)
$ErrorActionPreference = "Continue"
$appDir = "C:\Users\Administrator\frontendmixplus\frontend"
$node = "C:\Program Files\nodejs\node.exe"
$nextBin = Join-Path $appDir "node_modules\next\dist\bin\next"
$logDir = Join-Path $appDir "logs"
$port = 3000
$hostname = "0.0.0.0"

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

# Firewall: allow inbound TCP 3000
netsh advfirewall firewall delete rule name="MixPlus Frontend 3000" | Out-Null
netsh advfirewall firewall add rule name="MixPlus Frontend 3000" dir=in action=allow protocol=TCP localport=$port | Out-Null

# Stop any existing MixPlus Next process on this port / app
Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
    Where-Object {
        $_.CommandLine -match 'frontendmixplus' -and (
            $_.CommandLine -match 'next' -or $_.CommandLine -match 'start-server'
        )
    } |
    ForEach-Object {
        Write-Host "Stopping old MixPlus PID $($_.ProcessId)"
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }

# Also free port 3000 if something else holds it from this app
$listeners = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
foreach ($l in $listeners) {
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$($l.OwningProcess)" -ErrorAction SilentlyContinue
    if ($proc -and $proc.CommandLine -match 'frontendmixplus|next') {
        Write-Host "Stopping port $port holder PID $($l.OwningProcess)"
        Stop-Process -Id $l.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Seconds 1

if (-not (Test-Path (Join-Path $appDir ".next"))) {
    Write-Error "Missing production build (.next). Run: npm run build"
    exit 1
}

$out = Join-Path $logDir "mixplus.out.log"
$err = Join-Path $logDir "mixplus.err.log"

$args = @($nextBin, "start", "-H", $hostname, "-p", "$port")
Start-Process -FilePath $node -ArgumentList $args -WorkingDirectory $appDir `
    -WindowStyle Hidden -RedirectStandardOutput $out -RedirectStandardError $err

Start-Sleep -Seconds 4

$publicIp = "193.36.84.230"
try {
    $detected = (Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*' } |
        Select-Object -First 1).IPAddress
    if ($detected) { $publicIp = $detected }
} catch {}

$listening = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
if ($listening) {
    Write-Host "MixPlus is running"
    Write-Host "Public:  http://${publicIp}:${port}/"
    Write-Host "Local:   http://127.0.0.1:${port}/"
} else {
    Write-Host "MixPlus may have failed to bind. Check $err"
    if (Test-Path $err) { Get-Content $err -Tail 40 }
    exit 1
}
