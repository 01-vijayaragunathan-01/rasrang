import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateTokens = (user) => {
    const csrfToken = crypto.randomBytes(32).toString('hex');

    const accessToken = jwt.sign(
        { id: user.id, role: user.role, csrf: csrfToken }, 
        process.env.JWT_SECRET || 'fallback_secret', 
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: user.id }, 
        process.env.REFRESH_TOKEN_SECRET || 'refresh_secret', 
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken, csrfToken };
};

export const sendTokenResponse = async (prisma, user, statusCode, res) => {
    const { accessToken, refreshToken, csrfToken } = generateTokens(user);

    // Save refreshToken in DB
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });

    const cookieOptions = {
        httpOnly: true, // Prevents JavaScript access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(statusCode).json({
        success: true,
        csrfToken, // Sent to frontend to be stored in memory/state
        user: { id: user.id, role: user.role, name: user.name }
    });
};
