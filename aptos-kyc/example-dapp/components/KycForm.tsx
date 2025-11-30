import { useState, useRef, useEffect } from 'react';
import { createKycClient } from '@cognifyr/aptos-kyc-sdk';
import Webcam from 'react-webcam';
import StatusCard from './StatusCard';

interface KycFormProps {
    walletAddress: string;
    onComplete: () => void;
}

export default function KycForm({ walletAddress, onComplete }: KycFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [kycStatus, setKycStatus] = useState<any>(null);

    // Form data
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [idFile, setIdFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const selfieInputRef = useRef<HTMLInputElement>(null);

    const kycClient = createKycClient({
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
        aptosNodeUrl: process.env.NEXT_PUBLIC_APTOS_NODE_URL,
        moduleAddress: process.env.NEXT_PUBLIC_MODULE_ADDRESS || "0x938bd5a2fabaac81a6bbbbcb5b0611691d2b217c5c446f5ed45d4111f07c06e"
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

    const verifyIdentity = async () => {
        if (!sessionId || !idFile || !selfieFile) return;

        setLoading(true);
        setError(null);
        try {
            // @ts-ignore - verifyFace is new
            await kycClient.verifyFace(sessionId, idFile, selfieFile);
            setCurrentStep(5);
        } catch (err: any) {
            setError(err.message || 'Identity verification failed');
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
            setKycStatus({ verified: true, level: 3 }); // Mock update for UI
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
                    <span>Identity</span>
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

            {/* Step 4: Identity Verification (ID + Selfie) */}
            {currentStep === 4 && (
                <div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            1. Upload ID Document
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                            className="w-full mb-2"
                        />
                        {idFile && (
                            <p className="text-sm text-green-600 mb-2">✓ {idFile.name}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            2. Take Selfie
                        </label>
                        {!selfieFile ? (
                            <div className="space-y-4">
                                <WebcamCapture onCapture={(file) => setSelfieFile(file)} />
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <span className="text-green-700 font-medium">✓ Selfie Captured</span>
                                <button
                                    onClick={() => setSelfieFile(null)}
                                    className="text-sm text-red-600 hover:text-red-700 underline"
                                >
                                    Retake
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={verifyIdentity}
                        disabled={loading || !idFile || !selfieFile}
                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Verifying Identity...' : 'Verify Identity'}
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
                        Your identity has been successfully verified and recorded on-chain.
                    </p>
                </div>
            )}

            {/* Status Card */}
            {kycStatus && (
                <div className="mt-8">
                    <StatusCard walletAddress={walletAddress} refresh={false} />
                </div>
            )}

            {/* Super-SDK Dashboard */}
            {kycStatus?.verified && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Identity Dashboard</h3>
                    <Dashboard walletAddress={walletAddress} client={kycClient} />
                </div>
            )}
        </div>
    );
}

function Dashboard({ walletAddress, client }: { walletAddress: string, client: any }) {
    const [reputation, setReputation] = useState<any>(null);
    const [credentials, setCredentials] = useState<any[]>([]);
    const [risk, setRisk] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [walletAddress]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch all data in parallel
            const [repData, credsData, riskData] = await Promise.all([
                client.reputation.getScore(walletAddress),
                client.did.getCredentials(walletAddress),
                client.fraud.checkRisk(walletAddress)
            ]);

            setReputation(repData);
            setCredentials(credsData);
            setRisk(riskData);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !reputation) return <div className="text-gray-500">Loading identity profile...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Reputation Card */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-blue-400">🛡️ Reputation</h3>
                    <button onClick={loadData} className="text-xs text-gray-400 hover:text-white">↻</button>
                </div>
                <div className="text-4xl font-bold text-white mb-2">{reputation?.score || 0}</div>
                <div className="text-sm text-gray-400">Trust Score</div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {reputation?.badges?.map((badge: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded">{badge}</span>
                    ))}
                    {(!reputation?.badges || reputation.badges.length === 0) && (
                        <span className="text-xs text-gray-500">No badges yet</span>
                    )}
                </div>
            </div>

            {/* Credentials Card */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-purple-400">🪪 Credentials</h3>
                    <span className="text-xs text-gray-400">{credentials?.length || 0} Issued</span>
                </div>
                <ul className="space-y-2 max-h-32 overflow-y-auto">
                    {credentials?.map((cred: any, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                            <span className="text-green-400">✓</span> {cred.type}
                        </li>
                    ))}
                    {credentials?.length === 0 && (
                        <li className="text-gray-500 text-sm">No credentials found</li>
                    )}
                </ul>
            </div>

            {/* Risk Card */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-red-400">🚨 Risk Status</h3>
                    <button onClick={() => client.fraud.analyze(walletAddress).then(loadData)} className="text-xs text-red-400 hover:text-red-300 border border-red-900 px-2 rounded">Analyze</button>
                </div>
                <div className={`text-4xl font-bold mb-2 ${risk?.isBlacklisted ? 'text-red-500' : 'text-green-500'}`}>
                    {risk?.isBlacklisted ? 'HIGH' : 'LOW'}
                </div>
                <div className="text-sm text-gray-400">Risk Score: {risk?.score || 0}/100</div>
                <div className="mt-4 text-xs text-gray-500">
                    {risk?.isBlacklisted ? 'Wallet is flagged' : 'Wallet is safe'}
                </div>
            </div>
        </div>
    );
}

function WebcamCapture({ onCapture }: { onCapture: (file: File) => void }) {
    const webcamRef = useRef<any>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    const capture = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImgSrc(imageSrc);
            // Convert base64 to File
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
                    onCapture(file);
                });
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {!imgSrc ? (
                <>
                    <div className="relative rounded-lg overflow-hidden shadow-lg bg-black">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "user" }}
                            className="w-full max-w-sm"
                        />
                    </div>
                    <button
                        onClick={capture}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                    >
                        📸 Capture Photo
                    </button>
                </>
            ) : (
                <div className="relative rounded-lg overflow-hidden shadow-lg">
                    <img src={imgSrc} alt="Selfie" className="w-full max-w-sm" />
                    <button
                        onClick={() => setImgSrc(null)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
