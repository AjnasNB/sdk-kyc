import { KycClient } from '../client';

export class FraudModule {
    constructor(private client: KycClient) { }

    async checkRisk(wallet: string): Promise<{ score: number; isBlacklisted: boolean }> {
        return this.client.request(`/api/v1/fraud/${wallet}`);
    }

    async analyze(wallet: string): Promise<{ success: boolean; riskScore: number; isBlacklisted: boolean; txHash: string }> {
        return this.client.request('/api/v1/fraud/analyze', {
            method: 'POST',
            body: JSON.stringify({ wallet })
        });
    }
}
