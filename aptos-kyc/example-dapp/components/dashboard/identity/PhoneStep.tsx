import { useState } from 'react';

export default function PhoneStep({ client, sessionId, onNext }: any) {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await client.verifyPhone(sessionId, phone);
            onNext();
        } catch (error) {
            console.error(error);
            alert("Failed to verify phone");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto text-center">
            <div className="text-6xl mb-6">📱</div>
            <h3 className="text-2xl font-bold mb-2">Verify Phone</h3>
            <p className="text-gray-400 mb-8">Enter your phone number for 2FA.</p>

            <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-purple-500"
            />

            <button
                onClick={handleSubmit}
                disabled={loading || !phone}
                className="w-full glass-button bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 py-3 rounded-xl font-bold transition disabled:opacity-50"
            >
                {loading ? 'Verifying...' : 'Verify Phone Number'}
            </button>
        </div>
    );
}
