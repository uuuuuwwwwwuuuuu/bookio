import { z } from 'zod';

const fieldOptionSchema = z.object({
    value: z.string().min(1),
    label: z.string().min(1),
});

const inputParamsSchema = z
    .object({
        placeholder: z.string().optional(),
        helpText: z.string().optional(),
    })
    .default({});

const choiceParamsSchema = z.object({
    options: z.array(fieldOptionSchema).min(1, 'At least one option is required'),
    placeholder: z.string().optional(),
});

const groupParamsSchema = z
    .object({
        description: z.string().optional(),
    })
    .default({});

const checkboxParamsSchema = z
    .object({
        helpText: z.string().optional(),
    })
    .default({});

const fileParamsSchema = z
    .object({
        accept: z.array(z.string()).optional(),
        maxSizeMb: z.number().positive().optional(),
    })
    .default({});

const baseCreateField = {
    bookingFormId: z.uuid(),
    name: z.string().min(1).max(255),
    key: z
        .string()
        .min(1)
        .max(255)
        .regex(/^\S+$/, 'Key must not contain spaces'),
};

const leafParentId = z.uuid().nullable().optional();

const createInputFieldSchema = <T extends string>(type: T) =>
    z.object({
        ...baseCreateField,
        type: z.literal(type),
        required: z.boolean().default(false),
        parentId: leafParentId,
        params: inputParamsSchema,
    });

export const createBookingFormFieldSchema = z.discriminatedUnion('type', [
    createInputFieldSchema('text'),
    createInputFieldSchema('email'),
    createInputFieldSchema('phone'),
    createInputFieldSchema('url'),
    createInputFieldSchema('number'),
    createInputFieldSchema('date'),
    createInputFieldSchema('time'),
    createInputFieldSchema('textarea'),
    z.object({
        ...baseCreateField,
        type: z.literal('select'),
        required: z.boolean().default(false),
        parentId: leafParentId,
        params: choiceParamsSchema,
    }),
    z.object({
        ...baseCreateField,
        type: z.literal('radio'),
        required: z.boolean().default(false),
        parentId: leafParentId,
        params: choiceParamsSchema,
    }),
    z.object({
        ...baseCreateField,
        type: z.literal('checkbox'),
        required: z.boolean().default(false),
        parentId: leafParentId,
        params: checkboxParamsSchema,
    }),
    z.object({
        ...baseCreateField,
        type: z.literal('file'),
        required: z.boolean().default(false),
        parentId: leafParentId,
        params: fileParamsSchema,
    }),
    z.object({
        ...baseCreateField,
        type: z.literal('image'),
        required: z.boolean().default(false),
        parentId: leafParentId,
        params: fileParamsSchema,
    }),
    z.object({
        ...baseCreateField,
        type: z.literal('group'),
        required: z.literal(false).default(false),
        parentId: z.null().optional(),
        params: groupParamsSchema,
    }),
]);

export type CreateBookingFormFieldInput = z.infer<typeof createBookingFormFieldSchema>;
