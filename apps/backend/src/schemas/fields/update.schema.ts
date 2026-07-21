import { z } from 'zod';
import { fieldTypeValues, type BookingFormFieldUpdate } from '@bookio/db';

export const updateBookingFormFieldSchema = z
    .object({
        bookingFormId: z.uuid(),
        name: z.string().min(1).max(255).optional(),
        type: z.enum(fieldTypeValues).optional(),
        required: z.boolean().optional(),
        key: z.string().min(1).max(255).regex(/^\S+$/, 'Key must not contain spaces').optional(),
        parentId: z.uuid().optional().nullable(),
        order: z.number().int().min(0).optional(),
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
    ) satisfies z.ZodType<BookingFormFieldUpdate>;
