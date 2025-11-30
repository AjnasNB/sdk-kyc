import { AptosClient, Types } from "aptos";

export interface Credential {
    id: string;
    type_name: string;
    issuer: string;
    holder: string;
    issuance_date: string;
    expiration_date: string;
    data_hash: string;
    revoked: boolean;
}

export class Credentials {
    private client: AptosClient;
    private moduleAddress: string;

    constructor(client: AptosClient, moduleAddress: string) {
        this.client = client;
        this.moduleAddress = moduleAddress;
    }

    /**
     * Get all credentials for a holder.
     * @param holderAddress The address of the credential holder.
     * @returns List of credentials.
     */
    async getCredentials(holderAddress: string): Promise<Credential[]> {
        const payload: Types.ViewRequest = {
            function: `${this.moduleAddress}::CredentialRegistry::get_credentials`,
            type_arguments: [],
            arguments: [this.moduleAddress, holderAddress]
        };

        try {
            const result = await this.client.view(payload);
            return (result[0] as any[]).map(this.parseCredential);
        } catch (error) {
            console.error("Failed to fetch credentials:", error);
            return [];
        }
    }

    /**
     * Check if a user has a specific credential type.
     * @param holderAddress The address of the holder.
     * @param typeName The type of credential (e.g., "VerifiedHuman").
     * @returns True if the user has the credential.
     */
    async hasCredential(holderAddress: string, typeName: string): Promise<boolean> {
        const payload: Types.ViewRequest = {
            function: `${this.moduleAddress}::CredentialRegistry::has_credential`,
            type_arguments: [],
            arguments: [this.moduleAddress, holderAddress, typeName]
        };

        try {
            const result = await this.client.view(payload);
            return result[0] as boolean;
        } catch (error) {
            console.error("Credential check failed:", error);
            return false;
        }
    }

    /**
     * Issue a new credential (Issuer only).
     */
    async issueCredential(
        sender: any,
        holder: string,
        id: string,
        typeName: string,
        expirationDate: number,
        dataHash: Uint8Array
    ): Promise<string> {
        const payload: Types.TransactionPayload = {
            type: "entry_function_payload",
            function: `${this.moduleAddress}::CredentialRegistry::issue_credential`,
            type_arguments: [],
            arguments: [
                this.moduleAddress, // registry_addr
                holder,
                id,
                typeName,
                expirationDate,
                Array.from(dataHash)
            ]
        };

        const txnRequest = await this.client.generateTransaction(sender.address(), payload);
        const signedTxn = await this.client.signTransaction(sender, txnRequest);
        const transactionRes = await this.client.submitTransaction(signedTxn);
        await this.client.waitForTransaction(transactionRes.hash);
        return transactionRes.hash;
    }

    private parseCredential(raw: any): Credential {
        return {
            id: raw.id,
            type_name: raw.type_name,
            issuer: raw.issuer,
            holder: raw.holder,
            issuance_date: raw.issuance_date,
            expiration_date: raw.expiration_date,
            data_hash: raw.data_hash,
            revoked: raw.revoked
        };
    }
}
