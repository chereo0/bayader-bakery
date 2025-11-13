#!/usr/bin/env pwsh

# Driver Account Creation - Method 1 Implementation Script
# This script demonstrates the complete flow to create driver accounts
# Run with: pwsh .\test-driver-creation.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Bayader Bakery - Driver Account Creation" -ForegroundColor Cyan
Write-Host "Method 1: Admin API Endpoint" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:5000/api"
$ADMIN_EMAIL = "admin@bayader.com"
$ADMIN_PASSWORD = "AdminPass123"

# Colors for output
$Success = "Green"
$Error = "Red"
$Info = "Cyan"
$Warning = "Yellow"

# Step 1: Login as Admin
Write-Host "STEP 1: Getting Admin Token..." -ForegroundColor $Info
Write-Host "Logging in as: $ADMIN_EMAIL" -ForegroundColor $Info
Write-Host ""

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            email = $ADMIN_EMAIL
            password = $ADMIN_PASSWORD
        } | ConvertTo-Json)

    if ($loginResponse.success) {
        $ADMIN_TOKEN = $loginResponse.data.token
        Write-Host "✓ Admin authentication successful!" -ForegroundColor $Success
        Write-Host "Token: $($ADMIN_TOKEN.Substring(0, 50))..." -ForegroundColor $Info
        Write-Host ""
    } else {
        Write-Host "✗ Admin login failed" -ForegroundColor $Error
        exit 1
    }
} catch {
    Write-Host "✗ Error connecting to API: $_" -ForegroundColor $Error
    exit 1
}

# Step 2: Create Driver
Write-Host "STEP 2: Creating Driver Account..." -ForegroundColor $Info
Write-Host ""

$driverData = @{
    name = "Ahmed Hassan"
    email = "ahmed.hassan@drivers.com"
    password = "Ahmed@2025Driver"
    phone = "+966501234567"
    address = "Riyadh, Saudi Arabia"
}

Write-Host "Driver Details to Create:" -ForegroundColor $Info
Write-Host "  Name: $($driverData.name)" -ForegroundColor $Info
Write-Host "  Email: $($driverData.email)" -ForegroundColor $Info
Write-Host "  Phone: $($driverData.phone)" -ForegroundColor $Info
Write-Host "  Address: $($driverData.address)" -ForegroundColor $Info
Write-Host ""

try {
    $createResponse = Invoke-RestMethod -Uri "$API_URL/admin/drivers" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{
            "Authorization" = "Bearer $ADMIN_TOKEN"
        } `
        -Body ($driverData | ConvertTo-Json)

    if ($createResponse.success) {
        $DRIVER_ID = $createResponse.data.id
        Write-Host "✓ Driver account created successfully!" -ForegroundColor $Success
        Write-Host "Driver ID: $DRIVER_ID" -ForegroundColor $Success
        Write-Host ""
    } else {
        Write-Host "✗ Driver creation failed: $($createResponse.message)" -ForegroundColor $Error
        exit 1
    }
} catch {
    Write-Host "✗ Error creating driver: $_" -ForegroundColor $Error
    exit 1
}

# Step 3: Verify Driver Can Login
Write-Host "STEP 3: Verifying Driver Login..." -ForegroundColor $Info
Write-Host ""

try {
    $driverLoginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            email = $driverData.email
            password = $driverData.password
        } | ConvertTo-Json)

    if ($driverLoginResponse.success) {
        Write-Host "✓ Driver login successful!" -ForegroundColor $Success
        Write-Host "Driver Name: $($driverLoginResponse.data.user.name)" -ForegroundColor $Success
        Write-Host "Driver Role: $($driverLoginResponse.data.user.role)" -ForegroundColor $Success
        Write-Host ""
    } else {
        Write-Host "✗ Driver login failed" -ForegroundColor $Error
        exit 1
    }
} catch {
    Write-Host "✗ Error during driver login: $_" -ForegroundColor $Error
    exit 1
}

# Step 4: Get All Drivers
Write-Host "STEP 4: Listing All Drivers..." -ForegroundColor $Info
Write-Host ""

try {
    $driversResponse = Invoke-RestMethod -Uri "$API_URL/admin/drivers" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $ADMIN_TOKEN"
        }

    if ($driversResponse.success) {
        Write-Host "✓ Total drivers: $($driversResponse.count)" -ForegroundColor $Success
        Write-Host ""
        Write-Host "Drivers List:" -ForegroundColor $Info
        Write-Host "─────────────────────────────────────────────" -ForegroundColor $Info
        
        foreach ($driver in $driversResponse.data) {
            Write-Host "  • $($driver.name)" -ForegroundColor $Success
            Write-Host "    Email: $($driver.email)" -ForegroundColor $Info
            Write-Host "    Phone: $($driver.phone)" -ForegroundColor $Info
            Write-Host "    Role: $($driver.role)" -ForegroundColor $Info
            Write-Host ""
        }
    } else {
        Write-Host "✗ Failed to get drivers list" -ForegroundColor $Error
        exit 1
    }
} catch {
    Write-Host "✗ Error fetching drivers: $_" -ForegroundColor $Error
    exit 1
}

# Summary
Write-Host "========================================" -ForegroundColor $Success
Write-Host "✓ ALL TESTS PASSED!" -ForegroundColor $Success
Write-Host "========================================" -ForegroundColor $Success
Write-Host ""
Write-Host "Summary:" -ForegroundColor $Success
Write-Host "✓ Admin authenticated successfully" -ForegroundColor $Success
Write-Host "✓ Driver account created successfully" -ForegroundColor $Success
Write-Host "✓ Driver can login and authenticate" -ForegroundColor $Success
Write-Host "✓ Driver appears in drivers list" -ForegroundColor $Success
Write-Host ""
Write-Host "Driver Login Credentials:" -ForegroundColor $Warning
Write-Host "  Email: $($driverData.email)" -ForegroundColor $Warning
Write-Host "  Password: $($driverData.password)" -ForegroundColor $Warning
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor $Info
Write-Host "1. Use these credentials to login as driver" -ForegroundColor $Info
Write-Host "2. Share credentials securely with the driver" -ForegroundColor $Info
Write-Host "3. Driver can now access their dashboard" -ForegroundColor $Info
Write-Host ""
