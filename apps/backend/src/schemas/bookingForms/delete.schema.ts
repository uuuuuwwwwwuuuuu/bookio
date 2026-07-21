import { z } from 'zod';

export const deleteBookingFormSchema = z.object({
    bookingFormId: z.uuid(),
    name: z.string(),
});
