import { AptosClient, Types } from "aptos";

export class FraudGuard {
    private client: AptosClient;
    private moduleAddress: string;

    constructor(client: AptosClient, moduleAddress: string) {
        this.client = client;
        this.moduleAddress = moduleAddress;
    }

    /**
     * Check risk status for a wallet.
     * @param userAddress The address to check.
     * @returns Object containing risk score and blacklist status.
     */
    async checkRisk(userAddress: string): Promise<{ score: number; isBlacklisted: boolean }> {
        // Parallel fetch for score and blacklist status
        const scorePayload: Types.ViewRequest = {
            function: `${this.moduleAddress}::FraudGuard::get_risk_score`,
            type_arguments: [],
            arguments: [this.moduleAddress, userAddress]
        };

        const blacklistPayload: Types.ViewRequest = {
            function: `${this.moduleAddress}::FraudGuard::is_blacklisted`,
            type_arguments: [],
            arguments: [this.moduleAddress, userAddress]
        };

        try {
            const [scoreRes, blacklistRes] = await Promise.all([
                this.client.view(scorePayload),
                this.client.view(blacklistPayload)
            ]);

            return {
                score: Number(scoreRes[0]),
                isBlacklisted: blacklistRes[0] as boolean
            };
        } catch (error) {
            console.error("FraudGuard check failed:", error);
            return { score: 0, isBlacklisted: false };
        }
    }

    /**
     * Analyze a wallet for fraud (Stub for off-chain analysis trigger).
     * In a real system, this might call an external API or trigger an on-chain analysis.
     */
    async analyze(userAddress: string): Promise<void> {
        console.log(`Analyzing wallet ${userAddress} for fraud patterns...`);
        // Simulate analysis delay
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * Update risk score (Admin only).
     */
    async updateRisk(
        sender: any,
        user: string,
        riskScore: number,
        isBlacklisted: boolean
    ): Promise<string> {
        const payload: Types.TransactionPayload = {
            type: "entry_function_payload",
            function: `${this.moduleAddress}::FraudGuard::update_risk`,
            type_arguments: [],
            arguments: [
                this.moduleAddress, // store_addr
                user,
                riskScore,
                isBlacklisted
            ]
        };

        const txnRequest = await this.client.generateTransaction(sender.address(), payload);
        const signedTxn = await this.client.signTransaction(sender, txnRequest);
        const transactionRes = await this.client.submitTransaction(signedTxn);
        await this.client.waitForTransaction(transactionRes.hash);
        return transactionRes.hash;
    }
}
