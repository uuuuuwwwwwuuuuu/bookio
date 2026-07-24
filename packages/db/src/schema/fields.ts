import {
    boolean,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    uniqueIndex,
    uuid,
    type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { v7 as uuidv7 } from 'uuid';
import { relations } from 'drizzle-orm';
import { bookingForms } from './booking-forms.js';
import type { FieldParams } from './field-params.js';

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

/**
 * Booking form fields (flat table with optional nesting via parentId).
 *
 * Business rules:
 * 1. `parentId` — only non-group fields may have a parent; parent must be `type = 'group'`.
 * 2. Nesting depth — one level only (group → children). Groups cannot nest inside groups.
 * 3. `key` — unique per `bookingFormId` (enforced by unique index).
 * 4. `group` — UI container only; not written to `bookings.data`.
 * 5. `params` — defaults to `{}`; select/radio must receive `options` via API on create.
 * 6. `name` — field label or group title; group subtitle lives in `params.description?`.
 */
export const bookingFormFields = pgTable(
    'booking_form_fields',
    {
        id: uuid('id')
            .primaryKey()
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
        params: jsonb('params').$type<FieldParams>().notNull().default({}),
    },
    (table) => [
        uniqueIndex('booking_form_fields_booking_form_id_key_unique').on(
            table.bookingFormId,
            table.key,
        ),
        index('booking_form_fields_form_parent_order_idx').on(
            table.bookingFormId,
            table.parentId,
            table.order,
        ),
    ],
);

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

export type BookingFormFieldSelect = typeof bookingFormFields.$inferSelect;
export type BookingFormFieldInsert = typeof bookingFormFields.$inferInsert;

export type BookingFormFieldCreate = Omit<BookingFormFieldInsert, 'id' | 'order'>;
export type BookingFormFieldUpdate = Partial<Omit<BookingFormFieldInsert, 'id'>>;

export * from './field-params.js';
