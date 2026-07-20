import { Hono } from 'hono';
import { createBookingFormHandler } from '@/handlers/bookingForms/create.handler.js';
import { isBookingFormExistsHandler } from '@/handlers/bookingForms/isExists.handler.js';
import {
    getBookingFormsHandler,
    getBookingFormHandler,
    getBookingFormWithFieldsHandler,
    getActiveBookingFormsByOrganizationSlugHandler,
} from '@/handlers/bookingForms/get.handler.js';
import { updateBookingFormHandler } from '@/handlers/bookingForms/update.handler.js';
import { deleteBookingFormHandler } from '@/handlers/bookingForms/delete.handler.js';

const bookings = new Hono()
    .post('/create', ...createBookingFormHandler)
    .put('/update', ...updateBookingFormHandler)
    .delete('/delete', ...deleteBookingFormHandler)
    .post('/is-exists', ...isBookingFormExistsHandler)
    .get('/get-all', ...getBookingFormsHandler)
    .get('/get-one', ...getBookingFormHandler)
    .get('/get-one-with-fields', ...getBookingFormWithFieldsHandler)
    .get(
        '/get-active-by-organization-slug',
        ...getActiveBookingFormsByOrganizationSlugHandler,
    );

export default bookings;
