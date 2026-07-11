import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { bookingForms } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';

const factory = createFactory().createHandlers;

const createBookingFormSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional().nullable(),
    organizationId: z.uuid(),
});

export const createBookingFormHandler = factory(
    zValidator('json', createBookingFormSchema),
    async (c) => {
        try {
            const { name, description, organizationId } = c.req.valid('json');

            const existingBookingForm = await db.query.bookingForms.findFirst({
                where: (bookingForms, { eq }) => eq(bookingForms.name, name),
                columns: {
                    id: true
                }
            })

            if (existingBookingForm) {
                return c.json(prepareError('Booking form with this name already exists'), 400);
            }

            const bookingForm = await db
                .insert(bookingForms)
                .values({
                    name,
                    description,
                    organizationId,
                }).returning();

            return c.json(prepareSuccess(bookingForm));
        } catch (error) {
            return c.json(prepareError('Failed to create booking form'), 500);
        }
    },
);
