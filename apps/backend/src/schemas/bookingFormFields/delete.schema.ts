import { z } from 'zod';

export const deleteBookingFormFieldSchema = z.object({
    id: z.uuid(),
});
