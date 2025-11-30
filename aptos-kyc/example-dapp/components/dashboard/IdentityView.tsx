import IdentityWizard from './identity/IdentityWizard';

interface IdentityViewProps {
    walletAddress: string;
    client: any; // Added client prop
    onComplete: () => void;
}

export default function IdentityView({ walletAddress, client, onComplete }: IdentityViewProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Identity Verification</h2>
                <p className="text-gray-400">
                    Complete the KYC process to unlock full access to the platform.
                    We use privacy-preserving local face verification.
                </p>
            </div>

            <IdentityWizard
                walletAddress={walletAddress}
                client={client}
                onComplete={onComplete}
            />
        </div>
    );
}
