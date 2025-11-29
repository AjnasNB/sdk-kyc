import { useState, useEffect } from 'react';
import Head from 'next/head';
import WalletConnect from '@/components/WalletConnect';
import KycForm from '@/components/KycForm';
import StatusCard from '@/components/StatusCard';

export default function Home() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [kycCompleted, setKycCompleted] = useState(false);

    return (
        <>
            <Head>
                <title>Aptos KYC Demo</title>
                <meta name="description" content="Aptos KYC/Identity SDK demonstration" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <header className="text-center mb-12">
                        <h1 className="text-5xl font-bold text-white mb-4">
                            Aptos KYC Demo
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Complete your identity verification on Aptos blockchain
                        </p>
                    </header>

                    {/* Wallet Connection */}
                    <div className="max-w-2xl mx-auto mb-8">
                        <WalletConnect
                            walletAddress={walletAddress}
                            onConnect={setWalletAddress}
                            onDisconnect={() => {
                                setWalletAddress(null);
                                setKycCompleted(false);
                            }}
                        />
                    </div>

                    {/* Main Content */}
                    {walletAddress && (
                        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                            {/* KYC Form */}
                            <div>
                                <KycForm
                                    walletAddress={walletAddress}
                                    onComplete={() => setKycCompleted(true)}
                                />
                            </div>

                            {/* Status Card */}
                            <div>
                                <StatusCard
                                    walletAddress={walletAddress}
                                    refresh={kycCompleted}
                                />
                            </div>
                        </div>
                    )}

                    {/* Info Section */}
                    {!walletAddress && (
                        <div className="max-w-4xl mx-auto mt-16">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                                    <div className="text-4xl mb-4">🔐</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Secure</h3>
                                    <p className="text-gray-300">
                                        Your data is hashed and stored securely on-chain
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                                    <div className="text-4xl mb-4">⚡</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Fast</h3>
                                    <p className="text-gray-300">
                                        Complete KYC verification in minutes
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                                    <div className="text-4xl mb-4">🌐</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Decentralized</h3>
                                    <p className="text-gray-300">
                                        Your identity, your control on Aptos blockchain
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <footer className="text-center mt-16 text-gray-400">
                        <p>
                            Powered by{' '}
                            <a
                                href="https://aptos.dev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300"
                            >
                                Aptos
                            </a>
                        </p>
                    </footer>
                </div>
            </main>
        </>
    );
}
