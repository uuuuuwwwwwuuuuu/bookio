import { Hono } from 'hono';
import { createBookingFormHandler } from '@/handlers/bookingForms/create.handler.js';
import {
    getBookingFormsHandler,
    getBookingFormHandler,
    getBookingFormWithFieldsHandler,
} from '@/handlers/bookingForms/get.handler.js';

const bookings = new Hono()
    .post('/create', ...createBookingFormHandler)
    .get('/get-all', ...getBookingFormsHandler)
    .get('/get-one', ...getBookingFormHandler)
    .get('/get-one-with-fields', ...getBookingFormWithFieldsHandler);

export default bookings;