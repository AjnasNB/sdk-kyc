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

export async function verifyId(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'sessionId is required'
            });
        }

        // Check for uploaded file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'ID document image is required'
            });
        }

        // Validate file
        const validation = idService.validateImageFile(req.file.mimetype, req.file.size);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
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

        // Process document and get hash
        const idHash = await idService.processIdDocument(req.file.buffer);

        // Update session
        session.idHash = idHash;
        session.idVerified = true;
        await session.save();

        console.log(`[VERIFY] ID document verified for session ${sessionId}`);

        res.json({
            success: true,
            message: 'ID document verified successfully',
            data: {
                idHash: idHash.substring(0, 16) + '...', // Return truncated hash for security
                idVerified: true
            }
        });
    } catch (err) {
        next(err);
    }
}
