# Aptos KYC/Identity SDK

![Aptos KYC Logo](example-dapp/public/logo.png)

> **The Trust Layer for the World's Fastest Blockchain.**

A complete, production-ready identity and KYC infrastructure for the Aptos blockchain. This SDK enables dApps to integrate user verification, compliance checks, and on-chain reputation seamlessly, ensuring that speed never compromises security.

---

## ⚡ Why Super Fast Aptos Needs Trust Too

Aptos is engineered for unparalleled speed and scalability, processing thousands of transactions per second with sub-second latency. It is the Formula 1 of blockchains.

**But speed without control is dangerous.**

As the Aptos ecosystem expands into **DeFi**, **Real World Assets (RWA)**, and **Institutional Finance**, the need for reliable, compliant, and privacy-preserving identity verification becomes critical. You cannot build a mortgage platform, a compliant exchange, or a reputation-based DAO without knowing *who* is behind the address.

**This SDK bridges the gap.** It ensures that while your transactions move at the speed of light, they remain anchored in trust. We provide the guardrails that allow institutions and users to transact with confidence, unlocking the next trillion dollars of value on Aptos.

---

## 🌟 Key Features

### 🛡️ Super SDK Modules
We've modularized identity into powerful, composable building blocks:

- **🔐 AccessControl**: Granular permissioning for your dApp. Gate access based on KYC status, holdings, or custom logic.
- **⚖️ Compliance**: Automated regulatory checks. Ensure users meet age, region, and AML requirements before they transact.
- **🪪 Credentials**: W3C-compatible Verifiable Credentials (DID). Issue and verify portable identity proofs.
- **🚨 FraudGuard**: Real-time risk scoring. Detect and block suspicious wallets using on-chain behavioral analysis.
- **⭐ Reputation**: On-chain trust scores. Reward good actors and build a web of trust.

### 🧠 Local DeepFace Verification (New!)
Privacy is paramount. We've replaced external dependencies with a **100% Local AI** solution:
- **Privacy-First**: Biometric data never leaves your server.
- **Cost-Effective**: Zero API fees. No Azure/AWS bills.
- **Powered by DeepFace**: Uses the state-of-the-art **Facenet** model for high-accuracy face matching.
- **Liveness Detection**: Enforced webcam capture prevents spoofing with static images.

---

## 🏗️ Architecture

```mermaid
graph TD
    User[User] -->|Webcam Selfie| UI[dApp UI (Next.js)]
    UI -->|Upload Images| API[Backend API (Node.js)]
    API -->|Local DeepFace| Python[Python Verification Script]
    Python -->|Result| API
    API -->|Store Hash| DB[(PostgreSQL)]
    API -->|Submit Proof| Chain[Aptos Blockchain]
    
    subgraph On-Chain Modules
        Registry[Identity Registry]
        Access[Access Control]
        Rep[Reputation Store]
    end
    
    Chain <--> Registry
    Chain <--> Access
    Chain <--> Rep
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Python 3.10+ (for DeepFace)
- PostgreSQL
- Aptos CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cognifyr/aptos-kyc.git
   cd aptos-kyc
   ```

2. **Install Dependencies**
   ```bash
   npm run install:all
   ```

3. **Setup Python Environment (for DeepFace)**
   ```bash
   cd backend
   pip install deepface tf-keras opencv-python
   # The first run will automatically download the Facenet model weights (~90MB)
   ```

4. **Configure Environment**
   Update `backend/.env` with your database and Aptos settings.

5. **Run the Stack**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd example-dapp
   npm run dev
   ```

---

## 📖 SDK Usage

The SDK is designed for developer happiness. Integrating identity is as simple as a few lines of code.

```typescript
import { createKycClient } from '@cognifyr/aptos-kyc-sdk';

const client = createKycClient({
  apiBaseUrl: 'http://localhost:3001/api/v1',
  aptosNodeUrl: 'https://fullnode.testnet.aptoslabs.com/v1',
  moduleAddress: '0x...' // Your deployed contract address
});

// 1. Check Reputation
const score = await client.reputation.getScore(userAddress);
if (score < 50) throw new Error("Reputation too low");

// 2. Verify Identity (Webcam Flow)
await client.verifyFace(sessionId, idFile, selfieFile);

// 3. Check Compliance
const isCompliant = await client.compliance.checkCompliance(userAddress, ['US_RESTRICTED']);
```

---

## 📦 Monorepo Structure

- **`contracts/`**: Move smart contracts (The Trust Anchor).
- **`backend/`**: Node.js API + Python DeepFace Script (The Brain).
- **`sdk/`**: TypeScript Client (The Bridge).
- **`example-dapp/`**: Reference Implementation (The Demo).

---

## 🤝 Contributing

We are building the standard for identity on Aptos. Contributions are welcome!
Please read our [Contributing Guide](CONTRIBUTING.md) and join our [Discord](https://discord.gg/aptos-kyc).

---

## 📄 License

MIT © Cognifyr
