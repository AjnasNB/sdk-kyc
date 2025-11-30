import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/dashboard`);
            const json = await res.json();
            setData(json);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading Dashboard...</div>;
    if (!data) return <div className="p-8 text-white">Error loading data</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-8">🚀 Super-SDK Admin Control Center</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-xl border border-blue-500/30">
                    <h3 className="text-gray-400 text-sm">Total Verified Users</h3>
                    <div className="text-4xl font-bold text-blue-400">{data.stats.totalUsers}</div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-purple-500/30">
                    <h3 className="text-gray-400 text-sm">Credentials Issued</h3>
                    <div className="text-4xl font-bold text-purple-400">{data.stats.totalCredentials}</div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-yellow-500/30">
                    <h3 className="text-gray-400 text-sm">Pending KYC</h3>
                    <div className="text-4xl font-bold text-yellow-400">{data.stats.pendingKyc}</div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-red-500/30">
                    <h3 className="text-gray-400 text-sm">High Risk Wallets</h3>
                    <div className="text-4xl font-bold text-red-400">{data.stats.highRiskWallets}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Events */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        📡 Live On-Chain Events
                        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full animate-pulse">Live</span>
                    </h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {data.recentEvents.length === 0 ? (
                            <p className="text-gray-500">No events detected yet.</p>
                        ) : (
                            data.recentEvents.map((event: any, i: number) => (
                                <div key={i} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                                    <div className="flex justify-between items-start">
                                        <span className="font-mono text-sm text-blue-300">{event.type}</span>
                                        <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 font-mono break-all">
                                        Module: {event.module}
                                    </div>
                                    <pre className="mt-2 text-[10px] text-gray-500 bg-black/30 p-2 rounded overflow-x-auto">
                                        {JSON.stringify(event.data, null, 2)}
                                    </pre>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* System Health / Logs */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold mb-4">🖥️ System Health</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg border border-green-900/50">
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Backend API
                            </span>
                            <span className="text-green-400 text-sm">Operational</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg border border-green-900/50">
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Event Watcher
                            </span>
                            <span className="text-green-400 text-sm">Running</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg border border-green-900/50">
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                MongoDB
                            </span>
                            <span className="text-green-400 text-sm">Connected</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg border border-blue-900/50">
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Aptos Testnet
                            </span>
                            <span className="text-blue-400 text-sm">Connected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
