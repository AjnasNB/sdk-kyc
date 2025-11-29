# 🚀 Complete Setup Guide - Aptos KYC System (Windows)

**Everything you need to get the KYC system running from scratch!**

---

## 📋 What is This?

This is a **KYC (Know Your Customer) verification system** built on the Aptos blockchain.

**What it does:**
- ✅ Users verify their identity (email, phone, ID document)
- ✅ Verification is stored on Aptos blockchain (permanent & secure)
- ✅ Users get a verification NFT after completing KYC
- ✅ Anyone can check if a wallet address is verified

### 🔐 How Hash Generation Works

When you complete KYC, the system:

1. **Creates Individual Hashes**:
   - Email hash: `SHA256(your@email.com)` → `abc123...`
   - Phone hash: `SHA256(+1234567890)` → `def456...`
   - ID hash: `SHA256(your_id_image_data)` → `ghi789...`

2. **Combines Into Master Hash**:
   ```
   Combined = "email_hash:phone_hash:id_hash"
   Final Hash = SHA256(Combined) → "xyz789abc123..."
   ```

3. **Stores ONLY the Hash On-Chain**:
   - ✅ Blockchain gets: `xyz789abc123...` (meaningless random string)
   - ❌ Blockchain does NOT get: Your actual email, phone, or ID

