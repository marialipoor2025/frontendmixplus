# Restart frontend only (fast deploy). Prefer scripts/deploy/fast-deploy.ps1 for full stack.
$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
& (Join-Path $repoRoot "scripts\deploy\fast-deploy.ps1") -FrontendOnly
