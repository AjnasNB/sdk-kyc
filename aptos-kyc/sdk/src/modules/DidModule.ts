import { KycClient } from '../client';

export class DidModule {
    constructor(private client: KycClient) { }

    async issue(params: { wallet: string; type: string; data: any }): Promise<{ id: string; txHash: string }> {
        return this.client.request('/api/v1/did/issue', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    async getCredentials(wallet: string): Promise<any[]> {
        return this.client.request(`/api/v1/did/${wallet}`);
    }
}
