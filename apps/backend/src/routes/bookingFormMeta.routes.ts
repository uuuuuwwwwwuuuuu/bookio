import { Hono } from 'hono';
import { createBookingFormMetaHandler } from '@/handlers/bookingFormMeta/create.handler.js';

const bookingFormMetaRoutes = new Hono().post('/create', ...createBookingFormMetaHandler);

export default bookingFormMetaRoutes;