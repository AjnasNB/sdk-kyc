#!/usr/bin/env pwsh
# 🚀 Complete Automated Setup for Aptos KYC System

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀  APTOS KYC - AUTOMATED SETUP" -ForegroundColor Cyan  
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

$ROOT = "d:/sdk kyc/aptos-kyc"

# Helper function
function Run-Step {
    param([string]$Name, [scriptblock]$Action)
    Write-Host "▶ $Name..." -ForegroundColor Yellow
    try {
        & $Action
        Write-Host "  ✅ Done!`n" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  ❌ Failed: $_`n" -ForegroundColor Red
        return $false
    }
}

# 1. Install dependencies
Run-Step "Installing Backend Dependencies" {
    Set-Location "$ROOT/backend"
    npm install
}

Run-Step "Installing SDK Dependencies" {
    Set-Location "$ROOT/sdk"
    npm install
}

Run-Step "Installing Frontend Dependencies" {
    Set-Location "$ROOT/example-dapp"
    npm install
}

# 2. Build TypeScript
Run-Step "Building Backend" {
    Set-Location "$ROOT/backend"
    npm run build
}

Run-Step "Building SDK" {
    Set-Location "$ROOT/sdk"
    npm run build
}

# 3. Check MongoDB connection
Run-Step "Checking MongoDB Connection" {
    $env = Get-Content "$ROOT/backend/.env" -Raw
    if ($env -notmatch "MONGODB_URI") {
        Write-Host "  ⚠️  WARNING: MONGODB_URI not set in .env!" -ForegroundColor Yellow
    }
}

# 4. Check Aptos key
Run-Step "Checking Aptos Private Key" {
    $env = Get-Content "$ROOT/backend/.env" -Raw
    if ($env -match 'APTOS_ISSUER_PRIVATE_KEY="([^"]+)"') {
        $key = $matches[1]
        if ($key -eq "0x..." -or $key.Length -lt 60) {
            Write-Host "  ⚠️  WARNING: Please set your Petra wallet private key!" -ForegroundColor Yellow
            Write-Host "     Open Petra → Settings → Show Private Key" -ForegroundColor Gray
        } else {
            Write-Host "    Private key configured ✓" -ForegroundColor Green
        }
    }
}

# 5. Start Docker validator (optional)
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🐳  DOCKER VALIDATOR (OPTIONAL)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

$response = Read-Host "Start local Aptos validator? (y/N)"
if ($response -eq "y" -or $response -eq "Y") {
    Run-Step "Starting Aptos Validator" {
        Set-Location $ROOT
        docker-compose up -d aptos-validator
        Write-Host "  Waiting for validator to start..." -ForegroundColor Gray
        Start-Sleep -Seconds 10
        
        try {
            $health = Invoke-WebRequest -Uri "http://localhost:8080/v1" -UseBasicParsing -TimeoutSec 5
            Write-Host "  Validator is healthy!" -ForegroundColor Green
        } catch {
            Write-Host "  Validator may still be starting..." -ForegroundColor Yellow
        }
    }
}

# 6. Summary & Next Steps
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "📝 NEXT STEPS:`n" -ForegroundColor Yellow

Write-Host "1️⃣  Set your Petra wallet key (if not done):" -ForegroundColor White
Write-Host "   Edit: backend/.env" -ForegroundColor Gray
Write-Host "   Set: APTOS_ISSUER_PRIVATE_KEY=`"ed25519-priv-0xYOUR_KEY`"`n" -ForegroundColor Gray

Write-Host "2️⃣  Deploy smart contracts:" -ForegroundColor White  
Write-Host "   cd contracts" -ForegroundColor Gray
Write-Host "   aptos move publish --profile default`n" -ForegroundColor Gray

Write-Host "3️⃣  Start backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run dev`n" -ForegroundColor Gray

Write-Host "4️⃣  Start frontend (in new terminal):" -ForegroundColor White
Write-Host "   cd example-dapp" -ForegroundColor Gray
Write-Host "   npm run dev`n" -ForegroundColor Gray

Write-Host "5️⃣  Open browser:" -ForegroundColor White
Write-Host "   http://localhost:3000`n" -ForegroundColor Gray

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   • COMPLETE_SETUP.md - Full setup guide" -ForegroundColor Gray
Write-Host "   • LOCAL_VALIDATOR_SETUP.md - Docker validator" -ForegroundColor Gray
Write-Host "   • README.md - Project overview`n" -ForegroundColor Gray

$autoStart = Read-Host "Start backend now? (y/N)"
if ($autoStart -eq "y" -or $autoStart -eq "Y") {
    Write-Host "`nStarting backend..." -ForegroundColor Yellow
    Set-Location "$ROOT/backend"
    npm run dev
}
