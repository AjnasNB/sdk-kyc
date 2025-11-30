import { useEffect, useState } from 'react';

interface OverviewProps {
    walletAddress: string;
    client: any;
    onNavigate: (view: string) => void;
}

export default function Overview({ walletAddress, client, onNavigate }: OverviewProps) {
    const [stats, setStats] = useState<any>({
        kycLevel: 0,
        reputation: 0,
        riskScore: 0,
        credentials: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [walletAddress]);

    const loadStats = async () => {
        try {
            const [rep, risk, creds] = await Promise.all([
                client.reputation.getScore(walletAddress),
                client.fraud.checkRisk(walletAddress),
                client.did.getCredentials(walletAddress)
            ]);

            setStats({
                kycLevel: 0, // TODO: Get actual level
                reputation: rep.score,
                riskScore: risk.score,
                credentials: creds.length
            });
        } catch (error) {
            console.error("Failed to load stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-10 text-gray-400">Loading overview...</div>;

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="glass-panel p-8 rounded-2xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-white/10">
                <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
                <p className="text-gray-300">
                    Your digital identity is <span className="text-green-400 font-semibold">Active</span>.
                    Manage your credentials and reputation below.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Reputation Score"
                    value={stats.reputation}
                    icon="🛡️"
                    color="text-blue-400"
                    onClick={() => onNavigate('reputation')}
                />
                <StatCard
                    label="Risk Score"
                    value={`${stats.riskScore}/100`}
                    icon="🚨"
                    color={stats.riskScore > 50 ? "text-red-400" : "text-green-400"}
                    onClick={() => onNavigate('risk')}
                />
                <StatCard
                    label="Credentials"
                    value={stats.credentials}
                    icon="🪪"
                    color="text-purple-400"
                    onClick={() => onNavigate('credentials')}
                />
                <StatCard
                    label="KYC Status"
                    value={stats.kycLevel > 0 ? "Verified" : "Unverified"}
                    icon="🆔"
                    color={stats.kycLevel > 0 ? "text-green-400" : "text-yellow-400"}
                    onClick={() => onNavigate('identity')}
                />
            </div>

            {/* Recent Activity / Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button onClick={() => onNavigate('identity')} className="w-full p-3 glass-button rounded-lg text-left flex items-center gap-3">
                            <span className="bg-purple-500/20 p-2 rounded-lg">🆔</span>
                            <div>
                                <div className="font-semibold">Verify Identity</div>
                                <div className="text-xs text-gray-400">Complete KYC process</div>
                            </div>
                        </button>
                        <button onClick={() => onNavigate('risk')} className="w-full p-3 glass-button rounded-lg text-left flex items-center gap-3">
                            <span className="bg-red-500/20 p-2 rounded-lg">🔍</span>
                            <div>
                                <div className="font-semibold">Check Risk Status</div>
                                <div className="text-xs text-gray-400">Scan wallet for flags</div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">System Status</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Network</span>
                            <span className="text-green-400 font-mono">Aptos Testnet</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Face Verification</span>
                            <span className="text-green-400 font-mono">DeepFace (Local)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">SDK Version</span>
                            <span className="text-blue-400 font-mono">v1.0.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color, onClick }: any) {
    return (
        <button onClick={onClick} className="glass-panel p-6 rounded-xl text-left hover:bg-white/5 transition-all group">
            <div className="flex justify-between items-start mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs text-gray-500 group-hover:text-white transition-colors">View &rarr;</span>
            </div>
            <div className={`text-3xl font-bold mb-1 ${color}`}>{value}</div>
            <div className="text-sm text-gray-400">{label}</div>
        </button>
    );
}
