import hono from '@lib/hono-client';
import { validateError } from '@utils/validateError';
import type { InferResponseType } from 'hono/client';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSession } from '@api/auth';

const getBookingFormWithFieldsClient = hono['booking-forms']['get-one-with-fields'];

export type GetBookingFormWithFieldsResponse = InferResponseType<
    typeof getBookingFormWithFieldsClient.$get,
    200
>;
export type BookingFormWithFieldsType = GetBookingFormWithFieldsResponse['data'];

const fetchBookingFormWithFields = async (
    bookingFormId: string,
): Promise<BookingFormWithFieldsType> => {
    const response = await getBookingFormWithFieldsClient.$get({
        query: {
            bookingFormId,
        },
    });

    const body = await response.json();

    validateError(response, body, 'Failed to get booking form with fields');

    return body.data;
};

export const useGetBookingFormWithFields = (
    bookingFormId: string | undefined,
): UseQueryResult<BookingFormWithFieldsType> => {
    const { data: session } = useSession();
    return useQuery<BookingFormWithFieldsType>({
        queryKey: ['booking-form', bookingFormId],
        queryFn: () => fetchBookingFormWithFields(bookingFormId!),
        enabled: !!session?.user.id,
    });
};
