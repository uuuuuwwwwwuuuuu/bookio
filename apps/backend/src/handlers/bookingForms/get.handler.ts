import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import {
    getActiveBookingFormsByOrganizationSlugSchema,
    getBookingFormBySlugsSchema,
    getBookingFormSchema,
    getBookingFormsSchema,
} from '@schemas/bookingForms/get.schema.js';

const factory = createFactory().createHandlers;

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

export const getActiveBookingFormsByOrganizationSlugHandler = factory(
    zValidator('query', getActiveBookingFormsByOrganizationSlugSchema),
    async (c) => {
        try {
            const { organizationSlug } = c.req.valid('query');

            const organization = await db.query.organizations.findFirst({
                where: (organizations, { eq }) => eq(organizations.slug, organizationSlug),
                columns: { id: true },
            });

            if (!organization) {
                return c.json(prepareError('Organization not found'), 404);
            }

            const forms = await db.query.bookingForms.findMany({
                where: (bookingForms, { eq, and }) =>
                    and(
                        eq(bookingForms.organizationId, organization.id),
                        eq(bookingForms.isActive, true),
                    ),
                with: {
                    fields: {
                        where: (field, { isNull }) => isNull(field.parentId),
                        with: {
                            childFields: true,
                        },
                        orderBy: (field, { asc }) => [asc(field.order)],
                    },
                    metaData: true,
                    styles: true,
                },
            });

            return c.json(prepareSuccess(forms));
        } catch (error) {
            return c.json(
                prepareError('Failed to get active booking forms by organization slug'),
                500,
            );
        }
    },
);

export const getBookingFormBySlugsHandler = factory(
    zValidator('query', getBookingFormBySlugsSchema),
    async (c) => {
        try {
            const { organizationSlug, bookingFormSlug } = c.req.valid('query');

            const organization = await db.query.organizations.findFirst({
                where: (organizations, { eq }) => eq(organizations.slug, organizationSlug),
                columns: { id: true },
            });

            if (!organization) {
                return c.json(prepareError('Organization not found'), 404);
            }

            const form = await db.query.bookingForms.findFirst({
                where: (bookingForms, { eq, and }) =>
                    and(
                        eq(bookingForms.organizationId, organization.id),
                        eq(bookingForms.slug, bookingFormSlug),
                    ),
                with: {
                    fields: {
                        where: (field, { isNull }) => isNull(field.parentId),
                        with: {
                            childFields: true,
                        },
                        orderBy: (field, { asc }) => [asc(field.order)],
                    },
                    metaData: true,
                    styles: true,
                },
            });

            if (!form) {
                return c.json(prepareError('Booking form not found'), 404);
            }

            return c.json(prepareSuccess(form));
        } catch (error) {
            return c.json(prepareError('Failed to get booking form by slugs'), 500);
        }
    },
);
