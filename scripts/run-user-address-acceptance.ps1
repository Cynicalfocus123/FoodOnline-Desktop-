$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $PSScriptRoot
$tempRoot = Join-Path ([IO.Path]::GetTempPath()) ("foodonlines-address-acceptance-" + [guid]::NewGuid().ToString("N"))
$databasePath = Join-Path $tempRoot "acceptance.sqlite"
$laravelOutput = Join-Path $tempRoot "laravel-output.log"
$laravelError = Join-Path $tempRoot "laravel-error.log"
$viteOutput = Join-Path $tempRoot "vite-output.log"
$viteError = Join-Path $tempRoot "vite-error.log"
$browserConfigPath = Join-Path $tempRoot "browser-config.json"
$chromeProfile = Join-Path $tempRoot "chrome-profile"
$browserDist = Join-Path $tempRoot "browser-dist"
$laravelProcess = $null
$viteProcess = $null

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
    throw "Timed out waiting for $Label at $Url."
}

function Invoke-JsonRequest {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body,
        [int]$ExpectedStatus,
        [string]$Token = ""
    )
    $headers = @{ Accept = "application/json" }
    if ($Token) { $headers.Authorization = "Bearer $Token" }
    $parameters = @{
        UseBasicParsing = $true
        Method = $Method
        Uri = $Url
        Headers = $headers
        ContentType = "application/json"
    }
    if ($null -ne $Body) { $parameters.Body = ($Body | ConvertTo-Json -Depth 12 -Compress) }
    try {
        $response = Invoke-WebRequest @parameters
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        $content = if ($_.ErrorDetails.Message) { $_.ErrorDetails.Message } else { $_.Exception.Message }
        throw "$Method $Url failed with HTTP $status. $content"
    }
    if ([int]$response.StatusCode -ne $ExpectedStatus) {
        throw "$Method $Url returned HTTP $($response.StatusCode); expected $ExpectedStatus. $($response.Content)"
    }
    return [pscustomobject]@{
        Status = [int]$response.StatusCode
        Data = if ($response.Content) { $response.Content | ConvertFrom-Json } else { $null }
    }
}

function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw $Message }
}

$environmentNames = @(
    "APP_ENV", "APP_DEBUG", "APP_KEY", "APP_URL", "FRONTEND_URL", "DB_CONNECTION", "DB_DATABASE",
    "CACHE_STORE", "CACHE_DRIVER", "SESSION_DRIVER", "QUEUE_CONNECTION", "MAIL_MAILER", "VITE_API_BASE_URL",
    "ACCEPTANCE_STATIC_ROOT", "ACCEPTANCE_STATIC_PORT"
)
$savedEnvironment = @{}
foreach ($name in $environmentNames) { $savedEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, "Process") }

