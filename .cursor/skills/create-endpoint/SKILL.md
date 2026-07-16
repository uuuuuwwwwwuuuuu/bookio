---
name: create-endpoint
description: Create Bookio backend API endpoints matching the project handler/route style (Hono factory, zod validator, prepareSuccess/prepareError, db.query). Use when adding, editing, or scaffolding handlers under apps/backend/src/handlers or routes under apps/backend/src/routes, or when the user asks to create an endpoint, handler, or API route.
---

# Create Endpoint (Bookio Backend)

Create endpoints that **fully match** existing style in `apps/backend/src/handlers` and `apps/backend/src/routes`. Prefer mature patterns from `bookingForms` and `fields` over incomplete/legacy handlers.

## File layout

```
apps/backend/src/handlers/<domain>/
  create.handler.ts
  get.handler.ts      # may export several get* handlers
  update.handler.ts
  delete.handler.ts
  isExists.handler.ts # optional

apps/backend/src/routes/
  <domain>.routes.ts
  index.ts            # register new route group here
```

- Domain folder name: camelCase plural/resource (`bookingForms`, `fields`, `bookingFormMeta`).
- Handler file: `<action>.handler.ts`.
- Route file: `<domain>.routes.ts`.
- Imports always use `@/` alias and **`.js` extension** (even for `.ts` files).

## Checklist

Copy and track:

```
- [ ] Zod schema + zValidator ('json' for mutations, 'query' for GET)
- [ ] factory = createFactory().createHandlers
- [ ] try/catch around entire handler body
- [ ] Business errors via prepareError + status (400/401/403/404)
- [ ] Success via prepareSuccess (no raw objects)
- [ ] catch → prepareError('Failed to …'), 500
- [ ] Reads via db.query.*; writes via insert/update/delete + .returning()
- [ ] Route wired with ...handler spread
- [ ] Registered in routes/index.ts if new group
```

## Handler skeleton (required shape)

```ts
import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';

const factory = createFactory().createHandlers;

const exampleSchema = z.object({
    // fields
});

export const exampleHandler = factory(
    zValidator('json', exampleSchema), // or 'query' for GET
    async (c) => {
        try {
            const data = c.req.valid('json'); // same target as zValidator

            // business checks → early return prepareError(..., status)

            // db work

            return c.json(prepareSuccess(/* result */));
        } catch (error) {
            return c.json(prepareError('Failed to …'), 500);
        }
    },
);
```

### Hard rules

1. **Always** wrap the handler body in `try/catch`.
2. In `catch (error)` — **do not** log, rethrow, or return `error` / `String(error)`. Only a fixed message via `prepareError`.
3. **Always** respond with `prepareSuccess` / `prepareError` from `@/utils/prepareResponse.js`. Never `c.json(raw)` or `{ error: '…' }`.
4. Validation target: mutations → `'json'`; GET list/one → `'query'`.
5. Extract validated input with `c.req.valid('json' | 'query')` matching the validator.
6. Export named `*Handler` (e.g. `createBookingFormHandler`).

## Responses

Helpers (`apps/backend/src/utils/prepareResponse.ts`):

```ts
prepareError(error: string)  // → { success: false, error }
prepareSuccess<T>(data: T)   // → { success: true, data }
```

| Case | Pattern |
|------|---------|
| OK | `return c.json(prepareSuccess(result));` |
| Not found | `return c.json(prepareError('… not found'), 404);` |
| Conflict / bad input | `return c.json(prepareError('…'), 400);` |
| Auth / access | `401` / `403` with `prepareError` |
| Unexpected | `catch` → `return c.json(prepareError('Failed to …'), 500);` |

Do not pass HTTP status on success unless an existing similar handler already does (default 200 is fine).

### Error message style

- Business: short English, concrete — `'Booking form not found'`, `'Field with this key already exists'`.
- Catch: `'Failed to <verb> <resource>'` — `'Failed to create booking form'`, `'Failed to get booking form fields'`.

## Zod schemas

- Name: `<action><Resource>Schema` (e.g. `createBookingFormSchema`, `getBookingFormsSchema`).
- IDs: `z.uuid()` when the column is UUID.
- Create: align with insert type via `satisfies z.ZodType<SomeInsert>` when a type exists in `@bookio/db`.
- Update: all fields optional except id; `.refine` so at least one non-id field is set:

```ts
.refine(
    (data) =>
        Object.entries(data).some(([key, value]) => {
            if (key === 'bookingFormId') return false;
            return value !== undefined;
        }),
    { message: 'At least one field must be provided' },
)
```

## Database access

### Reads — prefer `db.query`

Use relational API (`findFirst` / `findMany`), not `db.select()`, unless joins/aggregations need the SQL builder (see org list join).

```ts
const form = await db.query.bookingForms.findFirst({
    where: (bookingForms, { eq }) => eq(bookingForms.id, bookingFormId),
});

const forms = await db.query.bookingForms.findMany({
    where: (bookingForms, { eq }) => eq(bookingForms.organizationId, organizationId),
});
```

With relations / nested where / order:

```ts
const form = await db.query.bookingForms.findFirst({
    where: (bookingForms, { eq }) => eq(bookingForms.id, bookingFormId),
    with: {
        fields: {
            where: (field, { isNull }) => isNull(field.parentId),
            with: { childFields: true },
        },
    },
});

const fields = await db.query.bookingFormFields.findMany({
    where: (field, { eq, and, isNull }) =>
        and(eq(field.bookingFormId, bookingFormId), isNull(field.parentId)),
    with: { childFields: true },
    orderBy: (field, { asc }) => [asc(field.order)],
});
```

Existence helpers may use `columns: { id: true }` and return `!!row`.

