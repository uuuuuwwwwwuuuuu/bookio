import { z } from 'zod';

export const testSchema = z.object({
    bookingFormId: z.uuid(),
});
