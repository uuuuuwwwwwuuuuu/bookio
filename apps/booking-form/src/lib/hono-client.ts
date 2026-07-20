import { hc } from 'hono/client';
import type { AppType } from '@bookio/backend';
import { API_URL } from '@utils/constants';

if (!API_URL) {
    throw new Error('API_URL is not set');
}

const hono = hc<AppType>(`${API_URL}/api`);

export default hono;
