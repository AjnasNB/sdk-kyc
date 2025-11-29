---
sidebar_position: 5
---

# SDK Guide

Learn how to integrate the Aptos KYC SDK into your dApp.

## Installation

```bash
npm install @cognifyr/aptos-kyc-sdk
```

## Quick Start

```typescript
import { createKycClient } from '@cognifyr/aptos-kyc-sdk';

const kyc = createKycClient({
  apiBaseUrl: 'https://api.your-kyc-service.com',
  aptosNodeUrl: 'https://fullnode.testnet.aptoslabs.com/v1'
});
```

## Configuration

### KycClientConfig

```typescript
interface KycClientConfig {
  apiBaseUrl: string;        // Required: Your backend API URL
  aptosNodeUrl?: string;     // Optional: For on-chain queries
  apiKey?: string;           // Optional: API key for authentication
  timeout?: number;          // Optional: Request timeout in ms (default: 30000)
}
```

## API Reference

### Session Management

#### startSession

Start a new KYC verification session.

```typescript
const session = await kyc.startSession(walletAddress);

// Returns:
{
  sessionId: "uuid",
  walletAddress: "0x...",
  status: "PENDING",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

#### getSession

Retrieve session details.

```typescript
const details = await kyc.getSession(sessionId);

// Returns:
{
  sessionId: "uuid",
  walletAddress: "0x...",
  email: "user@example.com",
  phone: "+1234567890",
  emailVerified: true,
  phoneVerified: true,
  idVerified: false,
  status: "PENDING",
  createdAt: "...",
  updatedAt: "..."
}
```

### Verification Methods

#### verifyEmail

Verify user's email address.

```typescript
// Send verification code
await kyc.verifyEmail(sessionId, 'user@example.com');

// With code verification
await kyc.verifyEmail(sessionId, 'user@example.com', '123456');

// Returns:
{
  success: true,
  message: "Email verified successfully",
  emailVerified: true
}
```

#### verifyPhone

Verify user's phone number.

```typescript
// Send verification code
await kyc.verifyPhone(sessionId, '+1234567890');

// With code verification
await kyc.verifyPhone(sessionId, '+1234567890', '123456');

// Returns:
{
  success: true,
  message: "Phone verified successfully",
  phoneVerified: true
}
```

#### uploadId

Upload and verify ID document.

```typescript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const result = await kyc.uploadId(sessionId, file);

// Returns:
{
  success: true,
  message: "ID document verified successfully",
  idHash: "abc123...",
  idVerified: true
}
```

### KYC Actions

#### completeKyc

Complete KYC and submit to blockchain.

```typescript
const result = await kyc.completeKyc(sessionId);

// Returns:
{
  txHash: "0x...",
  kycLevel: 3,
  explorerUrl: "https://explorer.aptoslabs.com/txn/..."
}
```

#### mintNft

Mint identity NFT for verified user.

```typescript
const result = await kyc.mintNft(walletAddress);

// Returns:
{
  txHash: "0x...",
  explorerUrl: "https://explorer.aptoslabs.com/txn/..."
}
```

### Status Queries

#### getStatus

Get KYC status for a wallet.

```typescript
const status = await kyc.getStatus(walletAddress);

// Returns:
{
  walletAddress: "0x...",
  verified: true,
  kycLevel: 3,
  credentialHash: "abc123...",
  lastTxHash: "0x...",
  version: 1
}
```

#### getOnChainIdentity

Query identity directly from blockchain.

```typescript
const identity = await kyc.getOnChainIdentity(
  walletAddress,
  moduleAddress,
  registryAddress
);

// Returns:
{
  wallet: "0x...",
  kycLevel: 3,
  credentialHash: [1, 2, 3, ...],
  verified: true,
  version: 1
}
```

#### isVerified

Check if wallet is verified on-chain.

```typescript
const verified = await kyc.isVerified(
  walletAddress,
  moduleAddress,
  registryAddress
);

// Returns: boolean
```

## Error Handling

The SDK provides typed errors:

```typescript
import {
  KycError,
  ValidationError,
  NetworkError,
  AuthError,
  NotFoundError,
  ServerError
} from '@cognifyr/aptos-kyc-sdk';

