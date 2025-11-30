import { useEffect, useState } from 'react';

interface ReputationViewProps {
    walletAddress: string;
    client: any;
}

export default function ReputationView({ walletAddress, client }: ReputationViewProps) {
    const [reputation, setReputation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReputation();
    }, [walletAddress]);

    const loadReputation = async () => {
        try {
            const data = await client.reputation.getScore(walletAddress);
            // Mock timeline data if not present
            if (!data.timeline) {
                data.timeline = [
                    { date: '2023-11-01', event: 'Identity Verified', score: '+50' },
                    { date: '2023-11-05', event: 'First Credential Issued', score: '+20' },
                    { date: '2023-11-10', event: 'Community Vote', score: '+5' },
                ];
            }
            // Mock breakdown data
            data.breakdown = {
                identity: 50,
                credentials: 30,
                activity: 15,
                risk: -5
            };
            setReputation(data);
        } catch (error) {
            console.error("Failed to load reputation", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-10 text-gray-400">Loading reputation...</div>;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Reputation Profile</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score Card & Breakdown */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Score */}
                    <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left mb-6 md:mb-0">
                            <h3 className="text-2xl font-bold text-blue-300">Trust Score</h3>
                            <p className="text-gray-400 mt-2 max-w-xs">
                                Your on-chain reputation based on transaction history, KYC status, and community interactions.
                            </p>
                        </div>

                        <div className="relative z-10">
                            <div className="w-48 h-48 rounded-full border-8 border-blue-500/30 flex items-center justify-center relative">
                                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                    <circle
                                        cx="90"
                                        cy="90"
                                        r="86"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-blue-500"
                                        strokeDasharray={540}
                                        strokeDashoffset={540 - (540 * (reputation?.score || 0)) / 100}
                                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                                    />
                                </svg>
                                <div className="text-center">
                                    <span className="text-5xl font-bold text-white block">{reputation?.score || 0}</span>
                                    <span className="text-sm text-gray-400">/ 100</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Chart */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-lg font-bold mb-4">Score Breakdown</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-gray-400">Identity</span>
                                <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: `${reputation?.breakdown?.identity}%` }}></div>
                                </div>
                                <span className="w-12 text-sm font-mono text-right">+{reputation?.breakdown?.identity}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-gray-400">Credentials</span>
                                <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500" style={{ width: `${reputation?.breakdown?.credentials}%` }}></div>
                                </div>
                                <span className="w-12 text-sm font-mono text-right">+{reputation?.breakdown?.credentials}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-gray-400">Activity</span>
                                <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${reputation?.breakdown?.activity}%` }}></div>
                                </div>
                                <span className="w-12 text-sm font-mono text-right">+{reputation?.breakdown?.activity}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-gray-400">Risk Penalty</span>
                                <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500" style={{ width: `${Math.abs(reputation?.breakdown?.risk)}%` }}></div>
                                </div>
                                <span className="w-12 text-sm font-mono text-right text-red-400">{reputation?.breakdown?.risk}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Badges & Timeline */}
                <div className="space-y-8">
                    {/* Badges */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>🏆</span> Earned Badges
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {reputation?.badges?.length > 0 ? (
                                reputation.badges.map((badge: string, i: number) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-xl flex flex-col items-center text-center hover:bg-white/10 transition-colors border border-white/5 hover:border-yellow-500/30 group">
                                        <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏅</span>
                                        <span className="font-medium text-xs">{badge}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-8 text-gray-500">
                                    <span className="text-4xl block mb-2">🔒</span>
                                    No badges earned yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-4">History</h3>
                        <div className="space-y-6 relative pl-4 border-l border-white/10">
                            {reputation?.timeline?.map((item: any, i: number) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-gray-900"></div>
                                    <div className="text-sm font-bold text-gray-200">{item.event}</div>
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>{item.date}</span>
                                        <span className="text-green-400 font-mono">{item.score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
