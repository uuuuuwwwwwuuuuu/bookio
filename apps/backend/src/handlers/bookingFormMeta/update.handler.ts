import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { bookingFormMetaData } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import { eq } from 'drizzle-orm';
import { updateBookingFormMetaSchema } from '@schemas/bookingFormMeta/update.schema.js';

const factory = createFactory().createHandlers;

export const updateBookingFormMetaHandler = factory(
    zValidator('json', updateBookingFormMetaSchema),
    async (c) => {
        try {
            const { bookingFormId, title, description, additionalMetaData } = c.req.valid('json');

            const existingMeta = await db.query.bookingFormMetaData.findFirst({
                where: (meta, { eq }) => eq(meta.bookingFormId, bookingFormId),
            });

            if (!existingMeta) {
                return c.json(prepareError('Booking form meta not found'), 404);
            }

            const [updatedMeta] = await db
                .update(bookingFormMetaData)
                .set({ title, description, additionalMetaData })
                .where(eq(bookingFormMetaData.bookingFormId, bookingFormId))
                .returning();

            if (!updatedMeta) {
                return c.json(prepareError('Failed to update booking form meta'), 500);
            }

            return c.json(prepareSuccess(updatedMeta));
        } catch (error) {
            return c.json(prepareError('Failed to update booking form meta'), 500);
        }
    },
);
