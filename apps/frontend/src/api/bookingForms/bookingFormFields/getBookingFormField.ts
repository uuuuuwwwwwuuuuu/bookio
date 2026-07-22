import hono from '@lib/hono-client';
import { validateError } from '@utils/validateError';
import type { InferResponseType } from 'hono/client';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

const getBookingFormFieldClient = hono.fields['get-one'];

export type GetBookingFormFieldResponse = InferResponseType<
    typeof getBookingFormFieldClient.$get,
    200
>;
export type BookingFormFieldType = GetBookingFormFieldResponse['data'];

export const fetchBookingFormField = async (
    bookingFormFieldId: string,
): Promise<BookingFormFieldType> => {
    const response = await getBookingFormFieldClient.$get({
        query: {
            bookingFormFieldId,
        },
    });

    const body = await response.json();

    validateError(response, body, 'Failed to get booking form field');

    return body.data;
};

export const useGetBookingFormField = (
    bookingFormFieldId: string | undefined,
): UseQueryResult<BookingFormFieldType> => {
    return useQuery<BookingFormFieldType>({
        queryKey: ['booking-form-field', bookingFormFieldId],
        queryFn: () => fetchBookingFormField(bookingFormFieldId!),
        enabled: !!bookingFormFieldId,
    });
};
