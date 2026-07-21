import { z } from 'zod';

export const updateBookingFormStylesSchema = z
    .object({
        bookingFormId: z.uuid(),
        primary: z.string().min(1).optional(),
        bgMain: z.string().min(1).optional(),
        bgSecondary: z.string().min(1).optional(),
        borderColor: z.string().min(1).optional(),
        textMain: z.string().min(1).optional(),
        textSecondary: z.string().min(1).optional(),
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
