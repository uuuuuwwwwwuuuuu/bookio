import { z } from 'zod';
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

const hasUpdatableField = (data: unknown) => {
    if (!data || typeof data !== 'object') return false;

    return Object.entries(data).some(([key, value]) => {
        if (key === 'id' || key === 'type') return false;

        return value !== undefined;
    });
};

export const updateBookingFormFieldSchema = z
    .discriminatedUnion(
        'type',
        buildBookingFormFieldVariants({
            base: {
                id: z.uuid(),
                name: fieldNameSchema.optional(),
                key: fieldKeySchema.optional(),
                order: z.number().int().min(0).optional(),
            },
            required: z.boolean().optional(),
            groupRequired: z.literal(false).optional(),
            groupParentId: z.null().optional(),
            inputParams: inputParamsSchema.optional(),
            choiceParams: choiceParamsSchema.optional(),
            checkboxParams: checkboxParamsSchema.optional(),
            fileParams: fileParamsSchema.optional(),
            groupParams: groupParamsSchema.optional(),
        }),
    )
    .refine(hasUpdatableField, {
        message: 'At least one field must be provided',
    });

export type UpdateBookingFormFieldInput = z.infer<typeof updateBookingFormFieldSchema>;
