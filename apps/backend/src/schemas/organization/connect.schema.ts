import { z } from 'zod';

export const connectOrganizationSchema = z.object({
    slug: z.string(),
    password: z.string(),
    userId: z.string(),
});
