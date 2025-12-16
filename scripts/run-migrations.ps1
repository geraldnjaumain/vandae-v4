# Migration Runner Script for Supabase
# This script helps run the database migrations for AI Cache and Admin System

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Database Migration Runner" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
Write-Host "Loading environment variables..." -ForegroundColor Yellow
$envContent = Get-Content ".env.local"
$supabaseUrl = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_URL=").ToString().Split('=')[1].Trim()
$supabaseKey = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_ANON_KEY=").ToString().Split('=')[1].Trim()

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "ERROR: Could not find Supabase credentials in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Supabase URL found: $supabaseUrl" -ForegroundColor Green
Write-Host ""

# You need to manually run these migrations in Supabase Dashboard
Write-Host "MANUAL STEPS REQUIRED:" -ForegroundColor Yellow
Write-Host "Supabase doesn't allow running migrations via API for security reasons." -ForegroundColor Yellow
Write-Host "Please follow these steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: $supabaseUrl/project/_/sql/new" -ForegroundColor Cyan
Write-Host "2. Copy and paste the contents of:" -ForegroundColor White
Write-Host "   - supabase/migrations/20250116000000_ai_cache_system.sql" -ForegroundColor White
Write-Host "3. Click 'Run' to execute the migration" -ForegroundColor White
Write-Host ""
Write-Host "4. Then copy and paste:" -ForegroundColor White
Write-Host "   - supabase/migrations/20250116000001_admin_system.sql" -ForegroundColor White
Write-Host "5. Click 'Run' again" -ForegroundColor White
Write-Host ""
Write-Host "Would you like to open the SQL editor in your browser? (Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq 'Y' -or $response -eq 'y') {
    $sqlEditorUrl = "$supabaseUrl/project/_/sql/new"
    Start-Process $sqlEditorUrl
    Write-Host "✓ Opening SQL editor in browser..." -ForegroundColor Green
}

Write-Host ""
Write-Host "After running the migrations, run:" -ForegroundColor Cyan
Write-Host "  .\scripts\create-admin.ps1" -ForegroundColor White
Write-Host "to create your first admin user." -ForegroundColor Cyan
