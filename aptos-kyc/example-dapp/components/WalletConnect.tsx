import { useState } from 'react';

interface WalletConnectProps {
    walletAddress: string | null;
    onConnect: (address: string) => void;
    onDisconnect: () => void;
}

export default function WalletConnect({ walletAddress, onConnect, onDisconnect }: WalletConnectProps) {
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            <div className="bg-white rounded-lg shadow-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Connected Wallet</p>
                        <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">
                            {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                        </p>
                    </div>
                    <button
                        onClick={handleDisconnect}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                        Disconnect
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
                Connect your Petra wallet to start the KYC process
            </p>

            <button
                onClick={connectWallet}
                disabled={connecting}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {connecting ? 'Connecting...' : 'Connect Petra Wallet'}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            <div className="mt-6 text-sm text-gray-500">
                Don't have Petra wallet?{' '}
                <a
                    href="https://petra.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700"
                >
                    Install here
                </a>
            </div>
        </div>
    );
}
