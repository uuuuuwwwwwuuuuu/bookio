import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@lib/auth-client';
import { unwrapAuthResponse } from './auth-api';

export const useSignOut = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => unwrapAuthResponse(authClient.signOut()),
        onSuccess: () => {
            queryClient.clear();
        },
    });
};
