import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import prisma from '../db.js'; // H-1 FIX: Shared Prisma singleton

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
    callbackURL: "/api/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
        let user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    googleId: profile.id,
                    regNo: profile.emails[0].value, // 🛠️ Fix: Use email as temporary RegNo to prevent NULL gap
                    role: 'STUDENT',
                    isOnboarded: false
                }
            });
        }
        return cb(null, user);
    } catch (error) {
        return cb(error, null);
    }
  }
));

passport.use(new LocalStrategy(
    { usernameField: 'identifier', passwordField: 'password' },
    async function(identifier, password, cb) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: identifier },
                        { regNo: identifier }
                    ]
                }
            });
            if (!user) { return cb(null, false, { message: 'Incorrect identity.' }); }
            if (!user.password) { return cb(null, false, { message: 'Must use Google Auth.' }); }
            
            const pepper = process.env.BCRYPT_SECRET || '';
            const match = await bcrypt.compare(password + pepper, user.password);
            if (!match) { return cb(null, false, { message: 'Incorrect password.' }); }
            return cb(null, user);
        } catch (error) {
            return cb(error);
        }
    }
));

export default passport;
