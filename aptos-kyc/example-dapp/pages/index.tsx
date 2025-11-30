import { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import Overview from '@/components/dashboard/Overview';
import IdentityView from '@/components/dashboard/IdentityView';
import CredentialsView from '@/components/dashboard/CredentialsView';
import RiskView from '@/components/dashboard/RiskView';
import ReputationView from '@/components/dashboard/ReputationView';
import AdminView from '@/components/dashboard/AdminView';
import DocumentationView from '@/components/dashboard/DocumentationView';
import { KycClient } from '@cognifyr/aptos-kyc-sdk';

export default function Home() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState('overview');
    const [client, setClient] = useState<any>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Initialize SDK Client
    useEffect(() => {
        const initClient = async () => {
            const sdk = new KycClient({
                apiBaseUrl: "http://localhost:3000",
                aptosNodeUrl: "https://fullnode.devnet.aptoslabs.com/v1"
            });
            setClient(sdk);
        };
        initClient();
    }, []);

    // Mock wallet connection for demo
    useEffect(() => {
        const storedWallet = localStorage.getItem('walletAddress');
        if (storedWallet) setWalletAddress(storedWallet);
    }, []);

    const renderView = () => {
        if (!client) return <div className="p-8 text-center text-gray-400">Initializing SDK...</div>;

        switch (currentView) {
            case 'overview':
                return <Overview
                    walletAddress={walletAddress!}
                    client={client}
                    onNavigate={setCurrentView}
                />;
            case 'identity':
                return <IdentityView
                    walletAddress={walletAddress!}
                    client={client}
                    onComplete={() => setCurrentView('credentials')}
                />;
            case 'credentials':
                return <CredentialsView walletAddress={walletAddress!} client={client} />;
            case 'risk':
                return <RiskView walletAddress={walletAddress!} client={client} />;
            case 'reputation':
                return <ReputationView walletAddress={walletAddress!} client={client} />;
            case 'admin':
                return <AdminView walletAddress={walletAddress!} client={client} />;
            case 'docs':
                return <DocumentationView />;
            default:
                return <Overview
                    walletAddress={walletAddress!}
                    client={client}
                    onNavigate={setCurrentView}
                />;
        }
    };

    return (
        <>
            <Head>
                <title>Chanisure KYC Dashboard</title>
                <meta name="description" content="Chanisure Identity Verification Dashboard" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/logo.png" />
            </Head>

            <DashboardLayout
                currentView={currentView}
                onViewChange={setCurrentView}
                walletAddress={walletAddress}
                client={client}
                sessionId={sessionId}
            >
                {renderView()}
            </DashboardLayout>
        </>
    );
}