try {
    New-Item -ItemType Directory -Path $tempRoot | Out-Null
    New-Item -ItemType File -Path $databasePath | Out-Null
    $apiPort = Get-FreeTcpPort
    $frontendPort = Get-FreeTcpPort
    $debugPort = Get-FreeTcpPort
    $apiOrigin = "http://127.0.0.1:$apiPort"
    $frontendOrigin = "http://127.0.0.1:$frontendPort"
    $apiBase = "$apiOrigin/api/v1"

    $env:APP_ENV = "testing"
    $env:APP_DEBUG = "false"
    $env:APP_KEY = "base64:" + [Convert]::ToBase64String([byte[]](1..32))
    $env:APP_URL = $apiOrigin
    $env:FRONTEND_URL = $frontendOrigin
    $env:DB_CONNECTION = "sqlite"
    $env:DB_DATABASE = $databasePath
    $env:CACHE_STORE = "array"
    $env:CACHE_DRIVER = "array"
    $env:SESSION_DRIVER = "array"
    $env:QUEUE_CONNECTION = "sync"
    $env:MAIL_MAILER = "array"
    $env:VITE_API_BASE_URL = $apiBase

    Push-Location $projectRoot
    try {
        & php artisan migrate --force --no-interaction | Out-Host
        if ($LASTEXITCODE -ne 0) { throw "Temporary acceptance database migration failed." }
        $adminEmail = "address-acceptance-admin@example.test"
        $adminPassword = "AddressAdmin123"
        & php tests/Support/address-acceptance.php seed-admin $adminEmail $adminPassword | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Acceptance administrator creation failed." }

        $laravelRouter = "../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php"
        $laravelProcess = Start-Process -FilePath "php" -ArgumentList @("-S", "127.0.0.1:$apiPort", $laravelRouter) -WorkingDirectory (Join-Path $projectRoot "public") -PassThru -WindowStyle Hidden -RedirectStandardOutput $laravelOutput -RedirectStandardError $laravelError
        Wait-ForHttp "$apiBase/health" "Laravel API"

        $customerEmail = "two-address-customer@example.test"
        $registration = Invoke-JsonRequest -Method POST -Url "$apiBase/auth/register" -ExpectedStatus 201 -Body @{
            account_type = "customer"
            email = $customerEmail
            first_name = "Acceptance"
            last_name = "Customer"
            contact_number = "+66 81 555 7788"
            line_id = "acceptance.customer"
            company_name = $null
            password = "Strongpass123"
            registered_from = "automated_address_acceptance"
        }
        $customerId = [string]$registration.Data.user.id
        $customerToken = [string]$registration.Data.token

        $thailandPayload = @{
            country_key = "thailand"
            address_values = @{
                fullName = "Acceptance Customer Thailand"
                phoneNumber = "+66 81 234 5678"
                houseBuilding = "88 FoodOnlines Tower"
                unitFloorRoom = "Unit 12A"
                villageSoiRoad = "Soi Sukhumvit 21"
                province = "Bangkok"
                district = "Watthana"
                subdistrict = "Khlong Toei Nuea"
                postalCode = "10110"
                deliveryNote = "Leave with the lobby concierge"
            }
            summary = "88 FoodOnlines Tower, Bangkok 10110"
            is_default = $true
        }
        $thailand = Invoke-JsonRequest -Method POST -Url "$apiBase/account/addresses" -ExpectedStatus 201 -Token $customerToken -Body $thailandPayload

        $usaPayload = @{
            country_key = "usa"
            address_values = @{
                fullName = "Acceptance Customer USA"
                phoneNumber = "+1 213 555 0142"
                streetAddress = "400 South Hope Street"
                unitFloorRoom = "Suite 900"
                city = "Los Angeles"
                state = "California"
                postalCode = "90071"
                deliveryNote = "Call from the loading entrance"
            }
            summary = "400 South Hope Street, Los Angeles, CA 90071"
            is_default = $false
        }
        $usa = Invoke-JsonRequest -Method POST -Url "$apiBase/account/addresses" -ExpectedStatus 201 -Token $customerToken -Body $usaPayload

        $otherMarker = "OTHER USER ADDRESS MUST NEVER RENDER"
        $otherRegistration = Invoke-JsonRequest -Method POST -Url "$apiBase/auth/register" -ExpectedStatus 201 -Body @{
            account_type = "customer"
            email = "other-address-owner@example.test"
            first_name = "Other"
            last_name = "Customer"
            contact_number = "+81 90 1111 2222"
            line_id = $null
            company_name = $null
            password = "Strongpass123"
            registered_from = "automated_address_acceptance"
        }
        $otherAddress = Invoke-JsonRequest -Method POST -Url "$apiBase/account/addresses" -ExpectedStatus 201 -Token ([string]$otherRegistration.Data.token) -Body @{
            country_key = "japan"
            address_values = @{ fullName = "Other Customer"; phoneNumber = "+81 90 1111 2222"; prefecture = "Tokyo"; deliveryNote = $otherMarker }
            summary = $otherMarker
            is_default = $true
        }

        $databaseStateJson = & php tests/Support/address-acceptance.php inspect-customer $customerEmail
        if ($LASTEXITCODE -ne 0) { throw "Acceptance database inspection failed." }
        $databaseState = $databaseStateJson | ConvertFrom-Json
        Assert-True ([string]$databaseState.user_id -eq $customerId) "Saved addresses are not attached to the registered users.id."
        Assert-True (@($databaseState.addresses).Count -eq 2) "The authoritative database does not contain exactly two customer addresses."
        Assert-True (@($databaseState.addresses | Where-Object { [string]$_.user_id -eq $customerId }).Count -eq 2) "An address belongs to the wrong users.id."

        $adminLogin = Invoke-JsonRequest -Method POST -Url "$apiBase/admin/login" -ExpectedStatus 200 -Body @{ email = $adminEmail; password = $adminPassword }
        $adminToken = [string]$adminLogin.Data.token
        $detail = Invoke-JsonRequest -Method GET -Url "$apiBase/admin/users/$customerId" -ExpectedStatus 200 -Token $adminToken -Body $null
        $refreshedDetail = Invoke-JsonRequest -Method GET -Url "$apiBase/admin/users/$customerId" -ExpectedStatus 200 -Token $adminToken -Body $null
        $addresses = @($detail.Data.user.addresses)
        Assert-True ($addresses.Count -eq 2) "Admin API did not return exactly two addresses."
        Assert-True (@($addresses | Where-Object { [string]$_.user_id -eq $customerId }).Count -eq 2) "Admin API returned an address for another user."
        Assert-True (@($addresses | Where-Object { $_.is_default }).Count -eq 1) "Admin API did not return exactly one default address."
        Assert-True ([string]$addresses[0].country_key -eq "thailand" -and [bool]$addresses[0].is_default) "Thailand is not the first/default Admin address."
        Assert-True (@($refreshedDetail.Data.user.addresses).Count -eq 2) "Repeated direct Admin detail request lost an address."
        Assert-True (-not (($detail.Data | ConvertTo-Json -Depth 12) -like "*$otherMarker*")) "Another user's address leaked into the selected customer response."

        & node node_modules/vite/bin/vite.js build --outDir $browserDist --emptyOutDir | Out-Host
        if ($LASTEXITCODE -ne 0) { throw "Temporary production frontend build failed." }
        $env:ACCEPTANCE_STATIC_ROOT = $browserDist
        $env:ACCEPTANCE_STATIC_PORT = [string]$frontendPort
        $viteProcess = Start-Process -FilePath "node" -ArgumentList @("scripts/address-acceptance-static-server.mjs") -WorkingDirectory $projectRoot -PassThru -WindowStyle Hidden -RedirectStandardOutput $viteOutput -RedirectStandardError $viteError
        Wait-ForHttp "$frontendOrigin/admin.html" "compiled Admin frontend"

        $chromePath = @(
            "C:\Program Files\Google\Chrome\Application\chrome.exe",
            "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
            "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        ) | Where-Object { Test-Path $_ } | Select-Object -First 1
        if (-not $chromePath) { throw "Chrome or Edge is required for the real Admin address acceptance test." }

        @{
            chromePath = $chromePath
            debugPort = $debugPort
            chromeUserDataDirectory = $chromeProfile
            adminUrl = "$frontendOrigin/admin/customers/$customerId/edit"
            adminEmail = $adminEmail
            adminPassword = $adminPassword
            customerId = $customerId
            customerEmail = $customerEmail
            thailandAddressId = [string]$thailand.Data.address.id
            usaAddressId = [string]$usa.Data.address.id
            otherCustomerMarker = $otherMarker
            thailandRenderedValues = @("Thailand", "+66 81 234 5678", "88 FoodOnlines Tower", "Bangkok", "Watthana", "Khlong Toei Nuea", "10110", "Leave with the lobby concierge")
            usaRenderedValues = @("United States", "+1 213 555 0142", "400 South Hope Street", "Los Angeles", "California", "90071", "Call from the loading entrance")
        } | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $browserConfigPath -Encoding UTF8

        $browserJson = & node scripts/admin-address-browser-acceptance.mjs $browserConfigPath
        if ($LASTEXITCODE -ne 0) { throw "Headless Admin address rendering verification failed." }
        $browser = $browserJson | ConvertFrom-Json

        [pscustomobject]@{
            customerId = $customerId
            registrationStatus = $registration.Status
            thailandSaveStatus = $thailand.Status
            usaSaveStatus = $usa.Status
            otherAddressSaveStatus = $otherAddress.Status
            databaseAddressCount = @($databaseState.addresses).Count
            adminDetailStatus = $detail.Status
            adminRefreshStatus = $refreshedDetail.Status
            adminAddressCount = $addresses.Count
            defaultCountry = [string]$addresses[0].country_key
            browser = $browser.browser
            browserInitialCards = @($browser.firstLoad.cards).Count
            browserRefreshCards = @($browser.refreshed.cards).Count
            directAdminUrl = [string]$browser.directUrl
            result = "passed"
        } | ConvertTo-Json -Depth 6
    } finally {
        Pop-Location
    }
} catch {
    $acceptanceFailure = $_
    foreach ($log in @($laravelError, $laravelOutput, $viteError, $viteOutput)) {
        if (Test-Path $log) {
            $logContent = [string]::Join("`n", @(Get-Content -LiteralPath $log))
            if ($logContent) { Write-Warning $logContent }
        }
    }
    throw $acceptanceFailure
} finally {
    if ($viteProcess -and -not $viteProcess.HasExited) { Stop-Process -Id $viteProcess.Id -Force }
    if ($laravelProcess -and -not $laravelProcess.HasExited) { Stop-Process -Id $laravelProcess.Id -Force }
    foreach ($name in $environmentNames) { [Environment]::SetEnvironmentVariable($name, $savedEnvironment[$name], "Process") }
    $resolvedTemp = [IO.Path]::GetFullPath($tempRoot)
    $systemTemp = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    if ($resolvedTemp.StartsWith($systemTemp, [StringComparison]::OrdinalIgnoreCase) -and (Split-Path -Leaf $resolvedTemp).StartsWith("foodonlines-address-acceptance-")) {
        Remove-Item -LiteralPath $resolvedTemp -Recurse -Force -ErrorAction SilentlyContinue
    }
}
