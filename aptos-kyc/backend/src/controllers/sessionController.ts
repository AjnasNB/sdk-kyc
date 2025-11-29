import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Session, SessionStatus } from '../db/models/Session';

const startSessionSchema = Joi.object({
    walletAddress: Joi.string().required().regex(/^0x[a-fA-F0-9]{64}$/)
        .messages({
            'string.pattern.base': 'Invalid Aptos wallet address format'
        })
});

export async function startSession(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
        // Validate request body
        const { error, value } = startSessionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }

        const { walletAddress } = value;

        // Create new session
        const session = await Session.create({
            walletAddress,
            status: SessionStatus.PENDING
        });

        console.log(`[SESSION] Created session ${session._id} for wallet ${walletAddress}`);

        res.status(201).json({
            success: true,
            data: {
                sessionId: session._id.toString(),
                walletAddress: session.walletAddress,
                status: session.status,
                createdAt: session.createdAt
            }
        });
    } catch (err) {
        next(err);
    }
}

export async function getSession(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
        const { sessionId } = req.params;

        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        res.json({
            success: true,
            data: {
                sessionId: session._id.toString(),
                walletAddress: session.walletAddress,
                email: session.email,
                phone: session.phone,
                emailVerified: session.emailVerified,
                phoneVerified: session.phoneVerified,
                idVerified: session.idVerified,
                status: session.status,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt
            }
        });
    } catch (err) {
        next(err);
    }
}
