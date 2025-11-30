import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Session, SessionStatus } from '../db/models/Session';
import emailService from '../services/emailService';
import phoneService from '../services/phoneService';
import idService from '../services/idService';

// Email verification schema
const emailSchema = Joi.object({
    sessionId: Joi.string().required(),
    email: Joi.string().email().required(),
    code: Joi.string().length(6).optional()
});

// Phone verification schema
const phoneSchema = Joi.object({
    sessionId: Joi.string().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required()
        .messages({
            'string.pattern.base': 'Invalid phone number format'
        }),
    code: Joi.string().length(6).optional()
});

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
        const { error, value } = emailSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }

        const { sessionId, email, code } = value;

        // Check session exists
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        if (session.status === SessionStatus.COMPLETED) {
            return res.status(400).json({
                success: false,
                error: 'Session already completed'
            });
        }

        // For MVP, auto-verify or send code
        if (!code) {
            // Send verification code
            await emailService.sendVerificationCode(sessionId, email);

            // For MVP, also mark as verified immediately
            session.email = email;
            session.emailVerified = true;
            await session.save();

            console.log(`[VERIFY] Email verified for session ${sessionId}`);

            return res.json({
                success: true,
                message: 'Email verification code sent (auto-verified for MVP)',
                data: {
                    emailVerified: true
                }
            });
        }

        // Verify code if provided
        const isValid = await emailService.verifyCode(sessionId, code);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid verification code'
            });
        }

        // Update session
        session.email = email;
        session.emailVerified = true;
        await session.save();

        console.log(`[VERIFY] Email verified with code for session ${sessionId}`);

        res.json({
            success: true,
            message: 'Email verified successfully',
            data: {
                emailVerified: true
            }
        });
    } catch (err) {
        next(err);
    }
}

export async function verifyPhone(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
        const { error, value } = phoneSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }

        const { sessionId, phone, code } = value;

        // Validate phone format
        if (!phoneService.validatePhoneFormat(phone)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format'
            });
        }

        // Check session exists
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        if (session.status === SessionStatus.COMPLETED) {
            return res.status(400).json({
                success: false,
                error: 'Session already completed'
            });
        }

        // For MVP, auto-verify or send code
        if (!code) {
            // Send verification code
            await phoneService.sendVerificationCode(sessionId, phone);

            // For MVP, also mark as verified immediately
            session.phone = phone;
            session.phoneVerified = true;
            await session.save();

            console.log(`[VERIFY] Phone verified for session ${sessionId}`);

            return res.json({
                success: true,
                message: 'Phone verification code sent (auto-verified for MVP)',
                data: {
                    phoneVerified: true
                }
            });
        }

        // Verify code if provided
        const isValid = await phoneService.verifyCode(sessionId, code);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid verification code'
            });
        }

        // Update session
        session.phone = phone;
        session.phoneVerified = true;
        await session.save();

        console.log(`[VERIFY] Phone verified with code for session ${sessionId}`);

        res.json({
            success: true,
            message: 'Phone verified successfully',
            data: {
                phoneVerified: true
            }
        });
    } catch (err) {
        next(err);
    }
}

import * as faceService from '../services/faceService';

export async function verifyFace(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'sessionId is required'
            });
        }

        // Check for uploaded files
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (!files || !files['idImage'] || !files['selfieImage']) {
            return res.status(400).json({
                success: false,
                error: 'Both ID document and Selfie are required'
            });
        }

        const idFile = files['idImage'][0];
        const selfieFile = files['selfieImage'][0];

        // Validate files
        const idValidation = idService.validateImageFile(idFile.mimetype, idFile.size);
        if (!idValidation.valid) return res.status(400).json({ success: false, error: `ID: ${idValidation.error}` });

        const selfieValidation = idService.validateImageFile(selfieFile.mimetype, selfieFile.size);
        if (!selfieValidation.valid) return res.status(400).json({ success: false, error: `Selfie: ${selfieValidation.error}` });

        // Check session exists
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        if (session.status === SessionStatus.COMPLETED) {
            return res.status(400).json({
                success: false,
                error: 'Session already completed'
            });
        }

        // 1. Process ID Document (get hash)
        const idHash = await idService.processIdDocument(idFile.buffer);

        // 2. Face Verification (Azure)
        const faceMatch = await faceService.fullKycFaceMatch(idFile.buffer, selfieFile.buffer);

        if (!faceMatch.verified) {
            return res.status(400).json({
                success: false,
                error: `Face verification failed: ${faceMatch.reason}`
            });
        }

        // Update session
        session.idHash = idHash;
        session.idVerified = true;
        // Store verification metadata if needed, e.g. session.faceMatchConfidence = faceMatch.confidence;
        await session.save();

        console.log(`[VERIFY] Face verified for session ${sessionId} (Confidence: ${faceMatch.confidence})`);

        res.json({
            success: true,
            message: 'Identity verified successfully',
            data: {
                idHash: idHash.substring(0, 16) + '...',
                idVerified: true,
                faceConfidence: faceMatch.confidence
            }
        });
    } catch (err) {
        next(err);
    }
}
