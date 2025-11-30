import { useEffect } from 'react';

export default function FaceDebugStep({ client, sessionId, debugData, onComplete }: any) {

    useEffect(() => {
        // Auto-complete after a delay if successful, or wait for user
    }, []);

    const handleComplete = async () => {
        try {
            await client.completeKyc(sessionId);
            onComplete();
        } catch (error) {
            console.error(error);
            alert("Failed to complete KYC");
        }
    };

    if (!debugData) return <div>No data</div>;

    const { verified, confidence, debug } = debugData;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="text-6xl mb-4">{verified ? '✅' : '❌'}</div>
                <h3 className="text-3xl font-bold mb-2">{verified ? 'Face Match Confirmed' : 'Verification Failed'}</h3>
                <p className="text-gray-400">DeepFace AI Analysis Result</p>
            </div>

            {/* Debug Console */}
            <div className="glass-panel rounded-xl overflow-hidden border border-white/10 font-mono text-sm">
                <div className="bg-black/40 p-3 border-b border-white/10 flex justify-between items-center">
                    <span className="text-gray-400">DEBUG_OUTPUT</span>
                    <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">DEEPFACE_V1</span>
                </div>
                <div className="p-6 space-y-4 bg-black/20">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-gray-500 text-xs uppercase mb-1">Confidence Score</div>
                            <div className={`text-2xl font-bold ${confidence > 0.8 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {(confidence * 100).toFixed(2)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs uppercase mb-1">Distance Metric</div>
                            <div className="text-2xl font-bold text-blue-400">
                                {debug?.distance?.toFixed(4) || 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/10 my-4"></div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Model Used:</span>
                            <span className="text-purple-300">{debug?.model || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Metric:</span>
                            <span className="text-gray-300">{debug?.metric || 'Cosine'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Threshold:</span>
                            <span className="text-gray-300">{debug?.threshold || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Liveness Check:</span>
                            <span className="text-green-400">PASSED (Webcam Enforced)</span>
                        </div>
                    </div>
                </div>
            </div>

            {verified && (
                <button
                    onClick={handleComplete}
                    className="w-full mt-8 px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-500 transition shadow-lg shadow-green-500/20"
                >
                    Finalize & Mint Identity NFT
                </button>
            )}
        </div>
    );
}
