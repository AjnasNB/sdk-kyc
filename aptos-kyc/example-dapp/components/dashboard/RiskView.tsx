import { useEffect, useState } from 'react';

interface RiskViewProps {
    walletAddress: string;
    client: any;
}

export default function RiskView({ walletAddress, client }: RiskViewProps) {
    const [risk, setRisk] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [compareAddress, setCompareAddress] = useState('');
    const [comparisonResult, setComparisonResult] = useState<any>(null);

    useEffect(() => {
        loadRisk();
    }, [walletAddress]);

    const loadRisk = async () => {
        try {
            const data = await client.fraud.checkRisk(walletAddress);
            setRisk(data);
        } catch (error) {
            console.error("Failed to load risk data", error);
        } finally {
            setLoading(false);
        }
    };

    const analyzeWallet = async () => {
        setAnalyzing(true);
        try {
            await client.fraud.analyze(walletAddress);
            await loadRisk();
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleCompare = async () => {
        if (!compareAddress) return;
        try {
            // Mock comparison for now
            const mockResult = {
                address: compareAddress,
                score: Math.floor(Math.random() * 100),
                isBlacklisted: Math.random() > 0.8
            };
            setComparisonResult(mockResult);
        } catch (error) {
            console.error("Comparison failed", error);
        }
    };

    if (loading) return <div className="text-center p-10 text-gray-400">Loading risk analysis...</div>;

    const isHighRisk = risk?.isBlacklisted || risk?.score > 70;
    const isMediumRisk = risk?.score > 30 && risk?.score <= 70;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">FraudGuard Analysis</h2>
                <button
                    onClick={analyzeWallet}
                    disabled={analyzing}
                    className="glass-button px-6 py-2 rounded-lg text-sm bg-red-500/10 hover:bg-red-500/20 text-red-300 disabled:opacity-50"
                >
                    {analyzing ? 'Analyzing...' : 'Run New Analysis'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Status Card */}
                <div className={`glass-panel p-8 rounded-2xl border-l-4 ${isHighRisk ? 'border-red-500' : isMediumRisk ? 'border-yellow-500' : 'border-green-500'} lg:col-span-2`}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-4 rounded-full ${isHighRisk ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            <span className="text-4xl">{isHighRisk ? '🚨' : '🛡️'}</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">
                                {isHighRisk ? 'High Risk Detected' : 'Wallet is Safe'}
                            </h3>
                            <p className="text-gray-400">
                                {isHighRisk
                                    ? 'This wallet has been flagged for suspicious activity.'
                                    : 'No significant risk factors detected.'}
                            </p>
                        </div>
                    </div>

                    <div className="w-full bg-gray-700/50 rounded-full h-4 mb-2 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${isHighRisk ? 'bg-red-500' : isMediumRisk ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${risk?.score || 0}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Safe (0)</span>
                        <span>Risk Score: {risk?.score || 0}/100</span>
                        <span>Critical (100)</span>
                    </div>
                </div>

                {/* Details Card */}
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-lg font-bold mb-4">Risk Factors</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                            <span className="text-gray-300">Blacklist Status</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${risk?.isBlacklisted ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {risk?.isBlacklisted ? 'BLACKLISTED' : 'CLEAN'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                            <span className="text-gray-300">Bot Probability</span>
                            <span className="text-gray-400 text-sm">Low (12%)</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                            <span className="text-gray-300">Known Phishing</span>
                            <span className="text-green-400 text-sm">None</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Graph Visualization */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-6">Transaction Graph</h3>
                <div className="relative h-64 bg-black/30 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
                    {/* Simple SVG Graph Visualization */}
                    <svg className="w-full h-full absolute inset-0 pointer-events-none">
                        {/* Edges */}
                        <line x1="50%" y1="50%" x2="30%" y2="30%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <line x1="50%" y1="50%" x2="70%" y2="30%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <line x1="50%" y1="50%" x2="30%" y2="70%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <line x1="50%" y1="50%" x2="70%" y2="70%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <line x1="50%" y1="50%" x2="80%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    </svg>

                    {/* Nodes */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center border-4 border-gray-900 z-10 shadow-lg shadow-blue-500/50">
                        <span className="text-xs font-bold">YOU</span>
                    </div>

                    <div className="absolute top-[30%] left-[30%] w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-500"></div>
                    <div className="absolute top-[30%] left-[70%] w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-500"></div>
                    <div className="absolute top-[70%] left-[30%] w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-500"></div>
                    <div className="absolute top-[70%] left-[70%] w-8 h-8 bg-red-500/50 rounded-full border-2 border-red-500 animate-pulse"></div>
                    <div className="absolute top-[50%] left-[80%] w-6 h-6 bg-gray-700 rounded-full border-2 border-gray-500"></div>

                    <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded text-xs text-gray-400">
                        1 Suspicious Interaction Detected
                    </div>
                </div>
            </div>

            {/* Comparative Risk View */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-4">Comparative Analysis</h3>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs text-gray-400 uppercase mb-1">Compare with Wallet Address</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={compareAddress}
                                onChange={(e) => setCompareAddress(e.target.value)}
                                placeholder="0x..."
                                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                            />
                            <button
                                onClick={handleCompare}
                                className="glass-button px-4 py-2 rounded-lg text-sm"
                            >
                                Compare
                            </button>
                        </div>
                    </div>
                </div>

                {comparisonResult && (
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-center">
                            <div className="text-xs text-gray-400 mb-1">Your Risk Score</div>
                            <div className="text-2xl font-bold text-white">{risk?.score || 0}</div>
                        </div>
                        <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-center">
                            <div className="text-xs text-gray-400 mb-1">Other Wallet Score</div>
                            <div className={`text-2xl font-bold ${comparisonResult.score > 50 ? 'text-red-400' : 'text-green-400'}`}>
                                {comparisonResult.score}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
