---
sidebar_position: 2
---

# Architecture

This page provides a detailed overview of the Aptos KYC SDK architecture, explaining how all components work together.

## System Overview

The Aptos KYC SDK follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        dApp Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Next.js    │  │   React     │  │   Other     │         │
│  │   Example   │  │   Apps      │  │   dApps     │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────┐
│                   TypeScript SDK Layer                     │
│   ┌────────────────────────────────────────────────┐      │
│   │  KycClient (API + Aptos Integration)           │      │
│   └────────────────────────────────────────────────┘      │
└────────────────┬──────────────────┬────────────────────────┘
                 │                  │
         ┌───────▼──────┐    ┌──────▼────────┐
         │              │    │               │
┌────────▼──────┐  ┌────▼────────┐  ┌───────▼───────┐
│  Backend API  │  │   Aptos     │  │  Database     │
│  (Node.js)    │  │   Node      │  │  (PostgreSQL) │
└───────┬───────┘  └─────────────┘  └───────────────┘
        │
        │
┌───────▼────────────────────────────────────────────┐
│              Infrastructure Layer                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │   ZK     │  │  Email   │  │  File    │         │
│  │  Proofs  │  │  /SMS    │  │ Storage  │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└────────────────────────────────────────────────────┘
```

## Core Components

### 1. Move Smart Contracts

Three modules deployed on Aptos blockchain:

#### KYCConfig
- **Purpose**: Configuration and access control
- **Stores**: Owner address and trusted issuer address
- **Functions**:
  - `init_config`: Initialize configuration
  - `set_trusted_issuer`: Update issuer (owner only)
  - `get_trusted_issuer`: Query current issuer

#### IdentityRegistry
- **Purpose**: Core identity storage
- **Data Structure**:
  ```move
  struct Identity {
      wallet: address,
      kyc_level: u8,      // 0-3
      credential_hash: vector<u8>,
      verified: bool,
      version: u64
  }
  ```
- **Functions**:
  - `submit_kyc`: Add/update identity (issuer only)
  - `revoke_kyc`: Revoke verification (issuer only)
  - `get_identity`: Query identity data (view)

#### IdentityNFT
- **Purpose**: Soulbound NFT for verified users
- **Features**:
  - Non-transferable tokens
  - Minted only for verified users
  - Unique per wallet address
- **Functions**:
  - `init_collection`: Create NFT collection
  - `mint_identity_nft`: Mint NFT (issuer only)

### 2. Backend API Service

Node.js/TypeScript service with Express framework:

#### Layers

**Controllers**: Handle HTTP requests and responses
- `sessionController`: Session management
- `verifyController`: Email/phone/ID verification
- `kycController`: KYC completion and NFT minting
- `statusController`: Status queries

**Services**: Business logic
- `aptosService`: Blockchain interaction
- `emailService`: Email verification
- `phoneService`: SMS verification
- `idService`: Document processing
- `kycService`: KYC orchestration
- `zkService`: Zero-knowledge proofs

**Database**: Prisma ORM with PostgreSQL
- Session tracking
- Identity mirror
- API key management

#### API Endpoints

```
POST   /api/v1/session/start
GET    /api/v1/session/:sessionId
POST   /api/v1/verify/email
POST   /api/v1/verify/phone
POST   /api/v1/verify/id
POST   /api/v1/kyc/complete
POST   /api/v1/kyc/mint-nft
GET    /api/v1/status/:wallet
```

### 3. TypeScript SDK

Client library for dApp integration:

```typescript
class KycClient {
  // Session management
  startSession(walletAddress)
  getSession(sessionId)
  
  // Verification
  verifyEmail(sessionId, email, code?)
  verifyPhone(sessionId, phone, code?)
  uploadId(sessionId, file)
  
  // KYC actions
  completeKyc(sessionId)
  mintNft(walletAddress)
  getStatus(walletAddress)
  
