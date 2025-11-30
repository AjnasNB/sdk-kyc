import { KycClient } from '../client';

export class ReputationModule {
    constructor(private client: KycClient) { }

    async getScore(wallet: string): Promise<{ score: number; badges: string[]; history: any[] }> {
        return this.client.request(`/api/v1/repute/${wallet}`);
    }

    async calculate(wallet: string): Promise<{ success: boolean; score: number; txHash: string }> {
        return this.client.request('/api/v1/repute/calculate', {
            method: 'POST',
            body: JSON.stringify({ wallet })
        });
    }
}
