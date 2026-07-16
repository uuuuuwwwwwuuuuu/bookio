---
name: create-api-hook
description: Create Bookio frontend API hooks matching the project style in apps/frontend/src/api (hono client, InferRequestType/InferResponseType, validateError/parseError, React Query useQuery/useMutation, trimObj, query invalidation). Use when adding, editing, or scaffolding API hooks under apps/frontend/src/api, or when the user asks to create a frontend API hook, mutation, or query for a backend endpoint.
---

# Create API Hook (Bookio Frontend)

Create hooks that **fully match** existing style in `apps/frontend/src/api`. Prefer mature patterns from `bookingForms` and `fields` over incomplete/legacy or auth-specific files.

## File layout

```
apps/frontend/src/api/<domain>/
  createBookingForm.ts
  getBookingForm.ts
  getBookingForms.ts
  updateBookingForm.ts
  deleteBookingForm.ts
  isBookingFormExists.ts   # optional special-case
```

- Domain folder: camelCase (`bookingForms`, `fields`, `organizations`, `bookingFormMeta`).
- File name: camelCase `<action><Resource>.ts` (e.g. `createBookingForm.ts`, `getBookingFormFields.ts`).
- One primary hook (and its fetch/request helper + types) per file.
- Imports use path aliases: `@lib/`, `@utils/`, `@api/` — **no** `.js` extension on frontend imports.

## Checklist

Copy and track:

```
- [ ] Client path from hono typed client (`@lib/hono-client`)
- [ ] Exported Request/Response types via InferRequestType / InferResponseType
- [ ] Domain data type from Response['data'] when useful
- [ ] request/fetch helper: $method → response.json() → validateError → return body.data
- [ ] validateError with English fallback 'Failed to …' (never call parseError in the hook)
- [ ] trimObj on create/update JSON bodies
- [ ] useMutation + queryClient.invalidateQueries OR useQuery + enabled + queryKey
- [ ] queryKey kebab-case matching resource
- [ ] Re-read a sibling hook in the same domain and match naming/spacing
```

## Hard rules

1. **Always** go through `validateError(response, body, fallbackMessage)` after `response.json()`. Never check `response.ok` manually and never throw a raw string without it.
2. **Never** import or call `parseError` inside API hooks. It is an internal detail of `validateError`.
3. **Always** return `body.data` after validation (not the whole body).
4. Types come from the hono client (`InferRequestType` / `InferResponseType`), not hand-written DTOs.
5. Mutations: `queryClient` from `@lib/query-client` (singleton). Do not use `useQueryClient()` unless matching an existing auth exception.
6. Auth (`apps/frontend/src/api/auth`) uses `authClient` / better-auth — **do not** use that pattern for REST resource hooks.

## Error handling (`validateError` + `parseError`)

Flow that every request helper must use:

```ts
const response = await someClient.$post({ json: … });
const body = await response.json();

validateError(response, body, 'Failed to …');

return body.data;
```

What `validateError` does (`apps/frontend/src/utils/validateError.ts`):

| Condition | Result |
|-----------|--------|
| `!response.ok` and body is **not** `{ success: false, … }` | `throw new Error(fallbackMessage)` |
| body is `{ success: false, error }` | `throw new Error(parseError(body))` |
| otherwise | asserts body is success and narrows type so `body.data` is safe |

What `parseError` does (`apps/frontend/src/utils/parseError.ts`) — used **only inside** `validateError`:

```ts
// string business error from prepareError → returned as-is
// ZodError from validation → prettifyError(body.error)
export const parseError = (body: ApiErrorBody): string => {
    if (typeof body.error === 'string') {
        return body.error;
    }
    return prettifyError(body.error);
};
```

UI consumes `error.message` (toasts). Correct `validateError` usage is what makes backend `prepareError(…)` messages and Zod validation messages reach the user.

### Fallback message style

English, same tone as backend catch messages:

- `'Failed to create booking form'`
- `'Failed to get booking form fields'`
- `'Failed to update booking form field'`
- `'Failed to delete booking form'`
- `'Failed to check if booking form exists'`

## Types

```ts
import type { InferRequestType, InferResponseType } from 'hono/client';

export type CreateXRequest = InferRequestType<typeof client.$post>['json'];
export type CreateXResponse = InferResponseType<typeof client.$post, 200>;

export type GetXResponse = InferResponseType<typeof client.$get, 200>;
export type XType = GetXResponse['data'];
export type XItemType = XType[number]; // for list endpoints
```

