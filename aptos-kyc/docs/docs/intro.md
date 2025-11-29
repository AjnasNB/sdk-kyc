---
sidebar_position: 1
---

# Introduction

Welcome to the **Aptos KYC/Identity SDK** documentation! This comprehensive system provides identity verification and KYC (Know Your Customer) infrastructure for the Aptos blockchain.

## What is Aptos KYC SDK?

The Aptos KYC SDK is a complete, production-ready solution that enables decentralized applications (dApps) to integrate user identity verification seamlessly. It consists of:

- **Move Smart Contracts**: On-chain identity registry and soulbound NFTs
- **Backend API**: Verification orchestration and issuer service
- **TypeScript SDK**: Easy-to-use client library for dApp integration
- **Zero-Knowledge Proofs**: Privacy-preserving credential verification
- **Example dApp**: Reference implementation with Next.js

## Key Features

### 🔐 Secure & Private
- Only credential hashes stored on-chain
- Zero-knowledge proof support for privacy
- Industry-standard encryption for sensitive data

### ⚡ Fast & Efficient
- Complete verification in minutes
- Optimized gas costs on Aptos
- Real-time status updates

### 🌐 Decentralized
- On-chain identity verification
- Soulbound NFTs (non-transferable)
- Trusted issuer model

### 🛠️ Developer-Friendly
- Simple SDK integration
- Comprehensive documentation
- Example dApp included

## Use Cases

- **DeFi Protocols**: Comply with regulations while maintaining decentralization
- **NFT Marketplaces**: Verify seller/buyer identities
- **DAOs**: Implement sybil-resistance
- **Gaming**: Age verification and account security
- **Social Networks**: Verified user badges

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌───────────────┐
│   dApp UI   │────────▶│  TypeScript  │────────▶│    Backend    │
│             │         │     SDK      │         │   API Server  │
└─────────────┘         └──────────────┘         └───────┬───────┘
                                                          │
                        ┌─────────────────────────────────┼────────┐
                        │                                 │        │
                        ▼                                 ▼        ▼
                ┌───────────────┐              ┌──────────────┐  ┌────┐
                │ Aptos Network │              │  PostgreSQL  │  │ ZK │
                │ (Move Modules)│              │   Database   │  │    │
                └───────────────┘              └──────────────┘  └────┘
```

## Quick Links

- [Architecture](./architecture.md): System design and components
- [Contracts](./contracts.md): Move smart contract documentation
- [Backend API](./backend-api.md): REST API reference
- [SDK Guide](./sdk.md): TypeScript SDK usage
- [Quickstart](./quickstart.md): Get started in 5 minutes
- [Security](./security.md): Security considerations
- [Deployment](./deployment.md): Production deployment guide

## Support

- **GitHub**: [github.com/cognifyr/aptos-kyc](https://github.com/cognifyr/aptos-kyc)
- **Discord**: [Join our community](https://discord.gg/aptos-kyc)
- **Email**: support@cognifyr.com

## License

MIT © Cognifyr
