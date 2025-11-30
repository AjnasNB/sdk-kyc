import { useState } from 'react';
import EmailStep from './EmailStep';
import PhoneStep from './PhoneStep';
import DocumentStep from './DocumentStep';
import FaceDebugStep from './FaceDebugStep';

interface IdentityWizardProps {
    walletAddress: string;
    client: any;
    onComplete: () => void;
}

export default function IdentityWizard({ walletAddress, client, onComplete }: IdentityWizardProps) {
    const [step, setStep] = useState(1);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [debugData, setDebugData] = useState<any>(null);

    const nextStep = () => setStep(s => s + 1);

    const handleSessionCreated = (sid: string) => {
        setSessionId(sid);
        nextStep();
    };

    const handleFaceMatchComplete = (data: any) => {
        setDebugData(data);
        nextStep();
    };

    return (
        <div className="glass-panel rounded-2xl overflow-hidden min-h-[600px] flex flex-col">
            {/* Wizard Header */}
            <div className="p-6 border-b border-white/10 bg-black/20">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Identity Verification</h2>
                    <span className="text-sm text-gray-400">Step {step} of 4</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${(step / 4) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Steps */}
            <div className="flex-1 p-8">
                {step === 1 && (
                    <EmailStep
                        client={client}
                        walletAddress={walletAddress}
                        onNext={handleSessionCreated}
                    />
                )}
                {step === 2 && sessionId && (
                    <PhoneStep
                        client={client}
                        sessionId={sessionId}
                        onNext={nextStep}
                    />
                )}
                {step === 3 && sessionId && (
                    <DocumentStep
                        client={client}
                        sessionId={sessionId}
                        onNext={handleFaceMatchComplete}
                    />
                )}
                {step === 4 && sessionId && (
                    <FaceDebugStep
                        client={client}
                        sessionId={sessionId}
                        debugData={debugData}
                        onComplete={onComplete}
                    />
                )}
            </div>
        </div>
    );
}
