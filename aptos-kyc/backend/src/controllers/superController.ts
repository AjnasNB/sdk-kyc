import { Request, Response } from 'express';
import { aptosService } from '../services/aptosService';
import Credential from '../db/models/Credential';
import Reputation from '../db/models/Reputation';
import RiskProfile from '../db/models/RiskProfile';
import { v4 as uuidv4 } from 'uuid';

// --- DID Controller ---
export const issueCredential = async (req: Request, res: Response) => {
    try {
        const { wallet, type, data } = req.body;
        const id = uuidv4();
        const dataHash = '0x' + Buffer.from(JSON.stringify(data)).toString('hex'); // Simple hash for demo

        // On-chain
        const txHash = await aptosService.issueCredential(wallet, id, type, 0, dataHash);

        // Off-chain
        await Credential.create({
            id, type, issuer: process.env.APTOS_MODULE_ADDRESS, holder: wallet,
            issuanceDate: Date.now(), dataHash, metadata: data
        });

        res.json({ success: true, id, txHash });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getCredentials = async (req: Request, res: Response) => {
    try {
        const { wallet } = req.params;
        const credentials = await aptosService.getCredentials(wallet);
        res.json(credentials);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Reputation Controller ---
export const getReputation = async (req: Request, res: Response) => {
    try {
        const { wallet } = req.params;
        const score = await aptosService.getTrustScore(wallet);

        // Get off-chain details
        let profile = await Reputation.findOne({ wallet });
        if (!profile) {
            profile = await Reputation.create({ wallet, score });
        } else if (profile.score !== score) {
            profile.score = score;
            await profile.save();
        }

        res.json({ score, badges: profile.badges, history: profile.history });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const calculateScore = async (req: Request, res: Response) => {
    try {
        const { wallet } = req.body;
        // Mock calculation logic
        const newScore = Math.floor(Math.random() * 200) + 600; // Random score 600-800

        const txHash = await aptosService.updateTrustScore(wallet, newScore);

        await Reputation.findOneAndUpdate(
            { wallet },
            { score: newScore, $push: { history: { action: 'Recalculation', change: 0, timestamp: Date.now() } } },
            { upsert: true }
        );

        res.json({ success: true, score: newScore, txHash });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- FraudGuard Controller ---
export const checkRisk = async (req: Request, res: Response) => {
    try {
        const { wallet } = req.params;
        const risk = await aptosService.getRiskScore(wallet);
        res.json(risk);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const analyzeWallet = async (req: Request, res: Response) => {
    try {
        const { wallet } = req.body;
        // Mock analysis
        const riskScore = Math.floor(Math.random() * 20); // Low risk
        const isBlacklisted = false;

        const txHash = await aptosService.updateRiskScore(wallet, riskScore, isBlacklisted);

        await RiskProfile.findOneAndUpdate(
            { wallet },
            { riskScore, isBlacklisted, lastCheck: Date.now() },
            { upsert: true }
        );

        res.json({ success: true, riskScore, isBlacklisted, txHash });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
