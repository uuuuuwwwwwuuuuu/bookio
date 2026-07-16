import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';

const factory = createFactory().createHandlers;

const getBookingFormStylesSchema = z.object({
    bookingFormId: z.uuid(),
});

export const getBookingFormStylesHandler = factory(
    zValidator('query', getBookingFormStylesSchema),
    async (c) => {
        try {
            const { bookingFormId } = c.req.valid('query');

            const styles = await db.query.bookingFormStyles.findFirst({
                where: (styles, { eq }) => eq(styles.bookingFormId, bookingFormId),
            });

            if (!styles) {
                return c.json(prepareError('Booking form styles not found'), 404);
            }

            return c.json(prepareSuccess(styles));
        } catch (error) {
            return c.json(prepareError('Failed to get booking form styles'), 500);
        }
    },
);
