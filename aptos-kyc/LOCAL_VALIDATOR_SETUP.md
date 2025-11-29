# 🐳 Running Aptos Validator Locally (Docker)

Run your own Aptos node locally for faster development!

---

## ⚡ Quick Start

### Step 1: Install Docker Desktop

1. Download: https://www.docker.com/products/docker-desktop/
2. Install Docker Desktop for Windows
3. Start Docker Desktop
4. Verify: `docker --version`

### Step 2: Start Aptos Validator

```powershell
cd "d:/sdk kyc/aptos-kyc"

# Start the validator node
docker-compose up -d aptos-validator

# Check if it's running
docker-compose ps

# View logs
docker-compose logs -f aptos-validator
```

### Step 3: Wait for Node to Start

The node needs 1-2 minutes to initialize. Check health:

```powershell
# Check if API is ready
curl http://localhost:8080/v1

# Should return ledger info JSON
```

### Step 4: Update Backend Configuration

Edit `backend/.env`:

```env
# Change from testnet to local node
APTOS_NODE_URL="http://localhost:8080/v1"

# Remove faucet (not needed for local)
# APTOS_FAUCET_URL="..."
```

### Step 5: Fund Your Account (Local Faucet)

The local node has a built-in faucet:

```powershell
# Fund your account
curl -X POST "http://localhost:8080/mint" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xYOUR_WALLET_ADDRESS",
    "amount": 100000000
  }'
```

Or use Aptos CLI:

```powershell
aptos account fund-with-faucet \
  --account YOUR_WALLET_ADDRESS \
  --url http://localhost:8080
```

---

## 🎯 Deploy Contracts to Local Node

```powershell
cd contracts

# Update .aptos/config.yaml to use local node
# Or specify in command:

aptos move publish \
  --url http://localhost:8080 \
  --assume-yes
```

---

## 🔧 Useful Commands

### Start/Stop Validator

```powershell
# Start
docker-compose up -d aptos-validator

# Stop
docker-compose down

# Restart (clean state)
docker-compose down -v
docker-compose up -d aptos-validator
```

### Check Status

```powershell
# Node health
curl http://localhost:8080/v1

# View logs
docker-compose logs -f aptos-validator

# Check resources
docker stats aptos-kyc-validator
```

### Reset Everything

```powershell
# Remove all data and restart fresh
docker-compose down -v
docker volume rm aptos-kyc_aptos-data
docker-compose up -d aptos-validator
```

---

## 🌐 Access Points

- **REST API**: http://localhost:8080/v1
- **Metrics**: http://localhost:9101/metrics
- **Node API**: http://localhost:6180

### Explorer

To view transactions, use the Aptos Explorer pointing to your local node:
- Go to: https://explorer.aptoslabs.com/
- Change network to "Custom"
- Enter: `http://localhost:8080`

---

## 📊 Comparison: Local vs Testnet

| Feature | Local Validator | Public Testnet |
|---------|----------------|----------------|
| Speed | ⚡ Instant | 🐢 2-5 seconds |
| Reliability | ✅ Always available | ⚠️ Can be slow |
| Data | 🔄 Reset anytime | 📝 Persistent |
| Faucet | 💰 Unlimited | 🎁 Limited |
| Network | 🏠 Offline OK | 🌐 Need internet |
| Best For | 🛠️ Development | 🧪 Final testing |

---

## 🐛 Troubleshooting

### Port Already in Use

```powershell
# Find what's using port 8080
netstat -ano | findstr :8080

# Kill the process
taskkill /PID <PID> /F
```

### Node Won't Start

```powershell
# Check Docker is running
docker ps

# View error logs
docker-compose logs aptos-validator

# Try fresh start
docker-compose down -v
docker-compose up -d aptos-validator
```

### Out of Disk Space

```powershell
# Clean up Docker
docker system prune -a --volumes

# Remove old images
docker image prune -a
```

---

## 🎓 Advanced: Custom Configuration

Edit `docker-compose.yml` to customize:

```yaml
services:
  aptos-validator:
    image: aptoslabs/validator:devnet
    environment:
      - RUST_LOG=debug  # More verbose logging
      - FAUCET_ENABLED=true
    # Add custom config here
```

---

## ✅ Verification

After setup, verify everything works:

```powershell
# 1. Check node is running
curl http://localhost:8080/v1

# 2. Fund your account
curl -X POST http://localhost:8080/mint -H "Content-Type: application/json" -d '{"address":"0xYOUR_ADDRESS","amount":100000000}'

# 3. Deploy contracts
cd contracts
aptos move publish --url http://localhost:8080

# 4. Start backend with local node
cd ../backend
# Update .env: APTOS_NODE_URL="http://localhost:8080/v1"
npm run dev
```

---

## 🚀 Production Deployment

For production, DON'T use local validator! Use:
- **Testnet**: For final testing
- **Mainnet**: For real users
- **Dedicated Node**: Run your own full node

This local setup is for **development only**!

---

**Now you have a fast local Aptos blockchain! 🎉**

Transactions are instant and you have unlimited test tokens!
