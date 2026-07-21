import { z } from 'zod';

export const getBookingFormStylesSchema = z.object({
    bookingFormId: z.uuid(),
});
