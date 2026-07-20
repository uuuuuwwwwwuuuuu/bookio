import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import 'dotenv/config';
import { auth } from './auth.js';
import routes from './routes/index.js';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

import { TRUSTED_ORIGINS, PORT } from '@/utils/constants.js';

const app = new Hono();

app.use('*', logger());

app.use(
    '/api/*',
    cors({
        origin: TRUSTED_ORIGINS,
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    }),
);

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

app.get('/', (c) => {
    return c.text('Hello Hono!');
});

app.route('/api', routes);

export default app;

if (!process.env.VERCEL) {
    serve(
        {
            fetch: app.fetch,
            port: +PORT!,
        },
        (info) => {
            console.log(`Server is running on http://localhost:${info.port}`);
        },
    );
}
