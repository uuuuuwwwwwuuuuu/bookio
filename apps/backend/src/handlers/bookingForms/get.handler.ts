import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';

const factory = createFactory().createHandlers;

const getBookingFormsSchema = z.object({
    organizationId: z.uuid(),
});

export const getBookingFormsHandler = factory(
    zValidator('query', getBookingFormsSchema),
    async (c) => {
        try {
            const { organizationId } = c.req.valid('query');

            const forms = await db.query.bookingForms.findMany({
                where: (bookingForms, { eq }) => eq(bookingForms.organizationId, organizationId),
            });

            return c.json(prepareSuccess(forms));
        } catch (error) {
            return c.json(prepareError('Failed to get booking forms'), 500);
        }
    },
);

const getBookingFormSchema = z.object({
    bookingFormId: z.uuid(),
});

export const getBookingFormHandler = factory(
    zValidator('query', getBookingFormSchema),
    async (c) => {
        try {
            const { bookingFormId } = c.req.valid('query');

            const form = await db.query.bookingForms.findFirst({
                where: (bookingForms, { eq }) => eq(bookingForms.id, bookingFormId),
            });

            return c.json(prepareSuccess(form));
        } catch (error) {
            return c.json(prepareError('Failed to get booking form'), 500);
        }
    },
);

export const getBookingFormWithFieldsHandler = factory(
    zValidator('query', getBookingFormSchema),
    async (c) => {
        try {
            const { bookingFormId } = c.req.valid('query');

            const form = await db.query.bookingForms.findFirst({
                where: (bookingForms, { eq }) => eq(bookingForms.id, bookingFormId),
                with: {
                    fields: {
                        where: (field, { isNull }) => isNull(field.parentId),
                        with: {
                            childFields: true,
                        },
                    },
                },
            });

            return c.json(prepareSuccess(form));
        } catch (error) {
            return c.json(prepareError('Failed to get booking form with fields'), 500);
        }
    },
);
