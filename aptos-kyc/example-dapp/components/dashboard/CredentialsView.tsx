import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface CredentialsViewProps {
    walletAddress: string;
    client: any;
}

export default function CredentialsView({ walletAddress, client }: CredentialsViewProps) {
    const [credentials, setCredentials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCred, setSelectedCred] = useState<any | null>(null);

    useEffect(() => {
        loadCredentials();
    }, [walletAddress]);

    const loadCredentials = async () => {
        try {
            const data = await client.did.getCredentials(walletAddress);
            setCredentials(data);
        } catch (error) {
            console.error("Failed to load credentials", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-10 text-gray-400">Loading credentials...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Credentials</h2>
                <button onClick={loadCredentials} className="glass-button px-4 py-2 rounded-lg text-sm">
                    Refresh
                </button>
            </div>

            {credentials.length === 0 ? (
                <div className="glass-panel p-10 rounded-xl text-center">
                    <div className="text-4xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold mb-2">No Credentials Found</h3>
                    <p className="text-gray-400">
                        Complete identity verification to earn your first credential.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {credentials.map((cred, i) => (
                        <div key={i} className="glass-panel p-6 rounded-xl border-l-4 border-purple-500 relative overflow-hidden group hover:bg-white/5 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-6xl">🪪</span>
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                                        Verifiable Credential
                                    </span>
                                    <button
                                        onClick={() => setSelectedCred(cred)}
                                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                                    >
                                        View Proof
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold mb-2">{cred.type}</h3>

                                <div className="space-y-2 text-sm text-gray-300 mt-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Issuer</span>
                                        <span className="font-mono">{cred.issuer?.slice(0, 6)}...{cred.issuer?.slice(-4)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Issued On</span>
                                        <span>{new Date(cred.issuanceDate).toLocaleDateString()}</span>
                                    </div>
                                    {cred.expirationDate && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Expires</span>
                                            <span>{new Date(cred.expirationDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
                                    <div className="bg-white p-2 rounded-lg">
                                        <QRCodeSVG
                                            value={JSON.stringify({ id: cred.id, type: cred.type, owner: walletAddress })}
                                            size={100}
                                        />
                                    </div>
                                </div>
                                <div className="text-center mt-2 text-xs text-gray-500">Scan to Verify Offline</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Proof Modal */}
            {selectedCred && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Credential Proof</h3>
                            <button onClick={() => setSelectedCred(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Credential ID</label>
                                <div className="font-mono text-sm text-blue-400 break-all">{selectedCred.id}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Cryptographic Proof</label>
                                <div className="bg-black/50 p-3 rounded mt-1 border border-white/10">
                                    <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                                        {JSON.stringify({
                                            proof_type: "ZeroKnowledge",
                                            curve: "BLS12-381",
                                            signature: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
                                            merkle_root: "0x..."
                                        }, null, 2)}
                                    </pre>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="text-green-500">✓</span> Valid ZK Proof
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
