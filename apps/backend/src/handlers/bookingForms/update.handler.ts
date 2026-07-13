import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { bookingForms, type BookingFormUpdate } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import { isBookingFormExists } from '@/utils/isBookingFormExists.js';
import { eq } from 'drizzle-orm';

const factory = createFactory().createHandlers;

const updateBookingFormSchema = z
    .object({
        bookingFormId: z.uuid(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
    })
    .refine(
        (data) =>
            Object.entries(data).some(([key, value]) => {
                if (key === 'bookingFormId') return false;

                return value !== undefined;
            }),
        {
            message: 'At least one field must be provided',
        },
    ) satisfies z.ZodType<BookingFormUpdate>;

export const updateBookingFormHandler = factory(
    zValidator('json', updateBookingFormSchema),
    async (c) => {
        try {
            const { bookingFormId, name, description, isActive } = c.req.valid('json');

            const existingBookingForm = await db.query.bookingForms.findFirst({
                where: (bookingForms, { eq }) => eq(bookingForms.id, bookingFormId),
            });

            if (!existingBookingForm) {
                return c.json(prepareError('Booking form not found'), 404);
            }

            if (name !== undefined && name !== existingBookingForm.name) {
                const duplicateBookingForm = await isBookingFormExists(
                    name,
                    existingBookingForm.organizationId,
                );

                if (duplicateBookingForm) {
                    return c.json(prepareError('Booking form with this name already exists'), 400);
                }
            }

            const [updatedBookingForm] = await db
                .update(bookingForms)
                .set({ name, description, isActive })
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
