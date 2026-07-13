import { Hono } from 'hono';
import { createBookingFormHandler } from '@/handlers/bookingForms/create.handler.js';
import { isBookingFormExistsHandler } from '@/handlers/bookingForms/isExists.handler.js';
import {
    getBookingFormsHandler,
    getBookingFormHandler,
    getBookingFormWithFieldsHandler,
} from '@/handlers/bookingForms/get.handler.js';
import { updateBookingFormHandler } from '@/handlers/bookingForms/update.handler.js';

const bookings = new Hono()
    .post('/create', ...createBookingFormHandler)
    .put('/update', ...updateBookingFormHandler)
    .post('/is-exists', ...isBookingFormExistsHandler)
    .get('/get-all', ...getBookingFormsHandler)
    .get('/get-one', ...getBookingFormHandler)
    .get('/get-one-with-fields', ...getBookingFormWithFieldsHandler);

export default bookings;