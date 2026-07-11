import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { bookingFormFields } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import { eq } from 'drizzle-orm';

const factory = createFactory().createHandlers;

const deleteBookingFormFieldSchema = z.object({
    id: z.uuid(),
});

export const deleteBookingFormFieldHandler = factory(
    zValidator('json', deleteBookingFormFieldSchema),
    async (c) => {
        try {
            const { id } = c.req.valid('json');

            const [existingField] = await db
                .select()
                .from(bookingFormFields)
                .where(eq(bookingFormFields.id, id));

            if (!existingField) {
                return c.json(prepareError('Field already deleted'), 404);
            }
            
            await db.delete(bookingFormFields).where(eq(bookingFormFields.id, id));

            return c.json(prepareSuccess('Booking form field deleted'));

        } catch (error) {
            return c.json(prepareError('Failed to delete booking form field'), 500);
        }
    },
);