import { Hono } from 'hono';
import organizations from './organizations.js';

const routes = new Hono().route('/organizations', organizations);

export default routes;
export type AppType = typeof routes;
