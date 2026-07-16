import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { bookingFormMetaData } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import { eq } from 'drizzle-orm';

const factory = createFactory().createHandlers;

const updateBookingFormMetaSchema = z
    .object({
        bookingFormId: z.uuid(),
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        additionalMetaData: z.record(z.string(), z.string()).optional(),
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
    );

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
