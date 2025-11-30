import { useState } from 'react';

interface CredentialsIssuerProps {
    client: any;
    walletAddress: string; // The issuer's address (admin)
}

export default function CredentialsIssuer({ client, walletAddress }: CredentialsIssuerProps) {
    const [targetAddress, setTargetAddress] = useState('');
    const [credType, setCredType] = useState('VerifiedHuman');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleIssue = async () => {
        setLoading(true);
        setResult(null);
        try {
            // Mock issuance for now, or use client.did.issueCredential if implemented
            // await client.did.issueCredential(targetAddress, credType, ...);

            await new Promise(r => setTimeout(r, 1000)); // Simulate tx
            setResult(`Successfully issued ${credType} to ${targetAddress.slice(0, 6)}...`);
        } catch (error) {
            console.error(error);
            alert("Failed to issue credential");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>✍️</span> Issue Credential
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs text-gray-400 uppercase mb-1">Target Wallet Address</label>
                    <input
                        type="text"
                        value={targetAddress}
                        onChange={(e) => setTargetAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                </div>

                <div>
                    <label className="block text-xs text-gray-400 uppercase mb-1">Credential Type</label>
                    <select
                        value={credType}
                        onChange={(e) => setCredType(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                        <option value="VerifiedHuman">Verified Human</option>
                        <option value="SybilResistant">Sybil Resistant</option>
                        <option value="AccreditedInvestor">Accredited Investor</option>
                        <option value="Developer">Developer</option>
                    </select>
                </div>

                <button
                    onClick={handleIssue}
                    disabled={loading || !targetAddress}
                    className="w-full glass-button bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 py-2 rounded-lg font-bold transition disabled:opacity-50"
                >
                    {loading ? 'Issuing...' : 'Issue Credential'}
                </button>

                {result && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                        {result}
                    </div>
                )}
            </div>
        </div>
    );
}
