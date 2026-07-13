import {
    boolean,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
    type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { v7 as uuidv7 } from 'uuid';

import { organizations } from './organizations.js';
import { relations } from 'drizzle-orm';

export const fieldTypeValues = [
    'text',
    'number',
    'file',
    'image',
    'url',
    'phone',
    'date',
    'time',
    'email',
    'checkbox',
    'select',
    'radio',
    'textarea',
    'group',
] as const;

export type FieldType = (typeof fieldTypeValues)[number];

export const fieldTypeEnum = pgEnum('field_type', [...fieldTypeValues]);

export const bookingStatusEnum = pgEnum('booking_status', [
    'pending',
    'confirmed',
    'cancelled_by_user',
    'cancelled_by_admin',
]);

export const bookingForms = pgTable('booking_forms', {
    id: uuid('id')
        .primaryKey()
        .$default(() => uuidv7()),
    organizationId: uuid('organization_id')
        .references(() => organizations.id, {
            onDelete: 'cascade',
        })
        .notNull(),
    isActive: boolean('is_active').notNull().default(true),
    name: text('name').notNull(),
    totalBookings: integer('total_bookings').notNull().default(0),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .notNull()
        .$onUpdateFn(() => new Date()),
});

export const bookingFormFields = pgTable('booking_form_fields', {
    id: uuid('id')
        .primaryKey()
        .$default(() => uuidv7())
        .notNull()
        .unique(),
    bookingFormId: uuid('booking_form_id')
        .references(() => bookingForms.id, {
            onDelete: 'cascade',
        })
        .notNull(),
    name: text('name').notNull(),
    type: fieldTypeEnum('type').notNull(),
    key: text('key').notNull(),
    required: boolean('required').notNull().default(false),
    parentId: uuid('parent_id').references((): AnyPgColumn => bookingFormFields.id, {
        onDelete: 'cascade',
    }),
    order: integer('order').notNull().default(0),
});

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

export const bookingFormsRelations = relations(bookingForms, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [bookingForms.organizationId],
        references: [organizations.id],
    }),
    fields: many(bookingFormFields),
    bookings: many(bookings),
}));

export const formFieldsRelations = relations(bookingFormFields, ({ one, many }) => ({
    bookingForm: one(bookingForms, {
        fields: [bookingFormFields.bookingFormId],
        references: [bookingForms.id],
    }),
    parentField: one(bookingFormFields, {
        fields: [bookingFormFields.parentId],
        references: [bookingFormFields.id],
        relationName: 'nested_fields',
    }),
    childFields: many(bookingFormFields, {
        relationName: 'nested_fields',
    }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
    bookingForm: one(bookingForms, {
        fields: [bookings.bookingFormId],
        references: [bookingForms.id],
    }),
}));

export type BookingFormSelect = typeof bookingForms.$inferSelect;
export type BookingFormFieldSelect = typeof bookingFormFields.$inferSelect;
export type BookingSelect = typeof bookings.$inferSelect;

export type BookingFormInsert = typeof bookingForms.$inferInsert;
export type BookingFormFieldInsert = typeof bookingFormFields.$inferInsert;
export type BookingInsert = typeof bookings.$inferInsert;

export type BookingFormFieldCreate = Omit<BookingFormFieldInsert, 'id' | 'order'>;
export type BookingFormFieldUpdate = Partial<Omit<BookingFormFieldInsert, 'id'>>;
export type BookingFormUpdate = Partial<Omit<BookingFormInsert, 'id'>>;