try {
  await kyc.completeKyc(sessionId);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof AuthError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof ServerError) {
    console.error('Server error:', error.message);
  }
}
```

## React Integration

### React Hook Example

```typescript
import { useState } from 'react';
import { createKycClient } from '@cognifyr/aptos-kyc-sdk';

function useKyc() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const kyc = createKycClient({
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    aptosNodeUrl: process.env.NEXT_PUBLIC_APTOS_NODE_URL
  });

  const startKyc = async (walletAddress) => {
    setLoading(true);
    setError(null);
    try {
      const session = await kyc.startSession(walletAddress);
      return session;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { kyc, loading, error, startKyc };
}
```

### Component Example

```typescript
function KycButton({ walletAddress }) {
  const { kyc, loading, error, startKyc } = useKyc();
  const [sessionId, setSessionId] = useState(null);

  const handleClick = async () => {
    const session = await startKyc(walletAddress);
    setSessionId(session.sessionId);
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Starting KYC...' : 'Start KYC'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {sessionId && <p>Session ID: {sessionId}</p>}
    </div>
  );
}
```

## Complete Flow Example

```typescript
async function completeKycFlow(walletAddress) {
  const kyc = createKycClient({
    apiBaseUrl: 'https://api.example.com',
  });

  try {
    // 1. Start session
    const session = await kyc.startSession(walletAddress);
    console.log('Session started:', session.sessionId);

    // 2. Verify email
    await kyc.verifyEmail(session.sessionId,'user@example.com');
    console.log('Email verified');

    // 3. Verify phone
    await kyc.verifyPhone(session.sessionId, '+1234567890');
    console.log('Phone verified');

    // 4. Upload ID
    const idFile = ... // File from input
    await kyc.uploadId(session.sessionId, idFile);
    console.log('ID verified');

    // 5. Complete KYC
    const result = await kyc.completeKyc(session.sessionId);
    console.log('KYC completed:', result.txHash);

    // 6. Check status
    const status = await kyc.getStatus(walletAddress);
    console.log('Status:', status);

    // 7. Optional: Mint NFT
    const nft = await kyc.mintNft(walletAddress);
    console.log('NFT minted:', nft.txHash);

  } catch (error) {
    console.error('KYC flow failed:', error);
    throw error;
  }
}
```

## TypeScript Types

All types are exported from the SDK:

```typescript
import type {
  KycClientConfig,
  SessionResponse,
  SessionDetails,
  VerificationResponse,
  KycCompletionResponse,
  KycStatus,
  NftMintResponse,
  OnChainIdentity
} from '@cognifyr/aptos-kyc-sdk';
```

## Best Practices

### 1. Error Handling

Always wrap SDK calls in try-catch:

```typescript
try {
  await kyc.completeKyc(sessionId);
} catch (error) {
  // Handle error appropriately
  showErrorMessage(error.message);
}
```

### 2. Loading States

Show loading indicators during async operations:

```typescript
setLoading(true);
try {
  await kyc.verifyEmail(sessionId, email);
} finally {
  setLoading(false);
}
```

### 3. User Feedback

Provide clear feedback at each step:

```typescript
await kyc.verifyEmail(sessionId, email);
showSuccess('✅ Email verified!');
```

### 4. Validation

Validate inputs before sending to SDK:

```typescript
if (!isValidEmail(email)) {
  throw new Error('Invalid email format');
}
await kyc.verifyEmail(sessionId, email);
```

### 5. Session Management

Store session ID securely:

```typescript
// Use state management or localStorage
sessionStorage.setItem('kycSessionId', sessionId);
```

## Advanced Usage

### Custom Timeout

```typescript
const kyc = createKycClient({
  apiBaseUrl: '...',
  timeout: 60000 // 60 seconds
});
```

### API Key Authentication

```typescript
const kyc = createKycClient({
  apiBaseUrl: '...',
  apiKey: 'your-api-key'
});
```

### Direct On-Chain Queries

```typescript
// Query blockchain directly without backend
const identity = await kyc.getOnChainIdentity(
  walletAddress,
  '0x123...', // module address
  '0x456...'  // registry address
);
```

## Next Steps

- See the [Example dApp](https://github.com/cognifyr/aptos-kyc/tree/main/example-dapp) for a complete implementation
- Read the [API Reference](./backend-api.md) for backend endpoints
- Review [Security](./security.md) best practices
