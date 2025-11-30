import { AptosClient, Types } from "aptos";

export class Compliance {
    private client: AptosClient;
    private moduleAddress: string;

    constructor(client: AptosClient, moduleAddress: string) {
        this.client = client;
        this.moduleAddress = moduleAddress;
    }

    /**
     * Check compliance for a user against a specific rule.
     * @param userAddress The address of the user to check.
     * @param ruleName The name of the compliance rule.
     * @returns True if compliant, false otherwise.
     */
    async checkCompliance(userAddress: string, ruleName: string): Promise<boolean> {
        const payload: Types.ViewRequest = {
            function: `${this.moduleAddress}::ComplianceEngine::check_compliance`,
            type_arguments: [],
            arguments: [
                userAddress,
                this.moduleAddress, // store_addr
                this.moduleAddress, // registry_addr
                this.moduleAddress, // repute_addr
                this.moduleAddress, // fraud_addr
                this.moduleAddress, // cred_addr
                ruleName
            ]
        };

        try {
            const result = await this.client.view(payload);
            return result[0] as boolean;
        } catch (error) {
            console.error("Compliance check failed:", error);
            return false;
        }
    }

    /**
     * Add a new compliance rule (Admin only).
     * @param sender The signer account (must be trusted issuer).
     * @param name Rule name.
     * @param criteria Rule criteria.
     */
    async addRule(
        sender: any, // AptosAccount or similar
        name: string,
        criteria: {
            minKycLevel: number;
            minTrustScore: number;
            maxRiskScore: number;
            requiredCredential: string;
        }
    ): Promise<string> {
        const payload: Types.TransactionPayload = {
            type: "entry_function_payload",
            function: `${this.moduleAddress}::ComplianceEngine::add_rule`,
            type_arguments: [],
            arguments: [
                this.moduleAddress, // store_addr
                name,
                criteria.minKycLevel,
                criteria.minTrustScore,
                criteria.maxRiskScore,
                criteria.requiredCredential
            ]
        };

        const txnRequest = await this.client.generateTransaction(sender.address(), payload);
        const signedTxn = await this.client.signTransaction(sender, txnRequest);
        const transactionRes = await this.client.submitTransaction(signedTxn);
        await this.client.waitForTransaction(transactionRes.hash);
        return transactionRes.hash;
    }
}
