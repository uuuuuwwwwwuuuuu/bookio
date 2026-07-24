import { z } from 'zod';
import type { BookingFormFieldSyncItem, BookingFormFieldsSyncPayload } from '@bookio/db';
import {
    buildBookingFormFieldVariants,
    checkboxParamsSchema,
    choiceParamsSchema,
    fieldKeySchema,
    fieldNameSchema,
    fileParamsSchema,
    groupParamsSchema,
    inputParamsSchema,
} from '@schemas/bookingFormFields/shared.schema.js';

export const syncBookingFormFieldItemSchema = z.discriminatedUnion(
    'type',
    buildBookingFormFieldVariants({
        base: {
            id: z.uuid(),
            name: fieldNameSchema,
            key: fieldKeySchema,
            order: z.number().int().min(0),
        },
        required: z.boolean().default(false),
        groupRequired: z.literal(false).default(false),
        groupParentId: z.null(),
        leafParentId: z.uuid().nullable(),
        inputParams: inputParamsSchema.default({}),
        choiceParams: choiceParamsSchema,
        checkboxParams: checkboxParamsSchema.default({}),
        fileParams: fileParamsSchema.default({}),
        groupParams: groupParamsSchema.default({}),
    }),
) satisfies z.ZodType<BookingFormFieldSyncItem>;

export const updateBookingFormFieldsSchema = z
    .object({
        bookingFormId: z.uuid(),
        fields: z.array(syncBookingFormFieldItemSchema),
    })
    .superRefine((data, ctx) => {
        const keys = new Set<string>();
        const ids = new Set<string>();
        const groupIds = new Set(
            data.fields.filter((field) => field.type === 'group' && field.id).map((field) => field.id!),
        );

        for (const [index, field] of data.fields.entries()) {
            if (keys.has(field.key)) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Field keys must be unique within the payload',
                    path: ['fields', index, 'key'],
                });
            } else {
                keys.add(field.key);
            }

            if (field.id) {
                if (ids.has(field.id)) {
                    ctx.addIssue({
                        code: 'custom',
                        message: 'Field ids must be unique within the payload',
                        path: ['fields', index, 'id'],
                    });
                } else {
                    ids.add(field.id);
                }
            }

            if (typeof field.parentId === 'string' && !groupIds.has(field.parentId)) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Parent field must be a group field included in the payload',
                    path: ['fields', index, 'parentId'],
                });
            }
        }
    }) satisfies z.ZodType<BookingFormFieldsSyncPayload>;

export type SyncBookingFormFieldItem = z.infer<typeof syncBookingFormFieldItemSchema>;
export type UpdateBookingFormFieldsInput = z.infer<typeof updateBookingFormFieldsSchema>;
