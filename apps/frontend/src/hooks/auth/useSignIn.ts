import { useMutation } from '@tanstack/react-query';
import { authClient } from '@lib/auth-client';
import { unwrapAuthResponse } from './auth-api';

type SignInInput = { email: string; password: string };

export const useSignIn = () =>
    useMutation({
        mutationFn: ({ email, password }: SignInInput) =>
            unwrapAuthResponse(
                authClient.signIn.email({ email, password }),
            ),
    });
