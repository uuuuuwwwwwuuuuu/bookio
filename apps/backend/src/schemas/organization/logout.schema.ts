import { z } from 'zod';

export const logoutOrganizationSchema = z.object({
    userId: z.string(),
    organizationId: z.string(),
    organizationPassword: z.string().optional(),
});
