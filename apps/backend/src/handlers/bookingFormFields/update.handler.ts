import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { bookingFormFields } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import { eq, inArray } from 'drizzle-orm';
import {
    type SyncBookingFormFieldItem,
    updateBookingFormFieldsSchema,
} from '@schemas/bookingFormFields/update.schema.js';
import type { Context } from 'hono';

const factory = createFactory().createHandlers;

const sortFieldsForUpsert = (fields: SyncBookingFormFieldItem[]) =>
    [...fields].sort((a, b) => {
        if (a.parentId === null && b.parentId !== null) return -1;
        if (a.parentId !== null && b.parentId === null) return 1;
        return 0;
    });

const resolveParentField = (
    parentId: string,
    fields: SyncBookingFormFieldItem[],
    existingById: Map<string, { id: string; type: string }>,
) => {
    const parentInPayload = fields.find((field) => field.id === parentId);
    if (parentInPayload) {
        return parentInPayload;
    }

    return existingById.get(parentId);
};

export const updateBookingFormFieldsHandler = factory(
    zValidator('json', updateBookingFormFieldsSchema),
    async (c) => {
        try {
            const { bookingFormId, fields } = c.req.valid('json');

            const bookingForm = await db.query.bookingForms.findFirst({
                where: (forms, { eq }) => eq(forms.id, bookingFormId),
                columns: { id: true },
            });

            if (!bookingForm) {
                return c.json(prepareError('Booking form not found'), 404);
            }

            const existingFields = await db.query.bookingFormFields.findMany({
                where: (field, { eq }) => eq(field.bookingFormId, bookingFormId),
            });
            const existingById = new Map(existingFields.map((field) => [field.id, field]));

            const incomingIds = fields.flatMap((field) => (field.id ? [field.id] : []));

            // check does fields related to the current booking form
            if (incomingIds.length > 0) {
                const fieldsWithIncomingIds = await db.query.bookingFormFields.findMany({
                    where: (field, { inArray }) => inArray(field.id, incomingIds),
                });

                for (const field of fieldsWithIncomingIds) {
                    if (field.bookingFormId !== bookingFormId) {
                        return c.json(
                            prepareError('Field belongs to a different booking form'),
                            400,
                        );
                    }
                }
            }

            for (const field of fields) {
                if (field.type === 'group' || field.parentId === null) {
                    continue;
                }

                const parentField = resolveParentField(field.parentId, fields, existingById);

                if (!parentField) {
                    return c.json(prepareError('Parent field not found'), 404);
                }

                if (parentField.type !== 'group') {
                    return c.json(prepareError('Parent field must be of type group'), 400);
                }
            }

            const incomingIdSet = new Set(incomingIds);
            const fieldIdsToDelete = existingFields
                .filter((field) => !incomingIdSet.has(field.id))
                .map((field) => field.id);

            await db.transaction(async (tx) => {
                if (fieldIdsToDelete.length > 0) {
                    await tx
                        .delete(bookingFormFields)
                        .where(inArray(bookingFormFields.id, fieldIdsToDelete));
                }

                for (const field of sortFieldsForUpsert(fields)) {
                    const parentId = field.type === 'group' ? null : field.parentId;
                    const fieldValues = {
                        bookingFormId,
                        id: field.id,
                        name: field.name,
                        type: field.type,
                        required: field.type === 'group' ? false : field.required,
                        key: field.key,
                        order: field.order,
                        parentId,
                        params: field.params,
                    };

                    const existingField = field.id ? existingById.get(field.id) : undefined;

                    if (existingField) {
                        const [updatedField] = await tx
                            .update(bookingFormFields)
                            .set(fieldValues)
                            .where(eq(bookingFormFields.id, field.id!))
                            .returning();

                        if (!updatedField) {
                            throw new Error(
                                `Failed to update booking form field with name ${field.name}`,
                            );
                        }

                        continue;
                    }

                    const [createdField] = await tx
                        .insert(bookingFormFields)
                        .values(fieldValues)
                        .returning();

                    if (!createdField) {
                        throw new Error('Failed to create booking form field');
                    }
                }
            });

            const syncedFields = await db.query.bookingFormFields.findMany({
                where: (field, { eq, and, isNull }) =>
                    and(eq(field.bookingFormId, bookingFormId), isNull(field.parentId)),
                with: {
                    childFields: true,
                },
                orderBy: (field, { asc }) => [asc(field.order)],
            });

            return c.json(prepareSuccess(syncedFields));
        } catch (error) {
            return c.json(prepareError('Failed to update booking form fields'), 500);
        }
    },
);
