import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import * as schema from '@bookio/db';
import { db } from './db.js';
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL, ENVIRONMENT, TRUSTED_ORIGINS } from '@/utils/constants.js';

const isHttps = BETTER_AUTH_URL?.startsWith('https://');

export const auth = betterAuth({
    secret: BETTER_AUTH_SECRET!,
    baseURL: BETTER_AUTH_URL!,
    trustedOrigins: TRUSTED_ORIGINS,
    database: drizzleAdapter(db, {
        provider: 'pg',
        usePlural: true,
        schema: {
            users: schema.users,
            sessions: schema.sessions,
            accounts: schema.accounts,
            verifications: schema.verifications,
        },
    }),
    emailAndPassword: {
        enabled: true,
    },
    advanced: {
        database: {
            generateId: false,
        },
        disableOriginCheck: ENVIRONMENT === 'development',
        // Cross-origin frontend/backend (different *.vercel.app hosts) need
        // SameSite=None; Secure or the browser drops the session cookie.
        ...(isHttps
            ? {
                  defaultCookieAttributes: {
                      sameSite: 'none' as const,
                      secure: true,
                      httpOnly: true,
                  },
              }
            : {}),
    },
    user: {
        deleteUser: {
            enabled: true,
        },
    },
});
