import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { db } from '@/db.js';
import { zValidator } from '@hono/zod-validator';
import { bookingFormMetaData } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';

const createBookingFormMetaSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    bookingFormId: z.uuid(),
    additionalMetaData: z.record(z.string(), z.string()).optional(),
}) satisfies z.ZodType<typeof bookingFormMetaData.$inferInsert>;

const factory = createFactory().createHandlers;

export const createBookingFormMetaHandler = factory(
    zValidator('json', createBookingFormMetaSchema),
    async (c) => {
        try {
            const body = c.req.valid('json');

            const bookingFormMeta = await db.insert(bookingFormMetaData).values(body).returning();

            return c.json(prepareSuccess(bookingFormMeta));
        } catch (error) {
            return c.json(prepareError('Failed to create booking form meta'), 500);
        }
    },
);