- Mutations with JSON body: take `['json']` from `InferRequestType`.
- Prefer status `200` on `InferResponseType` when siblings do (`, 200`).
- Export request/response types from the same file as the hook.

## `trimObj`

- **create / update** JSON: wrap with `trimObj(requestData)`.
- **delete** JSON and **GET** query: pass as-is (no `trimObj`), matching existing hooks.

## Query keys

Kebab-case resource names; include the id that scopes the cache:

| Resource | Examples |
|----------|----------|
| List forms | `['booking-forms', organizationId]` |
| One form | `['booking-form', bookingFormId]` |
| Fields list | `['booking-form-fields', bookingFormId]` |
| One field | `['booking-form-field', bookingFormFieldId]` |
| Orgs | `['organizations', userId]` |

On mutation `onSuccess`, invalidate the related keys (list and/or one), same as siblings.

## Skeletons

### Mutation (create / update / delete)

```ts
import hono from '@lib/hono-client';
import { queryClient } from '@lib/query-client';
import { useMutation } from '@tanstack/react-query';
import { validateError } from '@utils/validateError';
import { trimObj } from '@utils/trimObj'; // create/update only
import type { InferRequestType, InferResponseType } from 'hono/client';

const createXClient = hono['resource-path']['create'];

export type CreateXRequest = InferRequestType<typeof createXClient.$post>['json'];
export type CreateXResponse = InferResponseType<typeof createXClient.$post, 200>;

const createXRequest = async (requestData: CreateXRequest) => {
    const response = await createXClient.$post({
        json: trimObj(requestData),
    });

    const body = await response.json();

    validateError(response, body, 'Failed to create x');

    return body.data;
};

export const useCreateX = (scopeId: string | undefined) => {
    return useMutation({
        mutationFn: createXRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-key', scopeId] });
        },
    });
};
```

Method mapping: create → `$post`, update → `$put`, delete → `$delete`.

### Query (get one / get all)

```ts
import hono from '@lib/hono-client';
import { validateError } from '@utils/validateError';
import type { InferResponseType } from 'hono/client';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSession } from '@api/auth'; // when siblings gate on session

const getXClient = hono['resource-path']['get-one'];

export type GetXResponse = InferResponseType<typeof getXClient.$get, 200>;
export type XType = GetXResponse['data'];

const fetchX = async (id: string): Promise<XType> => {
    const response = await getXClient.$get({
        query: { id },
    });

    const body = await response.json();

    validateError(response, body, 'Failed to get x');

    return body.data;
};

export const useGetX = (id: string | undefined): UseQueryResult<XType> => {
    const { data: session } = useSession();
    return useQuery<XType>({
        queryKey: ['resource-key', id],
        queryFn: () => fetchX(id!),
        enabled: !!session?.user.id,
    });
};
```

`enabled` rules (match domain siblings):

- Booking forms queries: often `enabled: !!session?.user.id`.
- Fields queries: often `enabled: !!bookingFormId` (or field id).
- Always non-null assert (`id!`) only inside `queryFn` when `enabled` guarantees the value.

Prefer extracting a `*Client` const (bookingForms style). Dot access (`hono.fields.create`) is acceptable when the route segment is a valid identifier.

## Canonical examples (copy style from these)

### Create — `bookingForms/createBookingForm.ts`

```ts
import hono from '@lib/hono-client';
import { queryClient } from '@lib/query-client';
import { useMutation } from '@tanstack/react-query';
import { validateError } from '@utils/validateError';
import { trimObj } from '@utils/trimObj';
import type { InferRequestType, InferResponseType } from 'hono/client';

const createBookingFormClient = hono['booking-forms']['create'];

export type CreateBookingFormRequest = InferRequestType<
    typeof createBookingFormClient.$post
>['json'];
export type CreateBookingFormResponse = InferResponseType<
    typeof createBookingFormClient.$post,
    200
>;

const createBookingFormRequest = async (requestData: CreateBookingFormRequest) => {
    const response = await createBookingFormClient.$post({
        json: trimObj(requestData),
    });

    const body = await response.json();

    validateError(response, body, 'Failed to create booking form');

    return body.data;
};

export const useCreateBookingForm = (organizationId: string | undefined) => {
    return useMutation({
        mutationFn: createBookingFormRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-forms', organizationId] });
        },
    });
};
```

