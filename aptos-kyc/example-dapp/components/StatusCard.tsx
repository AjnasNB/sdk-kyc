import { useState, useEffect } from 'react';
import { createKycClient, KycStatus } from '@cognifyr/aptos-kyc-sdk';

interface StatusCardProps {
    walletAddress: string;
    refresh: boolean;
}

export default function StatusCard({ walletAddress, refresh }: StatusCardProps) {
    const [status, setStatus] = useState<KycStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const kycClient = createKycClient({
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
        aptosNodeUrl: process.env.NEXT_PUBLIC_APTOS_NODE_URL
    });

    const fetchStatus = async () => {
        setLoading(true);
        setError(null);
        try {
            const statusData = await kycClient.getStatus(walletAddress);
            setStatus(statusData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (walletAddress) {
            fetchStatus();
        }
    }, [walletAddress, refresh]);

    const getKycLevelLabel = (level: number): string => {
        switch (level) {
            case 0:
                return 'Not Verified';
            case 1:
                return 'Level 1 - Email';
            case 2:
                return 'Level 2 - Email + Phone';
            case 3:
                return 'Level 3 - Full KYC';
            default:
                return `Level ${level}`;
        }
    };

    const getKycLevelColor = (level: number): string => {
        if (level === 0) return 'text-gray-600';
        if (level === 1) return 'text-yellow-600';
        if (level === 2) return 'text-orange-600';
        return 'text-green-600';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-xl p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
                <p className="text-center text-gray-600 mt-4">Loading status...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-xl p-8">
                <div className="text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchStatus}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">KYC Status</h2>
                <button
                    onClick={fetchStatus}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                    🔄 Refresh
                </button>
            </div>

            {status ? (
                <div className="space-y-4">
                    {/* Verification Status */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Verified</span>
                        <span className={`font-bold ${status.verified ? 'text-green-600' : 'text-red-600'}`}>
                            {status.verified ? '✅ Yes' : '❌ No'}
                        </span>
                    </div>

                    {/* KYC Level */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">KYC Level</span>
                        <span className={`font-bold ${getKycLevelColor(status.kycLevel)}`}>
                            {getKycLevelLabel(status.kycLevel)}
                        </span>
                    </div>

                    {/* Credential Hash */}
                    {status.credentialHash && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700 block mb-2">Credential Hash</span>
                            <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded break-all">
                                {status.credentialHash.substring(0, 32)}...
                            </code>
                        </div>
                    )}

                    {/* Transaction Hash */}
                    {status.lastTxHash && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700 block mb-2">Last Transaction</span>
                            <a
                                href={`https://explorer.aptoslabs.com/txn/${status.lastTxHash}?network=testnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-purple-600 hover:text-purple-700 underline break-all"
                            >
                                {status.lastTxHash.substring(0, 32)}...
                            </a>
                        </div>
                    )}

                    {/* On-chain Version */}
                    {status.version !== undefined && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700">Version</span>
                            <span className="font-mono text-gray-600">{status.version}</span>
                        </div>
                    )}

                    {/* Wallet Address */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700 block mb-2">Wallet Address</span>
                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded break-all">
                            {status.walletAddress}
                        </code>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="text-4xl mb-4">📋</div>
                    <p className="text-gray-600">No KYC data found</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Complete the KYC process to see your status
                    </p>
                </div>
            )}
        </div>
    );
}
