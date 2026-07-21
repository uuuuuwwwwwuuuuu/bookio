import { z } from 'zod';

export const organizationSchema = z.object({
    name: z.string().min(3).max(255),
    password: z
        .string()
        .min(6)
        .max(255)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
        ),
    slug: z.string().min(3).max(255),
    userId: z.string(),
});
