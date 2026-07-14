import { Hono } from 'hono';
import organizations from './organizations.routes.js';
import bookings from './bookingForms.routes.js';
import fields from './fields.routes.js';
import test from '@/handlers/test.js';


const routes = new Hono()
    .route('/organizations', organizations)
    .route('/booking-forms', bookings)
    .route('/fields', fields)
    .route('/test', test)

export default routes;
export type AppType = typeof routes;
