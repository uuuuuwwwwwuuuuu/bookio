import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prepareSuccess } from '@/utils/prepareResponse.js';
import { isOrganizationExists } from '@/utils/isOrganizationExists.js';

const isOrganizationExistsSchema = z.object({
    slug: z.string(),
});

const factory = createFactory().createHandlers;

export const isOrganizationExistsHandler = factory(
    zValidator('json', isOrganizationExistsSchema),
    async (c) => {
        const { slug } = c.req.valid('json');

        const isExists = await isOrganizationExists(slug);
        
        return c.json(prepareSuccess(isExists));
    },
);
