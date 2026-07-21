import { z } from 'zod';
import type { BookingFormUpdate } from '@bookio/db';

export const updateBookingFormSchema = z
    .object({
        bookingFormId: z.uuid(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
        slug: z.string().min(1).max(60).optional(),
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
    ) satisfies z.ZodType<BookingFormUpdate>;
