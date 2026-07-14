import { pgTable, uuid, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { v7 as uuidv7 } from 'uuid';
import { bookingForms } from './booking-forms.js';

export const bookingStatusEnum = pgEnum('booking_status', [
    'pending',
    'confirmed',
    'cancelled_by_user',
    'cancelled_by_admin',
]);

export const bookings = pgTable('bookings', {
    id: uuid('id')
        .primaryKey()
        .$default(() => uuidv7()),
    bookingFormId: uuid('booking_form_id').references(() => bookingForms.id, {
        onDelete: 'cascade',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .notNull()
        .$onUpdateFn(() => new Date()),
    status: bookingStatusEnum('status').notNull().default('pending'),
    data: jsonb('data').notNull(),
});
