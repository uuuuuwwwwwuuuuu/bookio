import { Hono } from 'hono';
import { createBookingFormFieldHandler } from '@/handlers/bookingFormFields/create.handler.js';
import { updateBookingFormFieldHandler } from '@/handlers/bookingFormFields/update.handler.js';
import { deleteBookingFormFieldHandler } from '@/handlers/bookingFormFields/delete.handler.js';
import {
    getBookingFormFieldHandler,
    getBookingFormFieldsHandler,
} from '@/handlers/bookingFormFields/get.handler.js';

const fields = new Hono()
    .post('/create', ...createBookingFormFieldHandler)
    .put('/update', ...updateBookingFormFieldHandler)
    .delete('/delete', ...deleteBookingFormFieldHandler)
    .get('/get-one', ...getBookingFormFieldHandler)
    .get('/get-all', ...getBookingFormFieldsHandler);

export default fields;
