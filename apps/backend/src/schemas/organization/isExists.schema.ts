import { z } from 'zod';

export const isOrganizationExistsSchema = z.object({
    slug: z.string(),
});
