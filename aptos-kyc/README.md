# Aptos KYC/Identity SDK

A complete, production-ready identity and KYC infrastructure for the Aptos blockchain, enabling dApps to integrate user verification seamlessly.

## 🌟 Features

- **Smart Contracts (Move)**: Identity registry, configuration, and soulbound NFTs
- **Backend Service**: REST API for verification orchestration with PostgreSQL
- **Zero-Knowledge Proofs**: Privacy-preserving credential verification using Circom
- **TypeScript SDK**: Easy integration for any Aptos dApp
- **Sample dApp**: Complete Next.js demo with wallet integration
- **Documentation**: Comprehensive Docusaurus site

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌───────────────┐
│   dApp UI   │────────▶│  TypeScript  │────────▶│    Backend    │
│  (Next.js)  │         │     SDK      │         │   API Server  │
└─────────────┘         └──────────────┘         └───────┬───────┘
                                                          │
                        ┌─────────────────────────────────┼────────┐
                        │                                 │        │
                        ▼                                 ▼        ▼
                ┌───────────────┐              ┌──────────────┐  ┌────┐
                │ Aptos Network │              │  PostgreSQL  │  │ ZK │
                │ (Move Modules)│              │   Database   │  │Proof│
                └───────────────┘              └──────────────┘  └────┘
```

## 📦 Monorepo Structure

```
aptos-kyc/
├── contracts/          # Move smart contracts
├── backend/            # Node.js API service
├── sdk/                # TypeScript SDK
├── example-dapp/       # Next.js demo application
├── docs/               # Docusaurus documentation
└── package.json        # Workspace root
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Aptos CLI >= 2.0.0
- Circom >= 2.1.0 (for ZK circuits)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cognifyr/aptos-kyc.git
   cd aptos-kyc
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   Backend (`backend/.env`):
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/aptos_kyc"
   
   # Aptos Configuration
   APTOS_NODE_URL="https://fullnode.testnet.aptoslabs.com/v1"
   APTOS_FAUCET_URL="https://faucet.testnet.aptoslabs.com"
   APTOS_ISSUER_PRIVATE_KEY="0x..." # Your issuer account private key
   APTOS_MODULE_ADDRESS="0x..." # Deployed module address
   
   # Server
   PORT=3001
   NODE_ENV=development
   
   # Security
   JWT_SECRET="your-secret-key-here"
   API_KEY_ENABLED=false
   ```

4. **Deploy Move contracts**
   ```bash
   cd contracts
   aptos init  # Configure your Aptos profile
   aptos move compile
   aptos move publish --profile default
   cd ..
   ```

5. **Set up database**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   cd ..
   ```

6. **Build ZK circuits** (optional for MVP)
   ```bash
   cd backend
   npm run zk:setup
   cd ..
   ```

7. **Build all packages**
   ```bash
   npm run build
   ```

### Running Locally

**Backend API:**
```bash
npm run dev:backend
# Server runs on http://localhost:3001
```

**Example dApp:**
```bash
npm run dev:dapp
# dApp runs on http://localhost:3000
```

**Documentation:**
```bash
npm run dev:docs
# Docs run on http://localhost:3002
```

## 📚 Documentation

Visit the full documentation at [docs/](./docs/) or run the docs server:

- [Introduction](./docs/docs/intro.md)
- [Architecture](./docs/docs/architecture.md)
- [Smart Contracts](./docs/docs/contracts.md)
- [Backend API](./docs/docs/backend-api.md)
- [SDK Usage](./docs/docs/sdk.md)
- [Quickstart Guide](./docs/docs/quickstart.md)
- [Security](./docs/docs/security.md)
- [Deployment](./docs/docs/deployment.md)

## 🔧 Development

### Smart Contracts

```bash
cd contracts
aptos move compile
aptos move test
```

### Backend

```bash
cd backend
npm run dev          # Run dev server with hot reload
npm run build        # Build TypeScript
npm run test         # Run tests
npm run prisma:studio # Open Prisma Studio
```

### SDK

```bash
cd sdk
npm run build        # Build SDK
npm run test         # Run tests
```

### Example dApp

```bash
cd example-dapp
npm run dev          # Run Next.js dev server
npm run build        # Build for production
```

## 🧪 Testing

Run all tests across workspaces:
```bash
npm run test
```

## 📖 SDK Usage

```typescript
import { createKycClient } from '@cognifyr/aptos-kyc-sdk';

const kyc = createKycClient({
  apiBaseUrl: 'https://api.kyc.example.com',
  aptosNodeUrl: 'https://fullnode.testnet.aptoslabs.com/v1'
});

// Start KYC session
const { sessionId } = await kyc.startSession(walletAddress);

// Verify email
await kyc.verifyEmail(sessionId, 'user@example.com');

// Verify phone
await kyc.verifyPhone(sessionId, '+1234567890');

// Upload ID document
await kyc.uploadId(sessionId, idFile);

// Complete KYC (writes to blockchain)
const { txHash, kycLevel } = await kyc.completeKyc(sessionId);

// Check status
const status = await kyc.getStatus(walletAddress);
```

## 🔐 Security

- **Trusted Issuer Model**: Only authorized issuer can submit KYC data
- **PII Protection**: Stores only hashes, not raw documents
- **API Key Authentication**: Rate limiting and access control
- **ZK Proofs**: Privacy-preserving verification options
- **Soulbound NFTs**: Non-transferable identity tokens

See [Security Documentation](./docs/docs/security.md) for details.

## 🚢 Deployment

### Contracts
```bash
cd contracts
aptos move publish --profile mainnet
```

### Backend (Railway/Render)
```bash
cd backend
# Set environment variables in platform
# Deploy via GitHub integration or CLI
```

### SDK (npm)
```bash
cd sdk
npm publish --access public
```

### dApp (Vercel)
```bash
cd example-dapp
vercel deploy --prod
```

See [Deployment Guide](./docs/docs/deployment.md) for detailed instructions.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct.

## 📄 License

MIT © Cognifyr

## 🔗 Links

- [Aptos Documentation](https://aptos.dev)
- [Move Language](https://move-language.github.io/move/)
- [Circom](https://docs.circom.io/)
- [snarkjs](https://github.com/iden3/snarkjs)

## 💬 Support

For issues and questions:
- GitHub Issues: [github.com/cognifyr/aptos-kyc/issues](https://github.com/cognifyr/aptos-kyc/issues)
- Discord: [Join our community](https://discord.gg/aptos-kyc)
- Email: support@cognifyr.com
