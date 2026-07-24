import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { bookingFormFields } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import { eq } from 'drizzle-orm';
import { updateBookingFormFieldSchema } from '@schemas/bookingFormFields/update.schema.js';

const factory = createFactory().createHandlers;

export const updateBookingFormFieldHandler = factory(
    zValidator('json', updateBookingFormFieldSchema),
    async (c) => {
        try {
            const { id, name, type, required, key, parentId, order, params } = c.req.valid('json');

            const existingField = await db.query.bookingFormFields.findFirst({
                where: (fields, { eq }) => eq(fields.id, id),
            });

            if (!existingField) {
                return c.json(prepareError('Field not found'), 404);
            }

            const [updatedField] = await db
                .update(bookingFormFields)
                .set({
                    name,
                    type,
                    required: type === 'group' ? false : required,
                    key,
                    parentId,
                    order,
                    params,
                })
                .where(eq(bookingFormFields.id, id))
                .returning();

            if (!updatedField) {
                return c.json(prepareError('Failed to update booking form field'), 500);
            }

            return c.json(prepareSuccess(updatedField));
        } catch (error) {
            return c.json(prepareError('Failed to update booking form field'), 500);
        }
    },
);
