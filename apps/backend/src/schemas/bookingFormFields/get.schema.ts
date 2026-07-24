import { z } from 'zod';

export const getBookingFormFieldSchema = z.object({
    bookingFormFieldId: z.uuid(),
});

export const getBookingFormFieldsSchema = z.object({
    bookingFormId: z.uuid(),
});
