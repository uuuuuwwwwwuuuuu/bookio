import { z } from 'zod';

export const getBookingFormMetaSchema = z.object({
    bookingFormId: z.uuid(),
});
