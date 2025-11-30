import { AptosClient, Types } from "aptos";

export class Reputation {
    private client: AptosClient;
    private moduleAddress: string;

    constructor(client: AptosClient, moduleAddress: string) {
        this.client = client;
        this.moduleAddress = moduleAddress;
    }

    /**
     * Get reputation score and badges for a user.
     * @param userAddress The address to check.
     * @returns Object containing score and badges.
     */
    async getScore(userAddress: string): Promise<{ score: number; badges: string[] }> {
        const scorePayload: Types.ViewRequest = {
            function: `${this.moduleAddress}::ReputationStore::get_score`,
            type_arguments: [],
            arguments: [this.moduleAddress, userAddress]
        };

        const badgesPayload: Types.ViewRequest = {
            function: `${this.moduleAddress}::ReputationStore::get_badges`,
            type_arguments: [],
            arguments: [this.moduleAddress, userAddress]
        };

        try {
            const [scoreRes, badgesRes] = await Promise.all([
                this.client.view(scorePayload),
                this.client.view(badgesPayload)
            ]);

            return {
                score: Number(scoreRes[0]),
                badges: badgesRes[0] as string[]
            };
        } catch (error) {
            console.error("Reputation check failed:", error);
            return { score: 0, badges: [] };
        }
    }

    /**
     * Update reputation score (Admin only).
     */
    async updateScore(
        sender: any,
        user: string,
        newScore: number
    ): Promise<string> {
        const payload: Types.TransactionPayload = {
            type: "entry_function_payload",
            function: `${this.moduleAddress}::ReputationStore::update_score`,
            type_arguments: [],
            arguments: [
                this.moduleAddress, // store_addr
                user,
                newScore
            ]
        };

        const txnRequest = await this.client.generateTransaction(sender.address(), payload);
        const signedTxn = await this.client.signTransaction(sender, txnRequest);
        const transactionRes = await this.client.submitTransaction(signedTxn);
        await this.client.waitForTransaction(transactionRes.hash);
        return transactionRes.hash;
    }
}
