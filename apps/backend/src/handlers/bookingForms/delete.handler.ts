import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { bookingForms } from '@bookio/db';
import { createFactory } from 'hono/factory';
import { eq } from 'drizzle-orm';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import { deleteBookingFormSchema } from '@schemas/bookingForms/delete.schema.js';

const factory = createFactory().createHandlers;

export const deleteBookingFormHandler = factory(zValidator('json', deleteBookingFormSchema), async (c) => {
    try {
        const { bookingFormId, name } = c.req.valid('json');

        const bookingForm = await db.query.bookingForms.findFirst({
            where: (bookingForm, { eq, and }) =>
                and(eq(bookingForm.id, bookingFormId), eq(bookingForm.name, name)),
        });

        if (!bookingForm) {
            return c.json(prepareError('Booking form not found'), 404);
        }

        const [deletedBookingForm] = await db
            .delete(bookingForms)
            .where(eq(bookingForms.id, bookingFormId))
            .returning();

        if (!deletedBookingForm) {
            return c.json(prepareError('Failed to delete booking form'), 500);
        }

        return c.json(prepareSuccess(deletedBookingForm));
    } catch (error) {
        return c.json(prepareError('Failed to delete booking form'), 500);
    }
});
