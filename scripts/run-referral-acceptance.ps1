param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$projectRoot = Split-Path -Parent $PSScriptRoot
$tempRoot = Join-Path ([IO.Path]::GetTempPath()) ('foodonlines-referral-acceptance-' + [guid]::NewGuid().ToString('N'))
$databasePath = Join-Path $tempRoot 'acceptance.sqlite'
$laravelOutput = Join-Path $tempRoot 'laravel-output.log'
$laravelError = Join-Path $tempRoot 'laravel-error.log'
$staticOutput = Join-Path $tempRoot 'static-output.log'
$staticError = Join-Path $tempRoot 'static-error.log'
$browserConfig = Join-Path $tempRoot 'browser-config.json'
$browserDist = Join-Path $tempRoot 'browser-dist'
$chromeProfile = Join-Path $tempRoot 'chrome-profile'
$laravelProcess = $null
$staticProcess = $null

function Get-FreeTcpPort {
    $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
    $listener.Start()
    try { return ([Net.IPEndPoint]$listener.LocalEndpoint).Port }
    finally { $listener.Stop() }
}

function Wait-ForHttp([string]$Url, [string]$Label) {
    $deadline = [DateTime]::UtcNow.AddSeconds(30)
    while ([DateTime]::UtcNow -lt $deadline) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { return }
        } catch {}
        Start-Sleep -Milliseconds 200
    }
    throw "Timed out waiting for $Label."
}

function Invoke-JsonRequest {
    param([string]$Method, [string]$Url, [object]$Body, [int]$ExpectedStatus, [string]$Token = '')
    $headers = @{ Accept = 'application/json' }
    if ($Token) { $headers.Authorization = "Bearer $Token" }
    $parameters = @{ UseBasicParsing = $true; Method = $Method; Uri = $Url; Headers = $headers; ContentType = 'application/json' }
    if ($null -ne $Body) { $parameters.Body = ($Body | ConvertTo-Json -Depth 12 -Compress) }
    try { $response = Invoke-WebRequest @parameters }
    catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        $content = if ($_.ErrorDetails.Message) { $_.ErrorDetails.Message } else { $_.Exception.Message }
        throw "$Method $Url failed with HTTP $status. $content"
    }
    if ([int]$response.StatusCode -ne $ExpectedStatus) { throw "$Method $Url returned HTTP $($response.StatusCode); expected $ExpectedStatus." }
    return [pscustomobject]@{ Status = [int]$response.StatusCode; Data = if ($response.Content) { $response.Content | ConvertFrom-Json } else { $null } }
}

function Assert-True([bool]$Condition, [string]$Message) { if (-not $Condition) { throw $Message } }

$environmentNames = @('APP_ENV', 'APP_DEBUG', 'APP_KEY', 'APP_URL', 'FRONTEND_URL', 'DB_CONNECTION', 'DB_DATABASE', 'CACHE_STORE', 'CACHE_DRIVER', 'SESSION_DRIVER', 'QUEUE_CONNECTION', 'MAIL_MAILER', 'VITE_API_BASE_URL', 'ACCEPTANCE_STATIC_ROOT', 'ACCEPTANCE_STATIC_PORT', 'APP_CONFIG_CACHE')
$savedEnvironment = @{}
foreach ($name in $environmentNames) { $savedEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }

