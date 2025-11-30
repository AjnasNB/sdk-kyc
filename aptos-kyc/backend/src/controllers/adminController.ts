import { Request, Response } from 'express';
import { Session } from '../db/models/Session';
import { Identity } from '../db/models/Identity';
import Credential from '../db/models/Credential';
import EventLog from '../db/models/EventLog';
import RiskProfile from '../db/models/RiskProfile';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await Identity.countDocuments();
        const pendingKyc = await Session.countDocuments({ status: { $ne: 'COMPLETED' } });
        const totalCredentials = await Credential.countDocuments();
        const highRiskWallets = await RiskProfile.countDocuments({ riskScore: { $gt: 50 } });

        const recentEvents = await EventLog.find().sort({ timestamp: -1 }).limit(10);

        // Mock daily stats for chart
        const chartData = [
            { name: 'Mon', users: 4 },
            { name: 'Tue', users: 3 },
            { name: 'Wed', users: 2 },
            { name: 'Thu', users: 7 },
            { name: 'Fri', users: 5 },
            { name: 'Sat', users: 10 },
            { name: 'Sun', users: totalUsers },
        ];

        res.json({
            stats: {
                totalUsers,
                pendingKyc,
                totalCredentials,
                highRiskWallets
            },
            recentEvents,
            chartData
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
