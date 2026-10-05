# Full production deploy: rebuild backend + frontend, restart services, run health checks.
# Usage:
#   powershell -File scripts/deploy/full-deploy.ps1
#   powershell -File scripts/deploy/full-deploy.ps1 -BackendOnly
#   powershell -File scripts/deploy/full-deploy.ps1 -FrontendOnly

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\MixPlusDeploy.ps1"

$deployApi = -not $FrontendOnly
$deployFrontend = -not $BackendOnly

Write-Host "MixPlus full deploy" -ForegroundColor Magenta
Write-Host "  Repo: $MixPlusRepoRoot"

# Stop first so Release build can overwrite locked DLLs.
Write-MixPlusStep "Stopping existing services"
if ($deployApi) { Stop-MixPlusApi }
if ($deployFrontend) { Stop-MixPlusFrontend }
Start-Sleep -Seconds 2

if ($deployApi) {
    Build-MixPlusBackend
}
if ($deployFrontend) {
    Build-MixPlusFrontend
}


if ($deployApi) { Start-MixPlusApi -NoBuild }
if ($deployFrontend) { Start-MixPlusFrontend }

$healthy = Test-MixPlusDeployHealth -SkipApi:(-not $deployApi) -SkipFrontend:(-not $deployFrontend)
if (-not $healthy) {
    Show-MixPlusDeployFailureLogs -SkipApi:(-not $deployApi) -SkipFrontend:(-not $deployFrontend)
    exit 1
}

Write-MixPlusDeploySummary -SkipApi:(-not $deployApi) -SkipFrontend:(-not $deployFrontend)
