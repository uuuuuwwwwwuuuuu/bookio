import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { bookingFormStyles } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import { eq } from 'drizzle-orm';
import { updateBookingFormStylesSchema } from '@schemas/bookingFormStyles/update.schema.js';

const factory = createFactory().createHandlers;

export const updateBookingFormStylesHandler = factory(
    zValidator('json', updateBookingFormStylesSchema),
    async (c) => {
        try {
            const { bookingFormId, primary, bgMain, bgSecondary, borderColor, textMain, textSecondary } =
                c.req.valid('json');

            const existingStyles = await db.query.bookingFormStyles.findFirst({
                where: (styles, { eq }) => eq(styles.bookingFormId, bookingFormId),
            });

            if (!existingStyles) {
                return c.json(prepareError('Booking form styles not found'), 404);
            }

            const [updated] = await db
                .update(bookingFormStyles)
                .set({ primary, bgMain, bgSecondary, borderColor, textMain, textSecondary })
                .where(eq(bookingFormStyles.bookingFormId, bookingFormId))
                .returning();

            if (!updated) {
                return c.json(prepareError('Failed to update booking form styles'), 500);
            }

            return c.json(prepareSuccess(updated));
        } catch (error) {
            return c.json(prepareError('Failed to update booking form styles'), 500);
        }
    },
);
