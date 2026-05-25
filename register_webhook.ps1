param (
    [Parameter(Mandatory=$true)]
    [string]$NgrokUrl
)

# Load env variables manually from .env
$envFile = Join-Path (Get-Location) ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), "Process")
    }
}

$botToken = $env:TELEGRAM_BOT_TOKEN
$webhookSecret = $env:TELEGRAM_WEBHOOK_SECRET

if (-not $botToken) {
    Write-Error "TELEGRAM_BOT_TOKEN is not configured in .env!"
    exit 1
}

$cleanUrl = $NgrokUrl.TrimEnd('/')
$webhookUrl = "$cleanUrl/api/telegram/webhook"
$apiUrl = "https://api.telegram.org/bot$botToken/setWebhook?url=$webhookUrl&secret_token=$webhookSecret"

Write-Host "Registering Webhook to Telegram..." -ForegroundColor Cyan
Write-Host "Webhook URL: $webhookUrl" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Get
    if ($response.ok -eq $true) {
        Write-Host "✓ SUCCESS: Telegram Webhook has been registered successfully!" -ForegroundColor Green
        Write-Host $response.description -ForegroundColor Green
    } else {
        Write-Host "✗ FAILED: Telegram returned an error:" -ForegroundColor Red
        Write-Host ($response | ConvertTo-Json) -ForegroundColor Red
    }
} catch {
    Write-Host "✗ ERROR: Failed to register webhook:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
