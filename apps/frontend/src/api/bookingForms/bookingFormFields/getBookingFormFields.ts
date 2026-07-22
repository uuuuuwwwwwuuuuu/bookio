import hono from '@lib/hono-client';
import { validateError } from '@utils/validateError';
import type { InferResponseType } from 'hono/client';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

const getBookingFormFieldsClient = hono.fields['get-all'];

export type GetBookingFormFieldsResponse = InferResponseType<
    typeof getBookingFormFieldsClient.$get,
    200
>;
export type BookingFormFieldsType = GetBookingFormFieldsResponse['data'];
export type BookingFormFieldItemType = BookingFormFieldsType[number];

const fetchBookingFormFields = async (
    bookingFormId: string,
): Promise<BookingFormFieldsType> => {
    const response = await getBookingFormFieldsClient.$get({
        query: {
            bookingFormId,
        },
    });

    const body = await response.json();

    validateError(response, body, 'Failed to fetch booking form fields');

    return body.data;
};

export const useGetBookingFormFields = (
    bookingFormId: string | undefined,
): UseQueryResult<BookingFormFieldsType> => {
    return useQuery<BookingFormFieldsType>({
        queryKey: ['booking-form-fields', bookingFormId],
        queryFn: () => fetchBookingFormFields(bookingFormId!),
        enabled: !!bookingFormId,
    });
};
