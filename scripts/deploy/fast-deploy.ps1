# Fast deploy: restart services using existing Release / .next builds (no compile step).
# Usage:
#   powershell -File scripts/deploy/fast-deploy.ps1
#   powershell -File scripts/deploy/fast-deploy.ps1 -BackendOnly
#   powershell -File scripts/deploy/fast-deploy.ps1 -FrontendOnly

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\MixPlusDeploy.ps1"

$deployApi = -not $FrontendOnly
$deployFrontend = -not $BackendOnly

Write-Host "MixPlus fast deploy (restart only)" -ForegroundColor Magenta
Write-Host "  Repo: $MixPlusRepoRoot"

if ($deployApi) {
    $apiDll = Join-Path $MixPlusRepoRoot "backend\src\Host\MixPlus.Api\bin\Release\net8.0\MixPlus.Api.dll"
    if (-not (Test-Path $apiDll)) {
        Write-Host "Release build missing. Run scripts/deploy/full-deploy.ps1 first." -ForegroundColor Yellow
        exit 1
    }
}
if ($deployFrontend) {
    if (-not (Test-Path (Join-Path $MixPlusFrontendDir ".next"))) {
        Write-Host "Frontend build missing (.next). Run scripts/deploy/full-deploy.ps1 first." -ForegroundColor Yellow
        exit 1
    }
}

Write-MixPlusStep "Stopping existing services"
if ($deployApi) { Stop-MixPlusApi }
if ($deployFrontend) { Stop-MixPlusFrontend }
Start-Sleep -Seconds 1

if ($deployApi) { Start-MixPlusApi -NoBuild }
if ($deployFrontend) { Start-MixPlusFrontend }

$healthy = Test-MixPlusDeployHealth -SkipApi:(-not $deployApi) -SkipFrontend:(-not $deployFrontend)
if (-not $healthy) {
    Show-MixPlusDeployFailureLogs -SkipApi:(-not $deployApi) -SkipFrontend:(-not $deployFrontend)
    exit 1
}

Write-MixPlusDeploySummary -SkipApi:(-not $deployApi) -SkipFrontend:(-not $deployFrontend)
