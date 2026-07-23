$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

foreach ($accountType in @("customer", "supplier", "partner")) {
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "run-user-address-acceptance.ps1") -AccountType $accountType
    if ($LASTEXITCODE -ne 0) {
        throw "$accountType address acceptance failed."
    }
}
