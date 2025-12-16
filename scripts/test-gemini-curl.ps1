
# Load API Key from .env.local
$envContent = Get-Content ".env.local"
$apiKeyLine = $envContent | Select-String "GEMINI_API_KEY="
if (-not $apiKeyLine) {
    Write-Error "API Key not found in .env.local"
    exit 1
}
$apiKey = $apiKeyLine.ToString().Split('=')[1].Trim()

Write-Host "Testing Gemini API via CURL..."

# URL to list models
$url = "https://generativelanguage.googleapis.com/v1beta/models?key=$apiKey"

try {
    $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing
    Write-Host "SUCCESS! Models found:"
    # Parse and print just the names to be safe/concise
    $json = $response.Content | ConvertFrom-Json
    $json.models | Where-Object { $_.name -like "*gemini*" } | ForEach-Object { Write-Host $_.name }
} catch {
    Write-Host "FAILURE!"
    Write-Host $_.Exception.Message
    # Try to print the error details from the stream
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $details = $reader.ReadToEnd()
        Write-Host "Error Details: $details"
    }
}
