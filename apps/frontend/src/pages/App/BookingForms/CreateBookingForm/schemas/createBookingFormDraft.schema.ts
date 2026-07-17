import { z } from 'zod';

export const step1Schema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(255),
    organizationId: z.uuid(),
});

export const step2Schema = z.object({
    slug: z
        .string()
        .min(1)
        .max(60)
        .regex(/^[a-z0-9][a-z0-9-_]*$/, {
            message:
                'Slug must use only lowercase English letters, numbers, hyphens, and underscores (no spaces)',
        }),
});

const hexColorSchema = z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
    message: 'Color must be a hex value (#RGB or #RRGGBB)',
});

export const step3Schema = z.object({
    primary: hexColorSchema,
    bgMain: hexColorSchema,
    bgSecondary: hexColorSchema,
    borderColor: hexColorSchema,
    textMain: hexColorSchema,
    textSecondary: hexColorSchema,
});

export const step4Schema = z.object({
    metaTitle: z.string().min(1, 'Title is required').max(255),
    metaDescription: z.string().min(1, 'Description is required').max(255),
    additionalMeta: z.array(
        z.object({
            key: z.string().min(1, 'Meta property name is required').max(255),
            value: z.string().min(1, 'Meta property value is required').max(255),
        }),
    ),
});
