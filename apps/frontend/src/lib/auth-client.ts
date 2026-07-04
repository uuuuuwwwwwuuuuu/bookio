import { createAuthClient } from 'better-auth/react';
import { API_URL } from '@utils/constants';

export const authClient = createAuthClient({
    baseURL: API_URL ?? 'http://localhost:3001',
    fetchOptions: {
        credentials: 'include',
    },
});
