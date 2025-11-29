---
sidebar_position: 7
---

# Security Considerations

Security is paramount when handling identity verification. This page outlines the security measures in the Aptos KYC SDK and best practices for production deployment.

## Threat Model

### Assets to Protect
1. User PII (email, phone, ID documents)
2. Issuer private keys
3. API endpoints and database
4. On-chain identity data integrity

### Threat Actors
- External attackers
- Malicious users
- Compromised accounts
- Insider threats

## Data Protection

### PII Handling

**Never Store Raw PII On-Chain**
- ✅ Store only SHA-256 hashes
- ❌ Never store plaintext email/phone/ID

**Backend Storage** (if needed):
```typescript
// Hash before storing
const emailHash = crypto.createHash('sha256')
  .update(email.toLowerCase())
  .digest('hex');

// If storing raw data, encrypt it
const encrypted = encryptDocument(document, encryptionKey);
```

**Recommendations**:
- Delete raw documents after processing
- Encrypt if storage is required
- Use KMS for encryption keys
- Implement data retention policies

### Credential Hash

The credential hash combines all verifications:

```
credentialHash = SHA256(email + phone + idHash)
```

**Properties**:
- Unique per user
- Deterministic (same inputs = same hash)
- One-way (cannot reverse to original data)
- Collision-resistant

## Key Management

### Issuer Private Key

**Critical**: The issuer key controls all KYC submissions.

**Production Best Practices**:

1. **Use Hardware Security Module (HSM)**
   ```bash
   # AWS KMS example
   aws kms create-key --description "Aptos KYC Issuer"
   ```

2. **Never Commit to Git**
   ```bash
   # .gitignore
   .env
   *.key
   ```

3. **Rotate Regularly**
   - Generate new key
   - Update trusted issuer on-chain
   - Migrate gradually

4. **Limit Access**
   - Principle of least privilege
   - Audit all key access
   - Multi-signature for changes

### API Keys

**Generation**:
```typescript
const apiKey = `ak_${uuidv4().replace(/-/g, '')}`;
```

**Storage**:
- Hash API keys in database
- Use bcrypt with salt
- Never log full keys

**Rotation**:
- Provide rotation mechanism
- Grace period for migration
- Notify users of expiration

## API Security

### Authentication

**API Key Required** (optional but recommended):
```typescript
headers: {
  'x-api-key': 'your-api-key'
}
```

**JWT for Session** (optional):
- Short expiration (15 min)
- Refresh token mechanism
- Invalidate on logout

### Rate Limiting

**Per IP**:
```typescript
const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100
});
```

**Per API Key**:
```typescript
max: apiKey.rateLimitPerMinute
```

**Recommendation**:
- Stricter limits on sensitive endpoints
- Exponential backoff for failures
- CAPTCHA for repeated violations

### Input Validation

**All Inputs**:
```typescript
const schema = Joi.object({
  sessionId: Joi.string().uuid().required(),
  email: Joi.string().email().required()
});
```

**File Uploads**:
- Validate MIME type
- Check file size limits
- Scan for malware
- Verify image integrity

### HTTPS/TLS

**Always Use TLS**:
```nginx
server {
  listen 443 ssl;
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
}
```

## Blockchain Security

### Smart Contract Security

**Access Control**:
```move
// Only trusted issuer can submit
assert!(signer::address_of(issuer) == trusted_issuer, ENOT_AUTHORIZED);
```

**Best Practices**:
- Audit contracts before deployment
- Use formal verification tools
- Test extensively on devnet/testnet
- Monitor all transactions

### Transaction Security

**Verification**:
```typescript
// Wait for confirmation
await client.waitForTransaction(txHash);

// Verify transaction succeeded
const txn = await client.getTransactionByHash(txHash);
if (!txn.success) {
  throw new Error('Transaction failed');
}
```

**Gas Management**:
- Set appropriate gas limits
- Monitor gas prices
- Implement retry logic

## Database Security

### PostgreSQL Hardening

**Connection**:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/aptos_kyc?sslmode=require"
```

**Best Practices**:
- Use SSL/TLS connections
- Limit user privileges
- Regular backups
- Enable query logging

### SQL Injection Prevention

**Use Parameterized Queries** (Prisma does this):
```typescript
await prisma.session.findUnique({
  where: { id: sessionId } // Safe, parameterized
});
```

**Never**:
```typescript
// ❌ NEVER DO THIS
await prisma.$queryRaw`SELECT * FROM sessions WHERE id = ${sessionId}`;
```

## Zero-Knowledge Proofs

### Circuit Security

**Trusted Setup**:
- Use multi-party computation (MPC)
- Verify ceremony participants
- Publish ceremony transcripts

**Verification**:
```typescript
const isValid = await snarkjs.groth16.verify(
  verificationKey,
  publicSignals,
  proof
);
```

### Proof Privacy

**Benefits**:
- Selective disclosure
- Privacy-preserving verification
- Unlinkability

**Limitations**:
- Computational overhead
- Complexity
- Potential side-channel attacks

## Operational Security

### Logging

**Do Log**:
- API requests (without PII)
- Authentication attempts
- Transaction hashes
- Errors and exceptions

**Don't Log**:
- Passwords or API keys
- Raw PII
- Session tokens
- Sensitive parameters

### Monitoring

**Alerts**:
- Failed authentication spike
- Unusual transaction patterns
- Database errors
- API downtime

**Tools**:
- Sentry for error tracking
- Datadog/New Relic for APM
- CloudWatch/Stackdriver for infrastructure

### Incident Response

**Plan**:
1. Detect and assess
2. Contain the threat
3. Eradicate the cause
4. Recover systems
5. Post-incident review

**Preparation**:
- Document runbooks
- Test disaster recovery
- Maintain contact list
- Practice scenarios

## Compliance

### GDPR Considerations

**Right to be Forgotten**:
- Revoke on-chain verification
- Delete off-chain PII
- Note: On-chain data is immutable

**Data Minimization**:
- Collect only necessary data
- Hash or encrypt sensitive fields
- Implement retention policies

### KYC/AML Compliance

**Record Keeping**:
- Maintain audit logs
- Store verification evidence
- Document policy changes
- 5-year retention (typical)

**Verification Standards**:
- ID document verification
- Liveness detection
- Address verification
- Adverse media screening

## Production Checklist

### Before Launch

- [ ] Security audit of smart contracts
- [ ] Penetration testing of API
- [ ] Review all environment variables
- [ ] Enable HTTPS/TLS everywhere
- [ ] Set up monitoring and alerting
- [ ] Configure rate limiting
- [ ] Test disaster recovery
- [ ] Document incident response
- [ ] Review access controls
- [ ] Enable database backups
- [ ] Implement key rotation
- [ ] Configure CORS properly
- [ ] Add security headers
- [ ] Enable WAF (if applicable)
- [ ] Review dependency vulnerabilities

### Ongoing

- [ ] Regular security patches
- [ ] Dependency updates
- [ ] Log review
- [ ] Access audit
- [ ] Key rotation
- [ ] Backup testing
- [ ] Security training
- [ ] Policy updates

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public GitHub issue
2. Email: security@cognifyr.com
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to resolve the issue.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Move Security Best Practices](https://aptos.dev/move/move-on-aptos/security/)
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