  // Direct on-chain queries
  getOnChainIdentity(wallet, moduleAddr, registryAddr)
  isVerified(wallet, moduleAddr, registryAddr)
}
```

### 4. Zero-Knowledge Proofs

Optional privacy layer using Circom/snarkjs:

**Circuit**: `CredentialVerifier`
- Proves knowledge of credential without revealing it
- Uses Poseidon hash for efficiency
- Groth16 proving system

**Flow**:
1. Generate witness from credential
2. Create proof using zkey
3. Verify proof with verification key
4. Submit proof with public signals

## Data Flow

### KYC Completion Flow

```
1. dApp → SDK.startSession(wallet)
   ↓
2. SDK → Backend POST /session/start
   ↓
3. Backend → Database (create session)
   ↓
4. dApp → SDK.verifyEmail/Phone/ID
   ↓
5. Backend → Update session verification flags
   ↓
6. dApp → SDK.completeKyc(sessionId)
   ↓
7. Backend:
   - Compute credential_hash
   - Generate ZK proof (optional)
   - Submit to Aptos blockchain
   ↓
8. Aptos: IdentityRegistry.submit_kyc
   ↓
9. Backend → Database (save identity)
   ↓
10. dApp ← Success response with txHash
```

### Status Query Flow

```
1. dApp → SDK.getStatus(wallet)
   ↓
2. SDK → Backend GET /status/:wallet
   ↓
3. Backend → Aptos view call (get_identity)
   ↓
4. Backend → Database query (for txHash)
   ↓
5. Backend → Merge and return data
   ↓
6. dApp ← KYC status with on-chain data
```

## Security Model

### Trust Model

**Trusted Issuer**: Centralized verification authority
- Holds private key for submitting KYC
- Responsible for verification accuracy
- Can revoke verification

**On-Chain Data**: Immutable and transparent
- Identity hashes stored on-chain
- All changes emit events
- Auditable history

### Data Privacy

**Hashing**: Only hashes stored on-chain
- Email, phone, ID → SHA-256 hash
- Original data stored encrypted (optional)
- Credential hash = hash(email + phone + idHash)

**ZK Proofs**: Optional privacy enhancement
- Prove properties without revealing data
- Selective disclosure possible
- Age verification without birthdate

### Access Control

**On-Chain**: Move module authorization
- Only trusted issuer can submit/revoke
- Owner controls issuer address
- View functions public

**API**: Rate limiting and API keys
- Rate limits per IP/key
- Optional API key authentication
- Request validation

## Deployment Architecture

### Development
```
Local Machine:
- PostgreSQL (local)
- Backend API (localhost:3001)
- dApp (localhost:3000)
- Aptos Devnet
```

### Staging
```
Cloud Provider:
- RDS PostgreSQL
- Backend on Render/Railway
- dApp on Vercel
- Aptos Testnet
```

### Production
```
AWS/GCP:
- RDS Multi-AZ PostgreSQL
- Backend on ECS/Fargate
- CDN for dApp
- Aptos Mainnet
- KMS for issuer key
```

## Scalability Considerations

### Horizontal Scaling
- Backend API: Stateless, scale horizontally
- Database: Read replicas for status queries
- CDN: Static dApp assets

### Caching
- Identity status: Redis cache with TTL
- On-chain data: Cache view function results
- API responses: HTTP caching headers

### Optimization
- Batch verification processing
- Async blockchain submission
- Database indexing on wallet addresses

## Monitoring

### Metrics
- API request latency
- Blockchain transaction success rate
- Database query performance
- Verification completion rate

### Logging
- Structured JSON logs
- Transaction hashes for audit trail
- Error tracking with context
- User flow analytics

## Extension Points

### Custom Verification
- Add new verification types
- Implement custom scoring
- Integration with third-party KYC providers

### Multi-Chain Support
- Abstract blockchain interface
- Support multiple networks
- Cross-chain identity

### Advanced Features
- Reputation scores
- Tiered verification levels
- Compliance reporting
- Automated renewals
