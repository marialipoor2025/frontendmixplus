param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("Catalog", "Sellers", "Merchandising", "Navigation", "Promotions", "Identity")]
  [string]$Module,

  [Parameter(Mandatory = $true)]
  [string]$Name
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$ctx = "${Module}DbContext"
$project = "src/Modules/$Module/MixPlus.Modules.$Module.csproj"
$startup = "src/Host/MixPlus.Api/MixPlus.Api.csproj"

Write-Host "Adding migration '$Name' for $ctx ..."
dotnet ef migrations add $Name `
  --project $project `
  --startup-project $startup `
  --context $ctx `
  --output-dir Infrastructure/Persistence/Migrations

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Done. Restart the API to apply, or run: dotnet ef database update --project $project --startup-project $startup --context $ctx"
