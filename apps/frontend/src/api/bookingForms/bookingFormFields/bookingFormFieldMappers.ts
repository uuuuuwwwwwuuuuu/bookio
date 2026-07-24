import type { EntireBookingFormField } from '../getEntireBookingFormById';
import type { UpdateBookingFormFieldRequest } from './updateBookingFormField';

/** Maps a configurator field entity to the update-field API payload. */
export const toUpdateBookingFormFieldRequest = (
    field: EntireBookingFormField,
): UpdateBookingFormFieldRequest => {
    const { bookingFormId: _bookingFormId, childFields: _childFields, ...updateData } = field;

    return updateData as UpdateBookingFormFieldRequest;
};
