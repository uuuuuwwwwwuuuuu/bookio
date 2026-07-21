import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { bookingFormFields } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { createBookingFormFieldSchema } from '@schemas/fields/create.schema.js';

const factory = createFactory().createHandlers;

export const createBookingFormFieldHandler = factory(
    zValidator('json', createBookingFormFieldSchema),
    async (c) => {
        try {
            const { bookingFormId, name, type, required, key, parentId, params } =
                c.req.valid('json');

            if (parentId) {
                const parentField = await db.query.bookingFormFields.findFirst({
                    where: (fields, { eq }) => eq(fields.id, parentId),
                });

                if (!parentField) {
                    return c.json(prepareError('Parent field not found'), 404);
                }

                if (parentField.bookingFormId !== bookingFormId) {
                    return c.json(
                        prepareError('Parent field belongs to a different booking form'),
                        400,
                    );
                }

                if (parentField.type !== 'group') {
                    return c.json(prepareError('Parent field must be of type group'), 400);
                }
            }

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

            let lastOrderField;
            if (parentId) {
                [lastOrderField] = await db
                    .select({ order: bookingFormFields.order })
                    .from(bookingFormFields)
                    .where(
                        and(
                            eq(bookingFormFields.bookingFormId, bookingFormId),
                            eq(bookingFormFields.parentId, parentId),
                        ),
                    )
                    .orderBy(desc(bookingFormFields.order))
                    .limit(1);
            } else {
                [lastOrderField] = await db
                    .select({ order: bookingFormFields.order })
                    .from(bookingFormFields)
                    .where(
                        and(
                            eq(bookingFormFields.bookingFormId, bookingFormId),
                            isNull(bookingFormFields.parentId),
                        ),
                    )
                    .orderBy(desc(bookingFormFields.order))
                    .limit(1);
            }

            const newOrder = lastOrderField ? lastOrderField.order + 1 : 0;

            const [newField] = await db
                .insert(bookingFormFields)
                .values({
                    bookingFormId,
                    name,
                    type,
                    required: type === 'group' ? false : required,
                    key,
                    order: newOrder,
                    parentId: parentId ?? null,
                    params,
                })
                .returning();

            if (!newField) {
                return c.json(prepareError('Failed to create booking form field'), 500);
            }

            return c.json(prepareSuccess(newField));
        } catch (error) {
            return c.json(prepareError('Failed to create booking form field'), 500);
        }
    },
);