### Get list — `bookingForms/getBookingForms.ts`

```ts
const getBookingFormsClient = hono['booking-forms']['get-all'];

export type GetBookingFormsResponse = InferResponseType<typeof getBookingFormsClient.$get, 200>;
export type BookingFormsType = GetBookingFormsResponse['data'];
export type BookingFormType = BookingFormsType[number];

const fetchBookingForms = async (organizationId: string): Promise<BookingFormsType> => {
    const response = await getBookingFormsClient.$get({
        query: { organizationId },
    });

    const body = await response.json();

    validateError(response, body, 'Failed to get booking forms');

    return body.data;
};

export const useGetBookingForms = (
    organizationId: string | undefined,
): UseQueryResult<BookingFormsType> => {
    const { data: session } = useSession();
    return useQuery<BookingFormsType>({
        queryKey: ['booking-forms', organizationId],
        queryFn: () => fetchBookingForms(organizationId!),
        enabled: !!session?.user.id,
    });
};
```

### Update — `bookingForms/updateBookingForm.ts`

```ts
const updateBookingFormRequest = async (requestData: UpdateBookingFormRequest) => {
    const response = await updateBookingFormClient.$put({
        json: trimObj(requestData),
    });

    const body = await response.json();

    validateError(response, body, 'Failed to update booking form');

    return body.data;
};

export const useUpdateBookingForm = (bookingFormId: string | undefined) => {
    return useMutation({
        mutationFn: updateBookingFormRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-form', bookingFormId] });
            queryClient.invalidateQueries({ queryKey: ['booking-forms'] });
        },
    });
};
```

### Delete — `bookingForms/deleteBookingForm.ts` (no `trimObj`)

```ts
const deleteBookingFormRequest = async (requestData: DeleteBookingFormRequest) => {
    const response = await deleteBookingFormClient.$delete({
        json: requestData,
    });

    const body = await response.json();

    validateError(response, body, 'Failed to delete booking form');

    return body.data;
};
```

### Field create (dot path) — `fields/createBookingFormField.ts`

```ts
export type CreateBookingFormFieldRequest = InferRequestType<
    typeof hono.fields.create.$post
>['json'];

const createBookingFormFieldRequest = async (requestData: CreateBookingFormFieldRequest) => {
    const response = await hono.fields.create.$post({
        json: trimObj(requestData),
    });

    const body = await response.json();

    validateError(response, body, 'Failed to create booking form field');

    return body.data;
};

export const useCreateBookingFormField = () => {
    return useMutation({
        mutationFn: createBookingFormFieldRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-form-fields'] });
            queryClient.invalidateQueries({ queryKey: ['booking-form-with-fields'] });
        },
    });
};
```

### Exists check with validateError — `bookingForms/isBookingFormExists.ts`

```ts
export const isBookingFormExists = async (requestData: IsBookingFormExistsRequest) => {
    const response = await isExistsClient.$post({
        json: requestData,
    });

    const body = await response.json();

    validateError(response, body, 'Failed to check if booking form exists');

    return body.data;
};
```

(The debounced `useIsBookingFormExists` UI helper is domain-specific; only copy it when building the same kind of live uniqueness check.)

## Do not copy (non-canonical)

Avoid matching these when generating new hooks:

- `organizations/isOrganizationExists.ts` — manual `if (!response.ok) throw` without `validateError` / `parseError`.
- `api/auth/*` — better-auth client, not hono REST + `validateError`.
- Hand-rolled response types instead of `InferResponseType`.
- Calling `parseError` directly in the hook.
- Returning full `body` instead of `body.data`.
- `useQueryClient()` for resource mutations (use `@lib/query-client`).

## Workflow

1. Confirm the backend route exists on the typed `AppType` hono client (`hono['…']` / `hono.fields.…`).
2. Add `apps/frontend/src/api/<domain>/<action><Resource>.ts`.
3. Export types + request/fetch helper + `use*` hook.
4. Wire `queryKey` / `invalidateQueries` consistently with siblings.
5. Re-read one sibling file in the same folder and match import order, naming, blank lines, and fallback phrasing.
