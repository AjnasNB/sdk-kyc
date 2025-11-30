import { useState, useEffect } from 'react';
import CredentialsIssuer from './CredentialsIssuer';

interface AdminViewProps {
    client: any;
    walletAddress: string;
}

export default function AdminView({ client, walletAddress }: AdminViewProps) {
    const [activeTab, setActiveTab] = useState('users');
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        // Mock loading stats
        setTimeout(() => {
            setStats({
                totalUsers: 1245,
                verifiedUsers: 892,
                pendingReviews: 15,
                systemHealth: '99.9%',
                apiCalls: 45230
            });
        }, 1000);
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Admin Console</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg text-sm transition ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('system')}
                        className={`px-4 py-2 rounded-lg text-sm transition ${activeTab === 'system' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        System Status
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-xl">
                    <div className="text-gray-400 text-xs uppercase">Total Users</div>
                    <div className="text-2xl font-bold">{stats?.totalUsers || '...'}</div>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <div className="text-gray-400 text-xs uppercase">Verified</div>
                    <div className="text-2xl font-bold text-green-400">{stats?.verifiedUsers || '...'}</div>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <div className="text-gray-400 text-xs uppercase">Pending</div>
                    <div className="text-2xl font-bold text-yellow-400">{stats?.pendingReviews || '...'}</div>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <div className="text-gray-400 text-xs uppercase">API Calls (24h)</div>
                    <div className="text-2xl font-bold text-blue-400">{stats?.apiCalls?.toLocaleString() || '...'}</div>
                </div>
            </div>

            {activeTab === 'users' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Credential Issuer */}
                    <CredentialsIssuer client={client} walletAddress={walletAddress} />

                    {/* Recent Users List */}
                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-lg font-bold mb-4">Recent Registrations</h3>
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
                                        <div>
                                            <div className="text-sm font-mono">0x{Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('').slice(0, 8)}...</div>
                                            <div className="text-xs text-gray-400">2 mins ago</div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Verified</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'system' && (
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-lg font-bold mb-4">System Health</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>API Server</span>
                                <span className="flex items-center gap-2 text-green-400 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Operational
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Blockchain Indexer</span>
                                <span className="flex items-center gap-2 text-green-400 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Synced (Block #129384)
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>DeepFace Service</span>
                                <span className="flex items-center gap-2 text-green-400 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Ready (Model: VGG-Face)
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Database</span>
                                <span className="flex items-center gap-2 text-green-400 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Connected
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-lg font-bold mb-4">Error Logs</h3>
                        <div className="font-mono text-xs text-gray-400 bg-black/30 p-4 rounded-lg h-48 overflow-y-auto">
                            <div className="text-red-400">[ERROR] 2023-11-29 10:23:12 - Failed to verify signature for 0x123...</div>
                            <div className="text-yellow-400">[WARN] 2023-11-29 10:21:05 - High latency detected on node-1</div>
                            <div className="text-gray-500">[INFO] 2023-11-29 10:20:00 - System backup completed</div>
                            <div>[INFO] 2023-11-29 10:15:00 - New user registered: 0xabc...</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
