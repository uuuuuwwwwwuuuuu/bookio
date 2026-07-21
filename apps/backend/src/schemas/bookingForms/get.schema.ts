import { z } from 'zod';

export const getBookingFormsSchema = z.object({
    organizationId: z.uuid(),
});

export const getBookingFormSchema = z.object({
    bookingFormId: z.uuid(),
});

export const getActiveBookingFormsByOrganizationSlugSchema = z.object({
    organizationSlug: z.string().min(1),
});

export const getBookingFormBySlugsSchema = z.object({
    organizationSlug: z.string().min(1),
    bookingFormSlug: z.string().min(1),
});
