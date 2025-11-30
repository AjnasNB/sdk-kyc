import { useState } from 'react';

export default function DocumentationView() {
    const [activeTab, setActiveTab] = useState('quickstart');

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Developer Documentation</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('quickstart')}
                        className={`px-4 py-2 rounded-lg text-sm transition ${activeTab === 'quickstart' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        Quickstart
                    </button>
                    <button
                        onClick={() => setActiveTab('reference')}
                        className={`px-4 py-2 rounded-lg text-sm transition ${activeTab === 'reference' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        SDK Reference
                    </button>
                    <button
                        onClick={() => setActiveTab('playground')}
                        className={`px-4 py-2 rounded-lg text-sm transition ${activeTab === 'playground' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        Playground
                    </button>
                </div>
            </div>

            {activeTab === 'quickstart' && (
                <div className="glass-panel p-8 rounded-xl space-y-6">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Getting Started</h3>
                        <p className="text-gray-400 mb-4">
                            Integrate the Aptos KYC SDK into your dApp in minutes.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                            <div className="text-xs text-gray-500 mb-2">1. Install the SDK</div>
                            <code className="text-green-400 font-mono">npm install @cognifyr/aptos-kyc-sdk</code>
                        </div>

                        <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                            <div className="text-xs text-gray-500 mb-2">2. Initialize Client</div>
                            <pre className="text-blue-300 font-mono text-sm overflow-x-auto">
                                {`import { KycClient } from '@cognifyr/aptos-kyc-sdk';

const client = new KycClient({
    dappId: "your-dapp-id",
    callbackUrl: "https://your-dapp.com/api/callback",
    aptosNodeUrl: "https://fullnode.mainnet.aptoslabs.com/v1"
});`}
                            </pre>
                        </div>

                        <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                            <div className="text-xs text-gray-500 mb-2">3. Start Verification</div>
                            <pre className="text-blue-300 font-mono text-sm overflow-x-auto">
                                {`const session = await client.identity.startSession(userWalletAddress);
// Redirect user to verification flow...`}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'reference' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-lg font-bold mb-4 text-purple-400">Identity Module</h3>
                        <ul className="space-y-3 text-sm font-mono text-gray-300">
                            <li className="hover:text-white cursor-pointer">startSession(address)</li>
                            <li className="hover:text-white cursor-pointer">verifyEmail(email, code)</li>
                            <li className="hover:text-white cursor-pointer">verifyPhone(phone, code)</li>
                            <li className="hover:text-white cursor-pointer">uploadDocument(file)</li>
                            <li className="hover:text-white cursor-pointer">verifyFace(selfie)</li>
                        </ul>
                    </div>
                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-lg font-bold mb-4 text-blue-400">Credentials Module</h3>
                        <ul className="space-y-3 text-sm font-mono text-gray-300">
                            <li className="hover:text-white cursor-pointer">issueCredential(address, type)</li>
                            <li className="hover:text-white cursor-pointer">getCredentials(address)</li>
                            <li className="hover:text-white cursor-pointer">verifyProof(proof)</li>
                            <li className="hover:text-white cursor-pointer">revokeCredential(id)</li>
                        </ul>
                    </div>
                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-lg font-bold mb-4 text-yellow-400">Reputation Module</h3>
                        <ul className="space-y-3 text-sm font-mono text-gray-300">
                            <li className="hover:text-white cursor-pointer">getScore(address)</li>
                            <li className="hover:text-white cursor-pointer">getBadges(address)</li>
                            <li className="hover:text-white cursor-pointer">updateScore(address, delta)</li>
                        </ul>
                    </div>
                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-lg font-bold mb-4 text-red-400">FraudGuard Module</h3>
                        <ul className="space-y-3 text-sm font-mono text-gray-300">
                            <li className="hover:text-white cursor-pointer">checkRisk(address)</li>
                            <li className="hover:text-white cursor-pointer">reportSuspicious(address)</li>
                            <li className="hover:text-white cursor-pointer">analyzeTransaction(txHash)</li>
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'playground' && (
                <div className="glass-panel p-8 rounded-xl text-center">
                    <div className="text-6xl mb-6">🎮</div>
                    <h3 className="text-2xl font-bold mb-2">Interactive Playground</h3>
                    <p className="text-gray-400 mb-8">
                        Test SDK methods directly in your browser without writing code.
                    </p>
                    <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-purple-500/20">
                        Launch Playground
                    </button>
                    <p className="text-xs text-gray-500 mt-4">Coming soon in v1.1</p>
                </div>
            )}
        </div>
    );
}
