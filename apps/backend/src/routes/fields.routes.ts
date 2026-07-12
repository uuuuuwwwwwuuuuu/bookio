import { Hono } from 'hono';
import { createBookingFormFieldHandler } from '@/handlers/fields/create.handler.js';
import { updateBookingFormFieldHandler } from '@/handlers/fields/update.handler.js';
import { deleteBookingFormFieldHandler } from '@/handlers/fields/delete.handler.js';
import {
    getBookingFormFieldHandler,
    getBookingFormFieldsHandler,
} from '@/handlers/fields/get.handler.js';

const fields = new Hono()
    .post('/create', ...createBookingFormFieldHandler)
    .put('/update', ...updateBookingFormFieldHandler)
    .delete('/delete', ...deleteBookingFormFieldHandler)
    .get('/get-one', ...getBookingFormFieldHandler)
    .get('/get-all', ...getBookingFormFieldsHandler);

export default fields;
