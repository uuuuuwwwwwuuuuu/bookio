import type { FieldType } from './fields.js';

/** Input-like: single value stored in bookings.data[key] */
export type InputFieldType =
    | 'text'
    | 'email'
    | 'phone'
    | 'url'
    | 'number'
    | 'date'
    | 'time'
    | 'textarea';

/** Choice: value from a fixed list */
export type ChoiceFieldType = 'select' | 'radio';

/** File-like uploads */
export type FileFieldType = 'file' | 'image';

/** Container — UI only, not written to bookings.data */
export type ContainerFieldType = 'group';

/** Boolean */
export type BooleanFieldType = 'checkbox';

export type LeafFieldType =
    | InputFieldType
    | ChoiceFieldType
    | FileFieldType
    | BooleanFieldType;

export type NonGroupFieldType = LeafFieldType;

export type InputFieldParams = {
    placeholder?: string;
    helpText?: string;
};

export type FieldOption = {
    value: string;
    label: string;
};

export type ChoiceFieldParams = {
    options: FieldOption[];
    placeholder?: string;
};

export type GroupFieldParams = {
    description?: string;
};

export type CheckboxFieldParams = {
    helpText?: string;
};

export type FileFieldParams = {
    accept?: string[];
    maxSizeMb?: number;
};

export type FieldParamsByType<T extends FieldType> = T extends InputFieldType
    ? InputFieldParams
    : T extends ChoiceFieldType
      ? ChoiceFieldParams
      : T extends 'group'
        ? GroupFieldParams
        : T extends BooleanFieldType
          ? CheckboxFieldParams
          : T extends FileFieldType
            ? FileFieldParams
            : never;

/** Union of all possible params shapes (used for Drizzle jsonb.$type) */
export type FieldParams = FieldParamsByType<FieldType>;

export type BookingFormFieldRowBase = {
    id: string;
    bookingFormId: string;
    key: string;
    name: string;
    order: number;
    parentId: string | null;
};

export type BookingFormFieldRow<T extends FieldType = FieldType> = BookingFormFieldRowBase & {
    type: T;
    params: FieldParamsByType<T>;
} & (T extends 'group' ? { required: false } : { required: boolean });

export type BookingFormFieldRowUnion =
    | BookingFormFieldRow<'text'>
    | BookingFormFieldRow<'number'>
    | BookingFormFieldRow<'file'>
    | BookingFormFieldRow<'image'>
    | BookingFormFieldRow<'url'>
    | BookingFormFieldRow<'phone'>
    | BookingFormFieldRow<'date'>
    | BookingFormFieldRow<'time'>
    | BookingFormFieldRow<'email'>
    | BookingFormFieldRow<'checkbox'>
    | BookingFormFieldRow<'select'>
    | BookingFormFieldRow<'radio'>
    | BookingFormFieldRow<'textarea'>
    | BookingFormFieldRow<'group'>;

/** Nested shape returned by queries that load root fields with childFields */
export type BookingFormFieldWithChildren =
    | (BookingFormFieldRow<'group'> & { childFields: BookingFormFieldRowUnion[] })
    | BookingFormFieldRow<NonGroupFieldType>;

/** Flat field item in PUT /fields/sync payload (`bookingFormId` is on the request root). */
export type BookingFormFieldSyncItem = {
    [T in FieldType]: Omit<BookingFormFieldRow<T>, 'id' | 'bookingFormId'> & { id?: string };
}[FieldType];

export type BookingFormFieldsSyncPayload = {
    bookingFormId: string;
    fields: BookingFormFieldSyncItem[];
};

export function isGroupField(
    field: Pick<BookingFormFieldRow, 'type'>,
): field is BookingFormFieldRow<'group'> {
    return field.type === 'group';
}

export function isChoiceField(
    field: Pick<BookingFormFieldRow, 'type'>,
): field is BookingFormFieldRow<ChoiceFieldType> {
    return field.type === 'select' || field.type === 'radio';
}
