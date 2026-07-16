import { Hono } from 'hono';
import { createBookingFormMetaHandler } from '@/handlers/bookingFormMeta/create.handler.js';
import { getBookingFormMetaHandler } from '@/handlers/bookingFormMeta/get.handler.js';
import { updateBookingFormMetaHandler } from '@/handlers/bookingFormMeta/update.handler.js';

const bookingFormMetaRoutes = new Hono()
    .post('/create', ...createBookingFormMetaHandler)
    .put('/update', ...updateBookingFormMetaHandler)
    .get('/get-one', ...getBookingFormMetaHandler);

export default bookingFormMetaRoutes;
