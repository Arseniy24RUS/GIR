$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"
$env:PYTEST_DISABLE_PLUGIN_AUTOLOAD = "1"

$DefaultPatchArchive = Join-Path $PSScriptRoot "giip_v06_hci_plus_final_release_patch_003623.zip"
$PatchArchive = if ($env:GIIP_V6_PATCH_ARCHIVE) { $env:GIIP_V6_PATCH_ARCHIVE } else { $DefaultPatchArchive }

function Invoke-Checked {
    param([Parameter(Mandatory=$true)][string]$FilePath, [Parameter(ValueFromRemainingArguments=$true)][string[]]$Arguments)
    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$FilePath failed with exit code $LASTEXITCODE" }
}

if (-not (Test-Path "EXTERNAL_AUDIT_MANIFEST.json")) {
    throw "Run this script from the root of global_index_platform_scientific_candidate_20260711-003623."
}

Write-Host "[pre] Verifying UTF-8 mode and V6 patch lineage."
Invoke-Checked python -c "import sys; assert sys.flags.utf8_mode == 1, 'Python UTF-8 mode is required'"
if (-not (Test-Path "PATCH_INTEGRATION_V6.json")) {
    Invoke-Checked python scripts/write_patch_integration_manifest_v6.py prepare --patch-archive $PatchArchive
}
$Lineage = Get-Content -Raw -Encoding UTF8 "PATCH_INTEGRATION_V6.json" | ConvertFrom-Json
if ($Lineage.patch_version -ne "6.0.0-scientific-candidate-003623") {
    throw "PATCH_INTEGRATION_V6.json belongs to an unexpected patch version."
}
if ($Lineage.status -notin @("prepared", "applied")) {
    throw "PATCH_INTEGRATION_V6.json must have prepared or applied status."
}

Write-Host "[apply] Applying the deterministic final-release-v6 migration."
Invoke-Checked python scripts/apply_final_release_v6_patch.py @args

Write-Host "[post] Running candidate tests and strict validators."
Invoke-Checked python scripts/generate_scientific_validation_report.py
Invoke-Checked python scripts/generate_release_docs.py
Invoke-Checked python -m giip.cli validate
Invoke-Checked python -m pytest -q
Invoke-Checked python scripts/validate_no_generated_data.py --strict
Invoke-Checked python scripts/validate_i18n_labels.py --strict
Invoke-Checked python scripts/validate_source_provenance.py --strict
Invoke-Checked python scripts/validate_index_formulas.py --strict
Invoke-Checked python scripts/validate_final_release_candidate.py
Invoke-Checked node --check giip/static/app.js

if (-not (Test-Path "PATCH_APPLIED_V6.json")) {
    throw "PATCH_APPLIED_V6.json is missing after patch application."
}
$Applied = Get-Content -Raw -Encoding UTF8 "PATCH_APPLIED_V6.json" | ConvertFrom-Json
if ($Applied.patch_version -ne $Lineage.patch_version) {
    throw "PATCH_APPLIED_V6.json and PATCH_INTEGRATION_V6.json disagree on patch version."
}

Write-Host "GIIP final-release-v6 offline patch applied successfully."
Write-Host "Keep version 1.0.0-rc6 until official online data and fresh Playwright v6 evidence pass the strict release gate."
