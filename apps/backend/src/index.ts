import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import 'dotenv/config';
import { auth } from './auth.js';
import routes from './routes/index.js';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', logger());

app.use(
    '/api/auth/*',
    cors({
        origin: process.env.TRUSTED_ORIGINS ?? 'http://localhost:3000',
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['POST', 'GET', 'OPTIONS'],
        credentials: true,
    }),
);

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

app.get('/', (c) => {
    return c.text('Hello Hono!');
});

app.route('/api', routes);

serve(
    {
        fetch: app.fetch,
        port: +process.env.PORT!,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    },
);
