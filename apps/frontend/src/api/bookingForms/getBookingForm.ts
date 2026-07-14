import hono from '@lib/hono-client';
import { validateError } from '@utils/validateError';
import type { InferResponseType } from 'hono/client';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSession } from '@api/auth';

const getBookingFormClient = hono['booking-forms']['get-one'];

export type GetBookingFormResponse = InferResponseType<typeof getBookingFormClient.$get, 200>;
export type BookingFormType = GetBookingFormResponse['data'];

export const fetchBookingForm = async (bookingFormId: string): Promise<BookingFormType> => {
    const response = await getBookingFormClient.$get({
        query: {
            bookingFormId,
        },
    });

    const body = await response.json();

    validateError(response, body, 'Failed to get booking form');

    return body.data;
};

export const useGetBookingForm = (
    bookingFormId: string | undefined,
): UseQueryResult<BookingFormType> => {
    const { data: session } = useSession();
    return useQuery<BookingFormType>({
        queryKey: ['booking-form', bookingFormId],
        queryFn: () => fetchBookingForm(bookingFormId!),
        enabled: !!session?.user.id,
    });
};