### Writes — SQL builder + `.returning()`

```ts
const [created] = await db.insert(table).values({ ... }).returning();
const [updated] = await db.update(table).set({ ... }).where(eq(table.id, id)).returning();
const [deleted] = await db.delete(table).where(eq(table.id, id)).returning();
```

After write, if the row is required:

```ts
if (!created) {
    return c.json(prepareError('Failed to create …'), 500);
}
```

For update/delete flows that look up first: `findFirst` → `404` if missing → mutate → check returning → `prepareSuccess`.

Import tables/types from `@bookio/db`. Import `eq` / `and` / etc. from `drizzle-orm` only when using the SQL builder.

## Routes

### Resource route file

```ts
import { Hono } from 'hono';
import { createBookingFormHandler } from '@/handlers/bookingForms/create.handler.js';
import {
    getBookingFormsHandler,
    getBookingFormHandler,
} from '@/handlers/bookingForms/get.handler.js';

const bookings = new Hono()
    .post('/create', ...createBookingFormHandler)
    .put('/update', ...updateBookingFormHandler)
    .delete('/delete', ...deleteBookingFormHandler)
    .post('/is-exists', ...isBookingFormExistsHandler)
    .get('/get-all', ...getBookingFormsHandler)
    .get('/get-one', ...getBookingFormHandler);

export default bookings;
```

### Path & method conventions

| Action | Method | Path |
|--------|--------|------|
| Create | POST | `/create` |
| Update | PUT | `/update` |
| Delete | DELETE | `/delete` |
| List | GET | `/get-all` |
| One | GET | `/get-one` |
| Exists check | POST | `/is-exists` |

Always spread: `...someHandler` (factory returns a middleware array).

### Register in `routes/index.ts`

```ts
import metaData from './bookingFormMeta.routes.js';

const routes = new Hono()
    .route('/booking-form-meta', metaData);
```

URL segments: kebab-case (`/booking-forms`, `/booking-form-meta`).

## Canonical examples (copy style from these)

### Create — `bookingForms/create.handler.ts`

```ts
export const createBookingFormHandler = factory(
    zValidator('json', createBookingFormSchema),
    async (c) => {
        try {
            const { name, description, organizationId, slug } = c.req.valid('json');

            const existingByName = await isBookingFormExists({ name, organizationId });

            if (existingByName) {
                return c.json(prepareError('Booking form with this name already exists'), 400);
            }

            const bookingForm = await db
                .insert(bookingForms)
                .values({ slug, name, description, organizationId })
                .returning();

            return c.json(prepareSuccess(bookingForm));
        } catch (error) {
            return c.json(prepareError('Failed to create booking form'), 500);
        }
    },
);
```

### Get (query + db.query) — `bookingForms/get.handler.ts`

```ts
export const getBookingFormHandler = factory(
    zValidator('query', getBookingFormSchema),
    async (c) => {
        try {
            const { bookingFormId } = c.req.valid('query');

            const form = await db.query.bookingForms.findFirst({
                where: (bookingForms, { eq }) => eq(bookingForms.id, bookingFormId),
            });

            return c.json(prepareSuccess(form));
        } catch (error) {
            return c.json(prepareError('Failed to get booking form'), 500);
        }
    },
);
```

### Update — `bookingForms/update.handler.ts`

```ts
const existingBookingForm = await db.query.bookingForms.findFirst({
    where: (bookingForms, { eq }) => eq(bookingForms.id, bookingFormId),
});

if (!existingBookingForm) {
    return c.json(prepareError('Booking form not found'), 404);
}

const [updatedBookingForm] = await db
    .update(bookingForms)
    .set({ name, description, isActive, slug })
    .where(eq(bookingForms.id, bookingFormId))
    .returning();

if (!updatedBookingForm) {
    return c.json(prepareError('Failed to update booking form'), 500);
}

return c.json(prepareSuccess(updatedBookingForm));
```

### Delete — `bookingForms/delete.handler.ts`

```ts
const bookingForm = await db.query.bookingForms.findFirst({
    where: (bookingForm, { eq, and }) =>
        and(eq(bookingForm.id, bookingFormId), eq(bookingForm.name, name)),
});

if (!bookingForm) {
    return c.json(prepareError('Booking form not found'), 404);
}

const [deletedBookingForm] = await db
    .delete(bookingForms)
    .where(eq(bookingForms.id, bookingFormId))
    .returning();

if (!deletedBookingForm) {
    return c.json(prepareError('Failed to delete booking form'), 500);
}

return c.json(prepareSuccess(deletedBookingForm));
```

### Get with 404 when missing — `fields/get.handler.ts`

```ts
const field = await db.query.bookingFormFields.findFirst({
    where: (field, { eq }) => eq(field.id, fieldId),
    with: { childFields: true },
});

if (!field) {
    return c.json(prepareError('Field not found'), 404);
}

return c.json(prepareSuccess(field));
```

## Do not copy (non-canonical)

Avoid matching these when generating new endpoints:

- Handlers without `try/catch` (some `organization/*`).
- Raw `c.json(bookingFormMeta)` or `{ error: '…' }` without `prepareSuccess`/`prepareError` (`bookingFormMeta/create.handler.ts`).
- Empty stub files.
- Returning the caught `error` object to the client.

## Workflow

1. If schema/types needed — use / add from `@bookio/db`.
2. Add or extend handler file under `handlers/<domain>/`.
3. Wire path in `routes/<domain>.routes.ts` with `...handler`.
4. If new resource group — create routes file and `.route(...)` in `routes/index.ts`.
5. Re-read a sibling handler in the same domain and match naming, spacing, and response phrases.
