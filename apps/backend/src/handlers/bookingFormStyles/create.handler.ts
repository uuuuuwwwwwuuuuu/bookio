import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { bookingFormStyles } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';

const factory = createFactory().createHandlers;

const createBookingFormStylesSchema = z.object({
    bookingFormId: z.uuid(),
    primary: z.string().min(1),
    bgMain: z.string().min(1),
    bgSecondary: z.string().min(1),
    borderColor: z.string().min(1),
    textMain: z.string().min(1),
    textSecondary: z.string().min(1),
}) satisfies z.ZodType<
    Omit<typeof bookingFormStyles.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
>;

export const createBookingFormStylesHandler = factory(
    zValidator('json', createBookingFormStylesSchema),
    async (c) => {
        try {
            const {
                bookingFormId,
                primary,
                bgMain,
                bgSecondary,
                borderColor,
                textMain,
                textSecondary,
            } = c.req.valid('json');

            const bookingForm = await db.query.bookingForms.findFirst({
                where: (bookingForms, { eq }) => eq(bookingForms.id, bookingFormId),
            });

            if (!bookingForm) {
                return c.json(prepareError('Booking form not found'), 404);
            }

            const existingStyles = await db.query.bookingFormStyles.findFirst({
                where: (styles, { eq }) => eq(styles.bookingFormId, bookingFormId),
            });

            if (existingStyles) {
                return c.json(prepareError('Booking form styles already exist'), 400);
            }

            const [created] = await db
                .insert(bookingFormStyles)
                .values({
                    bookingFormId,
                    primary,
                    bgMain,
                    bgSecondary,
                    borderColor,
                    textMain,
                    textSecondary,
                })
                .returning();

            if (!created) {
                return c.json(prepareError('Failed to create booking form styles'), 500);
            }

            return c.json(prepareSuccess(created));
        } catch (error) {
            return c.json(prepareError('Failed to create booking form styles'), 500);
        }
    },
);