try {
    New-Item -ItemType Directory -Path $tempRoot | Out-Null
    New-Item -ItemType File -Path $databasePath | Out-Null
    $apiPort = Get-FreeTcpPort; $frontendPort = Get-FreeTcpPort; $debugPort = Get-FreeTcpPort
    $apiOrigin = "http://127.0.0.1:$apiPort"; $frontendOrigin = "http://127.0.0.1:$frontendPort"; $apiBase = "$apiOrigin/api/v1"
    $env:APP_ENV = 'testing'; $env:APP_DEBUG = 'false'; $env:APP_KEY = 'base64:' + [Convert]::ToBase64String([byte[]](1..32))
    $env:APP_URL = $apiOrigin; $env:FRONTEND_URL = $frontendOrigin; $env:DB_CONNECTION = 'sqlite'; $env:DB_DATABASE = $databasePath
    $env:CACHE_STORE = 'array'; $env:CACHE_DRIVER = 'array'; $env:SESSION_DRIVER = 'array'; $env:QUEUE_CONNECTION = 'sync'; $env:MAIL_MAILER = 'array'; $env:VITE_API_BASE_URL = $apiBase

    Push-Location $projectRoot
    try {
        & php artisan test tests/Feature/ReferralProgramTest.php
        if ($LASTEXITCODE -ne 0) { throw 'Referral feature coverage failed.' }
        & node --experimental-strip-types --test tests/referralRestoration.test.ts
        if ($LASTEXITCODE -ne 0) { throw 'Referral frontend contract coverage failed.' }
        $env:APP_CONFIG_CACHE = (Join-Path $tempRoot 'config.php')
        & php artisan migrate --force --no-interaction
        if ($LASTEXITCODE -ne 0) { throw 'Temporary referral acceptance database migration failed.' }
        & php tests/Support/referral-acceptance.php seed-missing-public-accounts | Out-Null
        if ($LASTEXITCODE -ne 0) { throw 'Temporary existing-account referral seed failed.' }
        & php artisan referrals:backfill-codes
        if ($LASTEXITCODE -ne 0) { throw 'Universal referral-code backfill failed.' }
        $backfilledCodes = (& php tests/Support/referral-acceptance.php codes-for) | ConvertFrom-Json
        if ($LASTEXITCODE -ne 0) { throw 'Universal referral-code backfill inspection failed.' }
        Assert-True (-not [string]::IsNullOrWhiteSpace([string]$backfilledCodes.customer) -and -not [string]::IsNullOrWhiteSpace([string]$backfilledCodes.supplier) -and -not [string]::IsNullOrWhiteSpace([string]$backfilledCodes.partner)) 'Backfill did not assign codes to existing Customer, Supplier, and Partner accounts.'
        & php artisan referrals:backfill-codes
        if ($LASTEXITCODE -ne 0) { throw 'Idempotent referral-code backfill rerun failed.' }
        $adminEmail = 'referral-acceptance-admin@example.test'; $adminPassword = 'ReferralAdmin123'
        & php tests/Support/referral-acceptance.php seed-admin $adminEmail $adminPassword | Out-Null
        if ($LASTEXITCODE -ne 0) { throw 'Acceptance administrator creation failed.' }

        $laravelRouter = '../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php'
        $laravelProcess = Start-Process -FilePath 'php' -ArgumentList @('-S', "127.0.0.1:$apiPort", $laravelRouter) -WorkingDirectory (Join-Path $projectRoot 'public') -PassThru -WindowStyle Hidden -RedirectStandardOutput $laravelOutput -RedirectStandardError $laravelError
        Wait-ForHttp "$apiBase/health" 'Laravel API'

        $accounts = @{}
        foreach ($role in @('customer', 'supplier', 'partner')) {
            $email = "referrer-$role-acceptance@example.test"
            $registration = Invoke-JsonRequest -Method POST -Url "$apiBase/auth/register" -ExpectedStatus 201 -Body @{ account_type = $role; first_name = 'Referral'; last_name = (Get-Culture).TextInfo.ToTitleCase($role); contact_number = '+66 81 555 7788'; password = 'Strongpass123'; registered_from = 'automated_referral_acceptance'; email = $email }
            $token = [string]$registration.Data.token
            Assert-True (-not [string]::IsNullOrWhiteSpace($token) -and [string]$registration.Data.user.account_type -eq $role) "$role registration did not retain the automatic-login contract."
            $dashboard = Invoke-JsonRequest -Method GET -Url "$apiBase/account/referrals" -ExpectedStatus 200 -Token $token -Body $null
            $code = [string]$dashboard.Data.invite.code
            Assert-True (-not [string]::IsNullOrWhiteSpace($code)) "$role referrer did not receive a permanent referral code."
            $invite = Invoke-JsonRequest -Method GET -Url "$apiBase/referrals/invite/$code" -ExpectedStatus 200 -Body $null
            Assert-True ([bool]$invite.Data.valid) "$role referral invite did not resolve."
            $accounts[$role] = [pscustomobject]@{ registration = $registration; token = $token; code = $code; email = $email }
        }
        $attributions = @()
        foreach ($referrerRole in @('customer', 'supplier', 'partner')) {
            foreach ($referredRole in @('customer', 'supplier', 'partner')) {
                $email = "friend-$referrerRole-to-$referredRole@example.test"
                $friend = Invoke-JsonRequest -Method POST -Url "$apiBase/auth/register" -ExpectedStatus 201 -Body @{ account_type = $referredRole; first_name = 'Friend'; last_name = (Get-Culture).TextInfo.ToTitleCase($referredRole); contact_number = '+66 81 555 7799'; password = 'Strongpass123'; registered_from = 'automated_referral_acceptance'; email = $email; referral_code = $accounts[$referrerRole].code }
                Assert-True (([string]$friend.Data.token).Length -gt 0 -and [string]$friend.Data.user.account_type -eq $referredRole) "$referrerRole to $referredRole registration did not retain the automatic-login contract."
                $attributions += [pscustomobject]@{ referrerRole = $referrerRole; referredRole = $referredRole; email = $email }
            }
        }
        Assert-True ($attributions.Count -eq 9) 'All nine referral role combinations were not created.'
        $firstAttribution = $attributions[0]
        $inspection = (& php tests/Support/referral-acceptance.php inspect $accounts[$firstAttribution.referrerRole].email $firstAttribution.email) | ConvertFrom-Json
        if ($LASTEXITCODE -ne 0) { throw 'Referral database inspection failed.' }
        Assert-True ([int]$inspection.referral_count -eq 1 -and [int]$inspection.friend_rewards -eq 2) 'Referral attribution or friend coupon rows are missing.'

        $adminLogin = Invoke-JsonRequest -Method POST -Url "$apiBase/admin/login" -ExpectedStatus 200 -Body @{ email = $adminEmail; password = $adminPassword }
        $adminToken = [string]$adminLogin.Data.token
        $adminList = Invoke-JsonRequest -Method GET -Url "$apiBase/admin/referrals?per_page=25" -ExpectedStatus 200 -Token $adminToken -Body $null
        Assert-True (@($adminList.Data.data).Count -ge 9) 'Admin referral list did not return mixed-role attributions.'
        $adminFiltered = Invoke-JsonRequest -Method GET -Url "$apiBase/admin/referrals?referrer_account_type=customer&referred_account_type=partner" -ExpectedStatus 200 -Token $adminToken -Body $null
        Assert-True (@($adminFiltered.Data.data).Count -eq 1) 'Admin account-type filters did not return the expected attribution.'
        $adminDetail = Invoke-JsonRequest -Method GET -Url "$apiBase/admin/referrals/$($inspection.referral_id)" -ExpectedStatus 200 -Token $adminToken -Body $null
        Assert-True ([string]$adminDetail.Data.referral.code -eq [string]$inspection.code) 'Admin referral detail does not match the attribution.'
        Invoke-JsonRequest -Method GET -Url "$apiBase/admin/referrals/$($inspection.referral_id)/qualification" -ExpectedStatus 200 -Token $adminToken -Body $null | Out-Null
        Invoke-JsonRequest -Method GET -Url "$apiBase/admin/referrals/$($inspection.referral_id)/rewards" -ExpectedStatus 200 -Token $adminToken -Body $null | Out-Null
        Invoke-JsonRequest -Method GET -Url "$apiBase/admin/referrals/$($inspection.referral_id)/audit-history" -ExpectedStatus 200 -Token $adminToken -Body $null | Out-Null
        Invoke-JsonRequest -Method GET -Url "$apiBase/admin/referrals/$($inspection.referral_id)/notifications" -ExpectedStatus 200 -Token $adminToken -Body $null | Out-Null

        & node node_modules/vite/bin/vite.js build --outDir $browserDist --emptyOutDir
        if ($LASTEXITCODE -ne 0) { throw 'Temporary production frontend build failed.' }
        $env:ACCEPTANCE_STATIC_ROOT = $browserDist; $env:ACCEPTANCE_STATIC_PORT = [string]$frontendPort
        $staticProcess = Start-Process -FilePath 'node' -ArgumentList @('scripts/address-acceptance-static-server.mjs') -WorkingDirectory $projectRoot -PassThru -WindowStyle Hidden -RedirectStandardOutput $staticOutput -RedirectStandardError $staticError
        Wait-ForHttp "$frontendOrigin/index.html" 'compiled frontend'
        $chromePath = @('C:\Program Files\Google\Chrome\Application\chrome.exe', 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe', 'C:\Program Files\Microsoft\Edge\Application\msedge.exe', 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe') | Where-Object { Test-Path $_ } | Select-Object -First 1
        if (-not $chromePath) { throw 'Chrome or Edge is required for referral browser acceptance.' }
        $browserAccounts = @()
        foreach ($role in @('customer', 'supplier', 'partner')) {
            $registration = $accounts[$role].registration
            $browserAccounts += @{ referralCode = [string]$accounts[$role].code; token = [string]$accounts[$role].token; account = @{ id = [string]$registration.Data.user.id; accountType = $role; companyName = ''; contactNumber = '+66 81 555 7788'; email = [string]$accounts[$role].email; firstName = 'Referral'; lastName = (Get-Culture).TextInfo.ToTitleCase($role); lineId = ''; registeredAt = $registration.Data.user.registered_at; status = 'active' } }
        }
        @{ chromePath = $chromePath; debugPort = $debugPort; chromeUserDataDirectory = $chromeProfile; frontendOrigin = $frontendOrigin; referralCode = [string]$accounts.customer.code; referralId = [string]$inspection.referral_id; accounts = $browserAccounts; adminToken = $adminToken; adminEmail = $adminEmail } | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $browserConfig -Encoding UTF8
        $browser = (& node scripts/referral-browser-acceptance.mjs $browserConfig) | ConvertFrom-Json
        if ($LASTEXITCODE -ne 0 -or $browser.result -ne 'passed') { throw 'Compiled referral browser acceptance failed.' }

        $qualification = (& php tests/Support/referral-acceptance.php qualify-and-revoke $firstAttribution.email) | ConvertFrom-Json
        if ($LASTEXITCODE -ne 0) { throw 'Referral qualification acceptance failed.' }
        Assert-True ($qualification.issued.status -eq 'issued' -and [int]$qualification.issued.reward_count -eq 1 -and $qualification.revoked_status -eq 'revoked' -and -not [bool]$qualification.coupon_active) 'Qualification or full-refund revocation did not preserve the referral reward contract.'
        [pscustomobject]@{ result = 'passed'; referralCode = $accounts.customer.code; referralId = $inspection.referral_id; browser = $browser.result; qualification = $qualification } | ConvertTo-Json -Depth 6
    } finally { Pop-Location }
} finally {
    if ($staticProcess -and -not $staticProcess.HasExited) { Stop-Process -Id $staticProcess.Id -Force }
    if ($laravelProcess -and -not $laravelProcess.HasExited) { Stop-Process -Id $laravelProcess.Id -Force }
    foreach ($name in $environmentNames) { [Environment]::SetEnvironmentVariable($name, $savedEnvironment[$name], 'Process') }
    $resolvedTemp = [IO.Path]::GetFullPath($tempRoot); $systemTemp = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    if ($resolvedTemp.StartsWith($systemTemp, [StringComparison]::OrdinalIgnoreCase) -and (Split-Path -Leaf $resolvedTemp).StartsWith('foodonlines-referral-acceptance-')) { Remove-Item -LiteralPath $resolvedTemp -Force -Recurse -ErrorAction SilentlyContinue }
}
