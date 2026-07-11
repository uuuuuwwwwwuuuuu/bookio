import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { bookingFormFields, fieldTypeValues, type BookingFormInsert } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import { and, desc, eq } from 'drizzle-orm';

const factory = createFactory().createHandlers;

const createBookingFormFieldSchema = z.object({
    bookingFormId: z.uuid(),
    name: z.string().min(1).max(255),
    type: z.enum(fieldTypeValues),
    required: z.boolean().default(true),
    key: z.string().min(1).max(255).regex(/^\S+$/, 'Key must not contain spaces'),
    parentId: z.uuid().optional().nullable(),
}) satisfies z.ZodType<BookingFormInsert>;

export const createBookingFormFieldHandler = factory(
    zValidator('json', createBookingFormFieldSchema),
    async (c) => {
        try {
            const { bookingFormId, name, type, required, key, parentId } = c.req.valid('json');

            const [existingField] = await db
                .select()
                .from(bookingFormFields)
                .where(
                    and(
                        eq(bookingFormFields.bookingFormId, bookingFormId),
                        eq(bookingFormFields.key, key),
                    ),
                );

            if (existingField) {
                return c.json(prepareError('Field with this key already exists'), 400);
            }

            const [lastOrderField] = await db
                .select({ order: bookingFormFields.order })
                .from(bookingFormFields)
                .where(eq(bookingFormFields.bookingFormId, bookingFormId))
                .orderBy(desc(bookingFormFields.order))
                .limit(1);

            const newOrder = lastOrderField ? lastOrderField.order + 1 : 0;

            const [newField] = await db
                .insert(bookingFormFields)
                .values({
                    bookingFormId,
                    name,
                    type,
                    required,
                    key,
                    order: newOrder,
                    parentId,
                })
                .returning();

            if (!newField) {
                return c.json(prepareError('Failed to create booking form field'), 500);
            }

            return c.json(prepareSuccess('Booking form field created'));
        } catch (error) {
            return c.json(prepareError('Failed to create booking form field'), 500);
        }
    },
);
