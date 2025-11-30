import { useState } from 'react';
import WalletConnect from '@/components/WalletConnect';
import KycForm from '@/components/KycForm';

export default function Home() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Chainsure KYC Verification
                    </h1>
                    <p className="text-gray-600">
                        Secure, decentralized identity verification on Aptos
                    </p>
                </div>

                {!walletAddress ? (
                    <WalletConnect
                        walletAddress={walletAddress}
                        onConnect={setWalletAddress}
                        onDisconnect={() => setWalletAddress(null)}
                    />
                ) : (
                    <div className="space-y-6">
                        <WalletConnect
                            walletAddress={walletAddress}
                            onConnect={setWalletAddress}
                            onDisconnect={() => setWalletAddress(null)}
                        />
                        <KycForm
                            walletAddress={walletAddress}
                            onComplete={() => console.log('KYC Completed')}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
