import { db } from '@/db.js';

export const isBookingFormExists = async (name: string, organizationId: string) => {
    const bookingForm = await db.query.bookingForms.findFirst({
        where: (bookingForms, { eq, and }) =>
            and(
                eq(bookingForms.name, name),
                eq(bookingForms.organizationId, organizationId),
            ),
        columns: { id: true },
    });
    return !!bookingForm;
};
