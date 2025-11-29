import { useState, useRef } from 'react';
import { createKycClient } from '@cognifyr/aptos-kyc-sdk';

interface KycFormProps {
    walletAddress: string;
    onComplete: () => void;
}

export default function KycForm({ walletAddress, onComplete }: KycFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form data
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [idFile, setIdFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const kycClient = createKycClient({
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
        aptosNodeUrl: process.env.NEXT_PUBLIC_APTOS_NODE_URL
    });

    const startSession = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await kycClient.startSession(walletAddress);
            setSessionId(response.sessionId);
            setCurrentStep(2);
        } catch (err: any) {
            setError(err.message || 'Failed to start session');
        } finally {
            setLoading(false);
        }
    };

    const verifyEmail = async () => {
        if (!sessionId || !email) return;

        setLoading(true);
        setError(null);
        try {
            await kycClient.verifyEmail(sessionId, email);
            setCurrentStep(3);
        } catch (err: any) {
            setError(err.message || 'Email verification failed');
        } finally {
            setLoading(false);
        }
    };

    const verifyPhone = async () => {
        if (!sessionId || !phone) return;

        setLoading(true);
        setError(null);
        try {
            await kycClient.verifyPhone(sessionId, phone);
            setCurrentStep(4);
        } catch (err: any) {
            setError(err.message || 'Phone verification failed');
        } finally {
            setLoading(false);
        }
    };

    const verifyId = async () => {
        if (!sessionId || !idFile) return;

        setLoading(true);
        setError(null);
        try {
            await kycClient.uploadId(sessionId, idFile);
            setCurrentStep(5);
        } catch (err: any) {
            setError(err.message || 'ID verification failed');
        } finally {
            setLoading(false);
        }
    };

    const completeKyc = async () => {
        if (!sessionId) return;

        setLoading(true);
        setError(null);
        try {
            const response = await kycClient.completeKyc(sessionId);
            setCurrentStep(6);
            onComplete();
        } catch (err: any) {
            setError(err.message || 'KYC completion failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Complete KYC Verification</h2>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    {[1, 2, 3, 4, 5].map((step) => (
                        <div
                            key={step}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step <= currentStep
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {step}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Start</span>
                    <span>Email</span>
                    <span>Phone</span>
                    <span>ID</span>
                    <span>Submit</span>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Step 1: Start Session */}
            {currentStep === 1 && (
                <div>
                    <p className="text-gray-600 mb-4">
                        Begin your KYC verification process
                    </p>
                    <button
                        onClick={startSession}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Starting...' : 'Start KYC Process'}
                    </button>
                </div>
            )}

            {/* Step 2: Email Verification */}
            {currentStep === 2 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                    <button
                        onClick={verifyEmail}
                        disabled={loading || !email}
                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </div>
            )}

            {/* Step 3: Phone Verification */}
            {currentStep === 3 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1234567890"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                    <button
                        onClick={verifyPhone}
                        disabled={loading || !phone}
                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify Phone'}
                    </button>
                </div>
            )}

            {/* Step 4: ID Upload */}
            {currentStep === 4 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Document
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                        className="w-full mb-4"
                    />
                    {idFile && (
                        <p className="text-sm text-gray-600 mb-4">
                            Selected: {idFile.name}
                        </p>
                    )}
                    <button
                        onClick={verifyId}
                        disabled={loading || !idFile}
                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Uploading...' : 'Upload ID Document'}
                    </button>
                </div>
            )}

            {/* Step 5: Complete KYC */}
            {currentStep === 5 && (
                <div>
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 font-medium">✓ All verifications complete!</p>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Submit your verification to the Aptos blockchain
                    </p>
                    <button
                        onClick={completeKyc}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Submitting to Blockchain...' : 'Complete KYC'}
                    </button>
                </div>
            )}

            {/* Step 6: Success */}
            {currentStep === 6 && (
                <div className="text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">
                        KYC Complete!
                    </h3>
                    <p className="text-gray-600">
                        Your identity has been verified and recorded on-chain
                    </p>
                </div>
            )}
        </div>
    );
}
