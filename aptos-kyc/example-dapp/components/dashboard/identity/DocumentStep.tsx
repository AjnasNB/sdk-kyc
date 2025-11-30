import { useState, useRef } from 'react';
import Webcam from 'react-webcam';

// We need to define WebcamCapture here or import it if it's exported
const WebcamCapture = ({ onCapture }: { onCapture: (file: File) => void }) => {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    const capture = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImgSrc(imageSrc);
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
                    onCapture(file);
                });
        }
    };

    return (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-white/10">
            {imgSrc ? (
                <img src={imgSrc} alt="captured" className="w-full h-full object-cover" />
            ) : (
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                />
            )}
            <div className="absolute bottom-4 left-0 w-full flex justify-center gap-4">
                {!imgSrc ? (
                    <button onClick={capture} className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition">
                        Capture Photo
                    </button>
                ) : (
                    <button onClick={() => { setImgSrc(null); }} className="bg-white/20 backdrop-blur text-white px-6 py-2 rounded-full font-bold hover:bg-white/30 transition">
                        Retake
                    </button>
                )}
            </div>
        </div>
    );
};

export default function DocumentStep({ client, sessionId, onNext }: any) {
    const [idFile, setIdFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!idFile || !selfieFile) return;
        setLoading(true);
        try {
            // Call verifyFace which now returns debug info
            const result = await client.verifyFace(sessionId, idFile, selfieFile);
            onNext(result);
        } catch (error) {
            console.error(error);
            alert("Identity verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Document Verification</h3>
                <p className="text-gray-400">Upload your ID and take a live selfie.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ID Upload */}
                <div className="glass-panel p-6 rounded-xl">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <span>📄</span> 1. Upload ID
                    </h4>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 transition cursor-pointer relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {idFile ? (
                            <div className="text-green-400">
                                <div className="text-4xl mb-2">✓</div>
                                <div className="text-sm truncate">{idFile.name}</div>
                            </div>
                        ) : (
                            <div className="text-gray-500">
                                <div className="text-4xl mb-2">⬆️</div>
                                <div className="text-sm">Click to upload ID Front</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Selfie Cam */}
                <div className="glass-panel p-6 rounded-xl">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <span>📸</span> 2. Live Selfie
                    </h4>
                    <WebcamCapture onCapture={setSelfieFile} />
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={loading || !idFile || !selfieFile}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            AI Verifying...
                        </>
                    ) : (
                        'Verify Identity'
                    )}
                </button>
            </div>
        </div>
    );
}
