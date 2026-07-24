import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import {
    getBookingFormFieldSchema,
    getBookingFormFieldsSchema,
} from '@schemas/bookingFormFields/get.schema.js';

const factory = createFactory().createHandlers;

export const getBookingFormFieldHandler = factory(
    zValidator('query', getBookingFormFieldSchema),
    async (c) => {
        try {
            const { bookingFormFieldId: fieldId } = c.req.valid('query');

            const field = await db.query.bookingFormFields.findFirst({
                where: (field, { eq }) => eq(field.id, fieldId),
                with: {
                    childFields: true,
                },
            });

            if (!field) {
                return c.json(prepareError('Field not found'), 404);
            }

            return c.json(prepareSuccess(field));
        } catch (error) {
            return c.json(prepareError('Failed to get booking form field'), 500);
        }
    },
);

export const getBookingFormFieldsHandler = factory(
    zValidator('query', getBookingFormFieldsSchema),
    async (c) => {
        try {
            const { bookingFormId } = c.req.valid('query');

            const fields = await db.query.bookingFormFields.findMany({
                where: (field, { eq, and, isNull }) =>
                    and(eq(field.bookingFormId, bookingFormId), isNull(field.parentId)),
                with: {
                    childFields: true,
                },
                orderBy: (field, { asc }) => [asc(field.order)],
            });

            if (!fields || fields.length === 0) {
                return c.json(prepareError('Fields not found'), 404);
            }

            return c.json(prepareSuccess(fields));
        } catch (error) {
            return c.json(prepareError('Failed to get booking form fields'), 500);
        }
    },
);
