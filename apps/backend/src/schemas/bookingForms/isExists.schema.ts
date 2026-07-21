import { z } from 'zod';

export const isBookingFormExistsSchema = z
    .object({
        organizationId: z.uuid(),
        name: z.string().min(1).max(255).optional(),
        slug: z.string().min(1).max(60).optional(),
    })
    .refine((data) => data.name !== undefined || data.slug !== undefined, {
        message: 'Either name or slug must be provided',
    });
