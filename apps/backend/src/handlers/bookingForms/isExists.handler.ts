import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import { isBookingFormExists } from '@/utils/isBookingFormExists.js';

const isBookingFormExistsSchema = z.object({
    name: z.string().min(1),
    organizationId: z.uuid(),
});

const factory = createFactory().createHandlers;

export const isBookingFormExistsHandler = factory(
    zValidator('json', isBookingFormExistsSchema),
    async (c) => {
        try {

            const { name, organizationId } = c.req.valid('json');
            
            const isExists = await isBookingFormExists(name, organizationId);
            
            return c.json(prepareSuccess(isExists));
        } catch (error) {
            return c.json(prepareError('Failed to check if booking form exists'));
        }
    },
);
