import { z } from 'zod';

export const updateBookingFormMetaSchema = z
    .object({
        bookingFormId: z.uuid(),
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        additionalMetaData: z.record(z.string(), z.string()).optional(),
    })
    .refine(
        (data) =>
            Object.entries(data).some(([key, value]) => {
                if (key === 'bookingFormId') return false;

                return value !== undefined;
            }),
        {
            message: 'At least one field must be provided',
        },
    );
