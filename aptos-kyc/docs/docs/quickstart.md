---
sidebar_position: 6
---

# Quickstart Guide

Get the Aptos KYC SDK up and running in your development environment in 5 minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14
- **Aptos CLI** >= 2.0.0
- **Circom** >= 2.1.0 (for ZK proofs, optional)

## 1. Clone the Repository

```bash
git clone https://github.com/cognifyr/aptos-kyc.git
cd aptos-kyc
```

## 2. Install Dependencies

```bash
npm run install:all
```

This will install dependencies for all workspaces (backend, SDK, dApp, docs).

## 3. Set Up Database

Create a PostgreSQL database:

```bash
createdb aptos_kyc
```

## 4. Configure Environment

Copy the example environment file in the backend:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and configure:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/aptos_kyc"
APTOS_NODE_URL="https://fullnode.testnet.aptoslabs.com/v1"
APTOS_ISSUER_PRIVATE_KEY="0x..." # Get from Aptos CLI
APTOS_MODULE_ADDRESS="0x..."     # After deploying contracts
PORT=3001
JWT_SECRET="your-secret-key"
```

## 5. Initialize Aptos Account

```bash
aptos init
```

Follow the prompts to create a new account or import an existing one. Save your private key for the `.env` file.

## 6. Deploy Smart Contracts

```bash
cd ../contracts
aptos move compile
aptos move publish --profile default
```

Note the deployed module address and update `.env` with:
- `APTOS_MODULE_ADDRESS`
- `APTOS_CONFIG_ADDRESS`
- `APTOS_REGISTRY_ADDRESS`
- `APTOS_NFT_ADDRESS`

## 7. Initialize Contracts

After deployment, initialize the modules:

```bash
# Initialize KYC Config
aptos move run \
  --function-id 'YOUR_MODULE_ADDRESS::KYCConfig::init_config' \
  --args address:YOUR_ISSUER_ADDRESS

# Initialize Identity Registry
aptos move run \
  --function-id 'YOUR_MODULE_ADDRESS::IdentityRegistry::init' \
  --args address:YOUR_CONFIG_ADDRESS

# Initialize NFT Collection
aptos move run \
  --function-id 'YOUR_MODULE_ADDRESS::IdentityNFT::init_collection' \
  --args address:YOUR_CONFIG_ADDRESS address:YOUR_REGISTRY_ADDRESS
```

## 8. Set Up Database Schema

```bash
cd ../backend
npx prisma migrate dev --name init
npx prisma generate
```

## 9. Build All Packages

```bash
cd ..
npm run build
```

## 10. Start Development Servers

Open three terminal windows:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Example dApp:**
```bash
npm run dev:dapp
```

**Terminal 3 - Documentation:**
```bash
npm run dev:docs
```

## 11. Test the System

1. Open [http://localhost:3000](http://localhost:3000) for the example dApp
2. Install [Petra Wallet](https://petra.app/) if you haven't
3. Connect your wallet
4. Complete the KYC flow:
   - Enter email
   - Enter phone
   - Upload ID document
   - Submit to blockchain

## Verify It Works

Check your terminal for logs showing:
- ✅ Backend API running on port 3001
- ✅ dApp running on port 3000
- ✅ Session created
- ✅ Verification steps completed
- ✅ Transaction submitted to Aptos

View your transaction on [Aptos Explorer](https://explorer.aptoslabs.com/?network=testnet).

## Next Steps

- Read the [SDK documentation](./sdk.md) to integrate into your own dApp
- Learn about [security considerations](./security.md)
- Deploy to [production](./deployment.md)
- Explore the [API reference](./backend-api.md)

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify database exists

### Aptos Transaction Failed
- Check you have testnet APT (use faucet)
- Verify contract addresses in `.env`
- Ensure contracts are initialized

### SDK Errors
- Rebuild SDK: `cd sdk && npm run build`
- Check API is running on correct port
- Verify environment variables in dApp

### Wallet Not Connecting
- Install Petra wallet extension
- Switch to Aptos testnet in wallet
- Refresh the page

## Getting Help

- Check the [GitHub Issues](https://github.com/cognifyr/aptos-kyc/issues)
- Join our [Discord](https://discord.gg/aptos-kyc)
- Email: support@cognifyr.com
