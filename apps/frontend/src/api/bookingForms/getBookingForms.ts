import hono from '@lib/hono-client';
import { validateError } from '@utils/validateError';
import type { InferResponseType } from 'hono/client';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSession } from '@api/auth';

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
