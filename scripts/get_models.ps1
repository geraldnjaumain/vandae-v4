
$envContent = Get-Content ".env.local"
$apiKeyLine = $envContent | Select-String "GEMINI_API_KEY="
if (-not $apiKeyLine) {
    Write-Error "API Key not found"
    exit 1
}
$apiKey = $apiKeyLine.ToString().Split('=')[1].Trim()

$url = "https://generativelanguage.googleapis.com/v1beta/models?key=$apiKey"
try {
    $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    $json.models | Select-Object name, displayName, description | ConvertTo-Json -Depth 4 | Out-File "model_list.json" -Encoding utf8
    Write-Host "Model list saved to model_list.json"
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
}
