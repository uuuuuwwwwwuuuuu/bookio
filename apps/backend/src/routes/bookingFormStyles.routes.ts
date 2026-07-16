import { Hono } from 'hono';
import { createBookingFormStylesHandler } from '@/handlers/bookingFormStyles/create.handler.js';
import { getBookingFormStylesHandler } from '@/handlers/bookingFormStyles/get.handler.js';
import { updateBookingFormStylesHandler } from '@/handlers/bookingFormStyles/update.handler.js';

const bookingFormStylesRoutes = new Hono()
    .post('/create', ...createBookingFormStylesHandler)
    .put('/update', ...updateBookingFormStylesHandler)
    .get('/get-one', ...getBookingFormStylesHandler);

export default bookingFormStylesRoutes;
