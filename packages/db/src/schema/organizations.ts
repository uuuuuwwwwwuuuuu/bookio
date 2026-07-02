import { pgTable, text, timestamp, uuid, date, boolean, varchar } from 'drizzle-orm/pg-core';
import { v7 as uuidv7 } from 'uuid';

import { users } from './auth.js';

export const organizations = pgTable('organizations', {
    id: uuid('id')
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const members = pgTable('members', {
    id: uuid('id')
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    organizationId: uuid('organization_id')
        .notNull()
        .references(() => organizations.id),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id),
    role: text('role', { enum: ['owner', 'admin', 'member'] }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;