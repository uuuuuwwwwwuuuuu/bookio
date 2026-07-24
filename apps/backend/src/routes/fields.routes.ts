import { Hono } from 'hono';
import { syncBookingFormFieldsHandler } from '@/handlers/bookingFormFields/sync.handler.js';
import { deleteBookingFormFieldHandler } from '@/handlers/bookingFormFields/delete.handler.js';
import {
    getBookingFormFieldHandler,
    getBookingFormFieldsHandler,
} from '@/handlers/bookingFormFields/get.handler.js';

const fields = new Hono()
    .put('/sync', ...syncBookingFormFieldsHandler)
    .delete('/delete', ...deleteBookingFormFieldHandler)
    .get('/get-one', ...getBookingFormFieldHandler)
    .get('/get-all', ...getBookingFormFieldsHandler);

export default fields;
