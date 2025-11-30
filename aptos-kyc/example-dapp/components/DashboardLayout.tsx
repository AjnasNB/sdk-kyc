import { useState, ReactNode } from 'react';
import WalletConnect from './WalletConnect';
import DevTestPanel from './auth/DevTestPanel';

interface DashboardLayoutProps {
    children: ReactNode;
    currentView: string;
    onViewChange: (view: string) => void;
    walletAddress: string | null;
    client?: any;
    sessionId?: string | null;
}

const MENU_ITEMS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'identity', label: 'Identity Verification', icon: '🆔' },
    { id: 'credentials', label: 'My Credentials', icon: '🪪' },
    { id: 'risk', label: 'Risk Analysis', icon: '🚨' },
    { id: 'reputation', label: 'Reputation Score', icon: '🛡️' },
    { id: 'admin', label: 'Admin Console', icon: '⚙️' },
    { id: 'docs', label: 'Documentation', icon: '📚' },
];

export default function DashboardLayout({ children, currentView, onViewChange, walletAddress, client, sessionId }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-[var(--bg-dark)] text-white">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 glass-panel border-r border-white/10 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="Chanisure Logo" className="w-10 h-10 object-contain" />
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                            Chanisure
                        </h1>
                        <p className="text-xs text-gray-400">KYC Solution</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {MENU_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === item.id
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20 text-white'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="text-xs text-gray-500 text-center">
                        Powered by Chanisure & Aptos
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Bar */}
                <header className="h-20 flex items-center justify-between px-8 glass-panel border-b border-white/10 z-10">
                    <h2 className="text-xl font-semibold text-gray-200">
                        {MENU_ITEMS.find(i => i.id === currentView)?.label}
                    </h2>
                    <div className="flex items-center gap-4">
                        <WalletConnect
                            walletAddress={walletAddress}
                            onConnect={() => { }}
                            onDisconnect={() => { }}
                            sessionId={sessionId}
                        />
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    {/* Background Glow Effects */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-6xl mx-auto">
                        {walletAddress ? (
                            children
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                                <div className="text-6xl mb-6">🔐</div>
                                <h3 className="text-2xl font-bold mb-2">Connect Wallet</h3>
                                <p className="text-gray-400 mb-8 max-w-md">
                                    Please connect your Aptos wallet to access your identity dashboard and manage your credentials.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Dev Test Panel */}
            {client && (
                <DevTestPanel
                    client={client}
                    sessionId={sessionId || null}
                    onSessionReset={() => console.log("Reset session")}
                />
            )}
        </div>
    );
}
