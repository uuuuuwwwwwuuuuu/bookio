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

export const createBookingFormFieldSchema = z.discriminatedUnion(
    'type',
    buildBookingFormFieldVariants({
        base: {
            bookingFormId: z.uuid(),
            name: fieldNameSchema,
            key: fieldKeySchema,
        },
        required: z.boolean().default(false),
        groupRequired: z.literal(false).default(false),
        groupParentId: z.null().optional(),
        inputParams: inputParamsSchema.default({}),
        choiceParams: choiceParamsSchema,
        checkboxParams: checkboxParamsSchema.default({}),
        fileParams: fileParamsSchema.default({}),
        groupParams: groupParamsSchema.default({}),
    }),
);

export type CreateBookingFormFieldInput = z.infer<typeof createBookingFormFieldSchema>;
