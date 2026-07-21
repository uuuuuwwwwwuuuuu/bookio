import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { bookingForms } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import { isBookingFormExists } from '@/utils/isBookingFormExists.js';
import { eq } from 'drizzle-orm';
import { updateBookingFormSchema } from '@schemas/bookingForms/update.schema.js';

const factory = createFactory().createHandlers;

export const updateBookingFormHandler = factory(
    zValidator('json', updateBookingFormSchema),
    async (c) => {
        try {
            const { bookingFormId, name, description, isActive, slug } = c.req.valid('json');

            const existingBookingForm = await db.query.bookingForms.findFirst({
                where: (bookingForms, { eq }) => eq(bookingForms.id, bookingFormId),
            });

            if (!existingBookingForm) {
                return c.json(prepareError('Booking form not found'), 404);
            }

            if (name !== undefined && name !== existingBookingForm.name) {
                const duplicateByName = await isBookingFormExists({
                    name,
                    organizationId: existingBookingForm.organizationId,
                });

                if (duplicateByName) {
                    return c.json(prepareError('Booking form with this name already exists'), 400);
                }
            }

            if (slug !== undefined && slug !== existingBookingForm.slug) {
                const duplicateBySlug = await isBookingFormExists({
                    slug,
                    organizationId: existingBookingForm.organizationId,
                });

                if (duplicateBySlug) {
                    return c.json(prepareError('Booking form with this slug already exists'), 400);
                }
            }

            const [updatedBookingForm] = await db
                .update(bookingForms)
                .set({ name, description, isActive, slug })
                .where(eq(bookingForms.id, bookingFormId))
                .returning();

            if (!updatedBookingForm) {
                return c.json(prepareError('Failed to update booking form'), 500);
            }

            return c.json(prepareSuccess(updatedBookingForm));
        } catch (error) {
            return c.json(prepareError('Failed to update booking form'), 500);
        }
    },
);
