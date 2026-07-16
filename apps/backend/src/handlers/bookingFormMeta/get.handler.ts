import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';

const factory = createFactory().createHandlers;

const getBookingFormMetaSchema = z.object({
    bookingFormId: z.uuid(),
});

export const getBookingFormMetaHandler = factory(
    zValidator('query', getBookingFormMetaSchema),
    async (c) => {
        try {
            const { bookingFormId } = c.req.valid('query');

            const meta = await db.query.bookingFormMetaData.findFirst({
                where: (meta, { eq }) => eq(meta.bookingFormId, bookingFormId),
            });

            if (!meta) {
                return c.json(prepareError('Booking form meta not found'), 404);
            }

            return c.json(prepareSuccess(meta));
        } catch (error) {
            return c.json(prepareError('Failed to get booking form meta'), 500);
        }
    },
);
