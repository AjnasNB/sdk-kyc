import { useState } from 'react';

export default function EmailStep({ client, walletAddress, onNext }: any) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Start Session
            const session = await client.startSession(walletAddress);
            // 2. Verify Email (Mock for now, or real if backend supports)
            await client.verifyEmail(session.sessionId, email);
            onNext(session.sessionId);
        } catch (error) {
            console.error(error);
            alert("Failed to verify email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto text-center">
            <div className="text-6xl mb-6">📧</div>
            <h3 className="text-2xl font-bold mb-2">Verify Email</h3>
            <p className="text-gray-400 mb-8">We'll send a verification code to your email address.</p>

            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-purple-500"
            />

            <button
                onClick={handleSubmit}
                disabled={loading || !email}
                className="w-full glass-button bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 py-3 rounded-xl font-bold transition disabled:opacity-50"
            >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
        </div>
    );
}
