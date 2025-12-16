# Create First Admin User
# This script helps you create your first super admin

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Create First Super Admin" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
$envContent = Get-Content ".env.local"
$supabaseUrl = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_URL=").ToString().Split('=')[1].Trim()

Write-Host "Step 1: Find your user ID" -ForegroundColor Yellow
Write-Host "Enter your email address:" -ForegroundColor White
$email = Read-Host

Write-Host ""
Write-Host "Copy and paste this SQL in the Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host ""
Write-Host "-- Step 1: Find your user ID" -ForegroundColor Gray
Write-Host "SELECT id, email FROM auth.users WHERE email = '$email';" -ForegroundColor Cyan
Write-Host ""
Write-Host "After running the query, copy your user ID and paste it here:" -ForegroundColor Yellow
$userId = Read-Host "User ID"

Write-Host ""
Write-Host "Step 2: Create super admin" -ForegroundColor Yellow
Write-Host "Copy and paste this SQL in the Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host ""
Write-Host "-- Step 2: Create super admin" -ForegroundColor Gray
Write-Host "INSERT INTO public.admin_users (user_id, role)" -ForegroundColor Cyan
Write-Host "VALUES ('$userId', 'super_admin');" -ForegroundColor Cyan
Write-Host ""
Write-Host "After running this, you should be able to access:" -ForegroundColor Green
Write-Host "  http://localhost:3000/admin" -ForegroundColor White
Write-Host ""

$response = Read-Host "Open SQL editor in browser? (Y/N)"
if ($response -eq 'Y' -or $response -eq 'y') {
    $sqlEditorUrl = "$supabaseUrl/project/_/sql/new"
    Start-Process $sqlEditorUrl
    Write-Host "✓ Opening SQL editor..." -ForegroundColor Green
}
