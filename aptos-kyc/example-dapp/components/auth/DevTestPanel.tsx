import { useState } from 'react';

interface DevTestPanelProps {
    client: any;
    sessionId: string | null;
    onSessionReset: () => void;
}

export default function DevTestPanel({ client, sessionId, onSessionReset }: DevTestPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [zkMode, setZkMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    const handleResetSession = async () => {
        if (!confirm("Are you sure? This will clear the current session.")) return;
        setLoading(true);
        try {
            // In a real app, we might call a backend endpoint to invalidate the session
            onSessionReset();
            addLog("Session reset locally.");
        } catch (error) {
            addLog(`Error resetting session: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const generateFakeKyc = async () => {
        setLoading(true);
        try {
            addLog("Generating fake KYC response...");
            await new Promise(r => setTimeout(r, 1500)); // Simulate delay
            addLog("Fake KYC response received: APPROVED (Score: 98)");
            // Here we would ideally update some state or call a dev-only endpoint
        } finally {
            setLoading(false);
        }
    };

    const triggerFlag = (level: string) => {
        addLog(`Triggered KYC Flag Level: ${level}`);
        // Simulate flagging logic
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 bg-gray-800 text-gray-400 p-2 rounded-full hover:text-white hover:bg-gray-700 transition-all border border-gray-600 shadow-lg z-50"
                title="Open Developer Panel"
            >
                🛠️
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[600px]">
            {/* Header */}
            <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-gray-200 flex items-center gap-2">
                    🛠️ Dev Panel
                    <span className="text-xs bg-purple-900 text-purple-300 px-1.5 py-0.5 rounded">BETA</span>
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto space-y-6">
                {/* Session Controls */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Session Management</h4>
                    <div className="space-y-2">
                        <div className="text-xs text-gray-400 break-all bg-black/30 p-2 rounded">
                            ID: {sessionId || "No Active Session"}
                        </div>
                        <button
                            onClick={handleResetSession}
                            disabled={loading}
                            className="w-full py-1.5 bg-red-900/30 text-red-400 border border-red-900/50 rounded text-xs hover:bg-red-900/50 transition"
                        >
                            Reset Session
                        </button>
                    </div>
                </div>

                {/* ZK Toggle */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Privacy Settings</h4>
                    <div className="flex items-center justify-between bg-black/30 p-2 rounded">
                        <span className="text-sm text-gray-300">ZK Proof Mode</span>
                        <button
                            onClick={() => {
                                setZkMode(!zkMode);
                                addLog(`ZK Mode ${!zkMode ? 'ENABLED' : 'DISABLED'}`);
                            }}
                            className={`w-10 h-5 rounded-full relative transition-colors ${zkMode ? 'bg-green-600' : 'bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${zkMode ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>

                {/* KYC Simulation */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">KYC Simulation</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={generateFakeKyc}
                            disabled={loading}
                            className="py-1.5 bg-blue-900/30 text-blue-400 border border-blue-900/50 rounded text-xs hover:bg-blue-900/50 transition"
                        >
                            Gen. Fake Response
                        </button>
                        <button
                            onClick={() => triggerFlag('HIGH')}
                            className="py-1.5 bg-yellow-900/30 text-yellow-400 border border-yellow-900/50 rounded text-xs hover:bg-yellow-900/50 transition"
                        >
                            Trigger Flag
                        </button>
                    </div>
                </div>

                {/* Logs */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Dev Logs</h4>
                    <div className="h-24 bg-black/50 rounded p-2 overflow-y-auto font-mono text-[10px] text-gray-400 space-y-1">
                        {logs.length === 0 && <span className="opacity-50">No logs yet...</span>}
                        {logs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
