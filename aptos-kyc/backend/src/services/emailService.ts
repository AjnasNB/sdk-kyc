import crypto from 'crypto';

class EmailService {
    private verificationCodes: Map<string, string> = new Map();

    /**
     * Send verification code to email (simulated for MVP)
     * In production, integrate with SendGrid, AWS SES, etc.
     */
    async sendVerificationCode(sessionId: string, email: string): Promise<void> {
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code temporarily (in production, use Redis with TTL)
        this.verificationCodes.set(sessionId, code);

        // Simulate sending email
        console.log(`[EMAIL SERVICE] Sending code ${code} to ${email}`);

        // TODO: In production, send real email
        // await emailProvider.send({
        //   to: email,
        //   subject: 'Your KYC Verification Code',
        //   body: `Your verification code is: ${code}`
        // });
    }

    /**
     * Verify email code
     * For MVP, auto-verify or use stored code
     */
    async verifyCode(sessionId: string, code?: string): Promise<boolean> {
        // For MVP, auto-verify
        if (!code) {
            return true;
        }

        const storedCode = this.verificationCodes.get(sessionId);
        if (!storedCode) {
            // Auto-verify if no code was sent (MVP mode)
            return true;
        }

        const isValid = storedCode === code;
        if (isValid) {
            // Clean up used code
            this.verificationCodes.delete(sessionId);
        }

        return isValid;
    }

    /**
     * Hash email for privacy
     */
    hashEmail(email: string): string {
        return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
    }
}

export default new EmailService();
