# Apply All SQL Migrations to Supabase
# Simple guide to run all migrations manually

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Database Migration Guide" -ForegroundColor Cyan  
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Get Supabase URL
$envContent = Get-Content ".env.local" -Raw
$supabaseUrl = ""
if ($envContent -match 'NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)') {
    $supabaseUrl = $matches[1].Trim()
}

if (-not $supabaseUrl) {
    Write-Host "ERROR: Could not find SUPABASE_URL in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "Your Supabase Project: " -NoNewline
Write-Host $supabaseUrl -ForegroundColor Green
Write-Host ""

# List all migrations
$migrations = Get-ChildItem -Path "supabase\migrations" -Filter "*.sql" | Sort-Object Name

Write-Host "Found $($migrations.Count) migration files to apply:" -ForegroundColor Yellow
Write-Host ""
foreach ($migration in $migrations) {
    Write-Host "  ✓ $($migration.Name)" -ForegroundColor White
}
Write-Host ""

Write-Host "STEPS TO APPLY MIGRATIONS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. I'll open the Supabase SQL Editor in your browser" -ForegroundColor White
Write-Host "2. For each migration file below, copy ALL its contents" -ForegroundColor White
Write-Host "3. Paste in SQL Editor and click RUN" -ForegroundColor White
Write-Host "4. Wait for 'Success' message before moving to next file" -ForegroundColor White
Write-Host ""

$response = Read-Host "Press ENTER to open SQL Editor"

# Open SQL Editor
$sqlUrl = "$supabaseUrl/project/_/sql/new"
Start-Process $sqlUrl
Write-Host "✓ SQL Editor opened in browser" -ForegroundColor Green
Write-Host ""

# Show file paths
Write-Host "MIGRATION FILES (apply in this order):" -ForegroundColor Yellow
Write-Host ""
$i = 1
foreach ($migration in $migrations) {
    Write-Host "$i. $($migration.Name)" -ForegroundColor Cyan
    Write-Host "   Location: supabase\migrations\$($migration.Name)" -ForegroundColor Gray
    Write-Host ""
    $i++
}

Write-Host "After applying all migrations, run:" -ForegroundColor Green
Write-Host "  .\scripts\create-admin.ps1" -ForegroundColor White
Write-Host "to create your first admin user." -ForegroundColor Green
Write-Host ""