**Why This is Secure:**
- 🔒 One-way encryption (can't reverse the hash to get original data)
- 🎯 Same data always produces same hash (verifiable)
- 🚫 Different data produces completely different hash

### 📦 What "SDK Deployment" Means

**The SDK is NOT deployed anywhere!** It's a library you install:

**For Node.js/TypeScript:**
```bash
npm install @cognifyr/aptos-kyc-sdk
```

**For Your Own Apps:**
```typescript
import { KycClient } from '@cognifyr/aptos-kyc-sdk';

const client = new KycClient({
  baseUrl: 'http://localhost:3001/api/v1',
  aptosNodeUrl: 'https://fullnode.testnet.aptoslabs.com/v1'
});

// Start KYC
const session = await client.startSession('0xYOUR_WALLET');
await client.verifyEmail(session.sessionId, 'user@example.com');
await client.completeKyc(session.sessionId);
```

**What DOES get deployed:**
- ✅ **Smart Contracts** - Deployed to Aptos blockchain (Step 5 below)
- ✅ **Backend API** - Runs on your computer (Step 6 below)
- ✅ **Frontend dApp** - Runs on your computer (Step 7 below)

---

## ⚡ Quick Start (5 Minutes)

### Step 0: Install Aptos CLI (Windows)

**Option 1 - Using winget (Recommended):**
```powershell
winget install -e --id Aptos.AptosCLI
```

**Option 2 - Manual Download:**
1. Go to: https://github.com/aptos-labs/aptos-core/releases
2. Download `aptos-cli-<version>-Windows-x86_64.zip`
3. Extract and add to PATH

**Verify installation:**
```powershell
aptos --version
# Should show: aptos 2.x.x
```

If command not found, **restart PowerShell** and try again.


### Step 1: Install Petra Wallet (Aptos Wallet)

1. **Download Petra**: https://petra.app/
2. Install the browser extension (Chrome/Firefox/Edge)
3. Create a new wallet & **save your recovery phrase!**
4. **Switch to Testnet**: Click Settings → Network → Select "Testnet"

### Step 2: Get Free Testnet Tokens

1. Copy your wallet address from Petra
2. Go to: https://aptoslabs.com/testnet-faucet
3. Paste your address → Click "Get Testnet APT"
4. Wait 30 seconds - you should see APT in your wallet!

### Step 3: Get Your Private Key

1. Open Petra → Settings → Manage Account
2. Click "Show Private Key" → Enter password
3. **Copy the ENTIRE key** (including `ed25519-priv-0x...`)
4. Keep it secret! Never share it!

### Step 4: Configure Backend

Open `backend/.env` and update:

```env
# Your MongoDB (already set)
MONGODB_URI="mongodb+srv://Ajnas:Ajnas%40123@cluster0.m4lro.mongodb.net/aptoskyc?retryWrites=true&w=majority"

# Paste your Petra private key here (with ed25519-priv- prefix)
APTOS_ISSUER_PRIVATE_KEY="ed25519-priv-0xYOUR_KEY_HERE"

# Your wallet address (same as shown in Petra)
APTOS_MODULE_ADDRESS="0xYOUR_WALLET_ADDRESS"
APTOS_CONFIG_ADDRESS="0xYOUR_WALLET_ADDRESS"
APTOS_REGISTRY_ADDRESS="0xYOUR_WALLET_ADDRESS"
APTOS_NFT_ADDRESS="0xYOUR_WALLET_ADDRESS"
```

### Step 5: Deploy Smart Contracts

```powershell
# Open PowerShell in project root
cd "d:/sdk kyc/aptos-kyc/contracts"

# Compile contracts
aptos move compile

# Deploy to testnet
aptos move publish --profile default
```

When asked "Do you want to publish this package?", type `yes`

**IMPORTANT**: After deployment, you'll see output like:
```
{
  "Result": {
    "transaction_hash": "0x123abc...",
    "success": true
  }
}
```

Your module is now deployed at your wallet address!

### Step 6: Start Backend

```powershell
cd "d:/sdk kyc/aptos-kyc/backend"
npm run dev
```

You should see:
```
✅ Aptos account loaded: 0x0938...
✅ MongoDB connected successfully
🚀 Aptos KYC API Server running on port 3001
```

### Step 7: Start Frontend

Open a NEW PowerShell window:

```powershell
cd "d:/sdk kyc/aptos-kyc/example-dapp"
npm install  # First time only
npm run dev
```

Open browser: http://localhost:3000

---

## 🎯 How to Use the KYC System

### For Users (Testing):

1. **Open the dApp**: http://localhost:3000
2. **Connect Wallet**: Click "Connect Petra Wallet"
3. **Start KYC**: Click "Start KYC Process"
4. **Verify Email**:
   - Enter any email (e.g., `test@example.com`)
   - Click "Verify Email" (auto-verified in test mode)
5. **Verify Phone**:
   - Enter phone number (e.g., `+1234567890`)
   - Click "Verify Phone" (auto-verified in test mode)
6. **Upload ID**:
   - Choose any image file (JPG/PNG)
   - Click "Upload ID Document"
7. **Complete KYC**:
   - Click "Complete KYC"
   - **Approve transaction in Petra wallet** 
   - Wait 5-10 seconds for blockchain confirmation
8. **Done!** ✅ Your KYC is now on the blockchain!

### Check Verification Status:

The status card will automatically update showing:
- ✅ Verification Level (1, 2, or 3)
- 🔗 Transaction hash (click to view on Aptos Explorer)
- 🎫 Option to mint verification NFT

---

## 🔍 What Gets Verified?

### Verification Levels:

- **Level 1**: Email verified
- **Level 2**: Email + Phone verified  
- **Level 3**: Email + Phone + ID verified ✨

### What Goes On-Chain:

- ✅ Your wallet address
- ✅ Verification level (1, 2, or 3)
- ✅ Credential hash (encrypted proof of your data)
- ❌ **NOT stored**: Your actual email, phone, or ID image

**Privacy**: Only a cryptographic hash is stored on-chain, not your actual data!

---

## 📂 System Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │◄────►│    Backend   │◄────►│   MongoDB   │
│  (Next.js)  │      │  (Express)   │      │  (Cloud DB) │
└──────┬──────┘      └───────┬──────┘      └─────────────┘
       │                     │
       │                     │
       └──────────┬──────────┘
                  │
                  ▼
          ┌───────────────┐
          │ Aptos Testnet │
          │  (Blockchain) │
          └───────────────┘
```

**Flow:**
1. User enters data in browser
2. Backend validates & processes
3. Backend stores session in MongoDB
4. Backend submits proof to Aptos blockchain
5. Blockchain stores verification permanently

---

## 🛠️ Troubleshooting

### Error: "Aptos CLI not found"

Install Aptos CLI:
```powershell
# Download and install
winget install -e --id Aptos.AptosCLI
```

Or manually from: https://aptos.dev/tools/install-cli/

### Error: "Module not deployed"

Make sure you ran:
```powershell
cd contracts
aptos move publish --profile default
```

### Error: "MongoDB connection failed"

Check your `.env` file:
- ✅ Password special characters are URL-encoded (`@` becomes `%40`)
- ✅ Connection string has no spaces

### Error: "Transaction failed"

- Make sure you have testnet APT in your wallet
- Go to https://aptoslabs.com/testnet-faucet to get more
- Check you're on Testnet in Petra wallet

### Backend won't start

1. Check `.env` file has correct private key
2. Make sure MongoDB connection string is correct
3. Run `npm install` in backend folder

---

## 📱 API Endpoints

The backend API runs on `http://localhost:3001/api/v1`

### Available Endpoints:

```
POST /api/v1/session/start
  - Start a new KYC session
  - Body: { "walletAddress": "0x..." }

POST /api/v1/verify/email
  - Verify email
  - Body: { "sessionId": "...", "email": "user@example.com" }

POST /api/v1/verify/phone
  - Verify phone
  - Body: { "sessionId": "...", "phone": "+1234567890" }

POST /api/v1/verify/id
  - Upload ID document
  - Body: FormData with file

POST /api/v1/kyc/complete
  - Submit KYC to blockchain
  - Body: { "sessionId": "..." }

POST /api/v1/kyc/mint-nft
  - Mint verification NFT
  - Body: { "walletAddress": "0x..." }

GET /api/v1/status/:wallet
  - Check verification status
  - Returns: { verified, kycLevel, credentialHash }
```

---

## 🎓 How Verification Works

### Step-by-Step Process:

1. **User Submits Data** → Frontend sends to backend
2. **Backend Validates** → Checks format, generates hashes
3. **Session Stored** → Saves progress in MongoDB
4. **Hash Created** → Creates cryptographic proof
5. **Blockchain Transaction** → Submits to Aptos
6. **Permanent Record** → Verification stored forever

### Security Features:

- 🔐 **Encryption**: Data hashed before storage
- ⚡ **Blockchain**: Immutable & transparent
- 🔒 **Privacy**: Original data never stored on-chain
- ✅ **Verifiable**: Anyone can check verification status

---

## 📊 Check Your Verification

### On Aptos Explorer:

1. Go to: https://explorer.aptoslabs.com/?network=testnet
2. Paste your wallet address
3. Click "Transactions" tab
4. See all your KYC transactions!

### Using the SDK:

```typescript
import { KycClient } from '@cognifyr/aptos-kyc-sdk';

const client = new KycClient({
  baseUrl: 'http://localhost:3001/api/v1',
  aptosNodeUrl: 'https://fullnode.testnet.aptoslabs.com/v1'
});

// Check if address is verified
const status = await client.getStatus('0xYOUR_ADDRESS');
console.log(status);
// { verified: true, kycLevel: 3, ... }
```

---

## 🚀 Next Steps

### For Development:
- ✅ Test all verification flows
- ✅ Try minting verification NFT
- ✅ Check transactions on Aptos Explorer
- ✅ Test with different wallet addresses

### For Production:
- 📧 Integrate real email service (SendGrid, AWS SES)
- 📱 Integrate real SMS service (Twilio)
- 🔐 Use KMS for private key management
- 🌐 Deploy to mainnet
- 🛡️ Security audit

---

## 💡 Common Questions

**Q: Do I need real email/phone for testing?**  
A: No! Test mode auto-verifies instantly.

**Q: Is this free?**  
A: Yes! Testnet is completely free.

**Q: Can I use Metamask?**  
A: No! You need Petra wallet - Aptos is a different blockchain than Ethereum.

**Q: Where is my data stored?**  
A: Session data in MongoDB, verification proof on Aptos blockchain.

**Q: Can I delete my verification?**  
A: No - blockchain is permanent! But you can revoke it (mark as invalid).

**Q: How long do transactions take?**  
A: Usually 2-5 seconds on testnet.

**Q: Can others see my email/phone?**  
A: No! Only a cryptographic hash is public.

---

## 📞 Need Help?

1. **Check the error message** - it usually tells you what's wrong
2. **Verify .env file** - most issues are configuration
3. **Check Petra wallet** - make sure you're on testnet with APT
4. **Look at terminal logs** - backend shows detailed errors
5. **Check browser console** - press F12 to see frontend errors

---

## ✅ Success Checklist

Before going live, make sure:

- [ ] ✅ Petra wallet installed & funded
- [ ] ✅ Private key in `.env` file
- [ ] ✅ Smart contracts deployed
- [ ] ✅ MongoDB connected
- [ ] ✅ Backend running (port 3001)
- [ ] ✅ Frontend running (port 3000)
- [ ] ✅ Can connect wallet in browser
- [ ] ✅ Can complete full KYC flow
- [ ] ✅ Transactions visible on Explorer

---

**🎉 That's it! Your KYC system is now running!**

Start testing at: http://localhost:3000
