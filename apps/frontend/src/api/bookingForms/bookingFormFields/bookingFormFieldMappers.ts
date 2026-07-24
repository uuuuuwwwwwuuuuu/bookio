import type { EntireBookingFormField } from '../getEntireBookingFormById';
import type { SyncBookingFormFieldRequest } from './syncBookingFormField';

type SyncBookingFormFieldItem = SyncBookingFormFieldRequest['fields'][number];

const toSyncBookingFormFieldItem = (field: EntireBookingFormField): SyncBookingFormFieldItem => {
    const { bookingFormId: _bookingFormId, childFields: _childFields, ...syncData } = field;

    return syncData as SyncBookingFormFieldItem;
};

const flattenBookingFormFields = (fields: EntireBookingFormField[]): SyncBookingFormFieldItem[] =>
    fields.flatMap((field) => {
        const items = [toSyncBookingFormFieldItem(field)];

        if (field.type === 'group' && field.childFields?.length) {
            items.push(...field.childFields.map(toSyncBookingFormFieldItem));
        }

        return items;
    });

/** Maps configurator field entities to the sync-fields API payload. */
export const toSyncBookingFormFieldsRequest = (
    bookingFormId: string,
    fields: EntireBookingFormField[],
): SyncBookingFormFieldRequest => ({
    bookingFormId,
    fields: flattenBookingFormFields(fields),
});
