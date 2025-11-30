import { useState } from 'react';

interface WalletConnectProps {
    walletAddress: string | null;
    onConnect: (address: string) => void;
    onDisconnect: () => void;
    sessionId?: string | null;
}

export default function WalletConnect({ walletAddress, onConnect, onDisconnect, sessionId }: WalletConnectProps) {
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSessionModal, setShowSessionModal] = useState(false);

    const connectWallet = async () => {
        setConnecting(true);
        setError(null);

        try {
            // Check if Petra wallet is installed
            if (!(window as any).aptos) {
                setError('Petra wallet not found. Please install Petra wallet extension.');
                setConnecting(false);
                return;
            }

            // Connect to Petra wallet
            const response = await (window as any).aptos.connect();

            if (response.address) {
                onConnect(response.address);
            } else {
                setError('Failed to get wallet address');
            }
        } catch (err: any) {
            console.error('Error connecting wallet:', err);
            setError(err.message || 'Failed to connect wallet');
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            if ((window as any).aptos) {
                await (window as any).aptos.disconnect();
            }
            onDisconnect();
        } catch (err) {
            console.error('Error disconnecting:', err);
            onDisconnect(); // Disconnect anyway
        }
    };

    if (walletAddress) {
        return (
            <>
                <div className="flex items-center gap-4">
                    {sessionId && (
                        <button
                            onClick={() => setShowSessionModal(true)}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs border border-green-500/20 hover:bg-green-500/20 transition"
                        >
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Session Active
                        </button>
                    )}

                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="font-mono text-sm text-gray-300">
                            {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                        </span>
                    </div>

                    <button
                        onClick={handleDisconnect}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition"
                        title="Disconnect"
                    >
                        ✕
                    </button>
                </div>

                {/* Session Modal */}
                {showSessionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Session Overview</h3>
                                <button onClick={() => setShowSessionModal(false)} className="text-gray-400 hover:text-white">✕</button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-semibold">Session ID</label>
                                    <div className="font-mono text-sm text-blue-400 bg-blue-900/20 p-3 rounded mt-1 break-all border border-blue-900/30">
                                        {sessionId}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-semibold">Backend Connection</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span className="text-gray-300 text-sm">Connected to API v1</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-semibold">Security</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-purple-400 text-sm">🔒 TLS Encrypted</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-800/50 text-center">
                                <button
                                    onClick={() => setShowSessionModal(false)}
                                    className="text-sm text-gray-400 hover:text-white"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <button
            onClick={connectWallet}
            disabled={connecting}
            className="glass-button px-6 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/20"
        >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
    );
}
