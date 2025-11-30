import { AptosClient, Types } from "aptos";

export class AccessControl {
    private client: AptosClient;
    private moduleAddress: string;

    constructor(client: AptosClient, moduleAddress: string) {
        this.client = client;
        this.moduleAddress = moduleAddress;
    }

    /**
     * Check if a user has access based on various criteria.
     * @param userAddress The address of the user to check.
     * @param criteria The criteria for access control.
     * @returns True if access is granted, false otherwise.
     */
    async checkAccess(
        userAddress: string,
        criteria: {
            minKycLevel?: number;
            minTrustScore?: number;
            maxRiskScore?: number;
            requiredCredential?: string;
        }
    ): Promise<boolean> {
        const payload: Types.ViewRequest = {
            function: `${this.moduleAddress}::AccessControl::check_access`,
            type_arguments: [],
            arguments: [
                userAddress,
                this.moduleAddress, // registry_addr
                this.moduleAddress, // repute_addr
                this.moduleAddress, // fraud_addr
                this.moduleAddress, // cred_addr
                criteria.minKycLevel || 0,
                criteria.minTrustScore || 0,
                criteria.maxRiskScore || 100,
                criteria.requiredCredential || ""
            ]
        };

        try {
            const result = await this.client.view(payload);
            return result[0] as boolean;
        } catch (error) {
            console.error("AccessControl check failed:", error);
            return false;
        }
    }

    /**
     * Assert access for a user. Throws an error if access is denied.
     * Note: This is a simulation of the on-chain assertion.
     */
    async assertAccess(
        userAddress: string,
        criteria: {
            minKycLevel?: number;
            minTrustScore?: number;
            maxRiskScore?: number;
            requiredCredential?: string;
        }
    ): Promise<void> {
        const hasAccess = await this.checkAccess(userAddress, criteria);
        if (!hasAccess) {
            throw new Error("Access Denied: User does not meet requirements.");
        }
    }
}
