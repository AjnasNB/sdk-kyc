import crypto from 'crypto';

class PhoneService {
    private verificationCodes: Map<string, string> = new Map();

    /**
     * Send verification code via SMS (simulated for MVP)
     * In production, integrate with Twilio, AWS SNS, etc.
     */
    async sendVerificationCode(sessionId: string, phone: string): Promise<void> {
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code temporarily (in production, use Redis with TTL)
        this.verificationCodes.set(sessionId, code);

        // Simulate sending SMS
        console.log(`[PHONE SERVICE] Sending code ${code} to ${phone}`);

        // TODO: In production, send real SMS
        // await smsProvider.send({
        //   to: phone,
        //   message: `Your KYC verification code is: ${code}`
        // });
    }

    /**
     * Verify phone code
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
     * Hash phone number for privacy
     */
    hashPhone(phone: string): string {
        // Remove all non-numeric characters
        const cleaned = phone.replace(/\D/g, '');
        return crypto.createHash('sha256').update(cleaned).digest('hex');
    }

    /**
     * Validate phone number format
     */
    validatePhoneFormat(phone: string): boolean {
        // Basic validation - should have at least 10 digits
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 15;
    }
}

export default new PhoneService();
