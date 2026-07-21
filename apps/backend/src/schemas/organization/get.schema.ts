import { z } from 'zod';

export const organizationSchema = z.object({
    userId: z.string(),
});

export const getOrganizationDataSchema = z.object({
    userId: z.string(),
    organizationId: z.string(),
});
