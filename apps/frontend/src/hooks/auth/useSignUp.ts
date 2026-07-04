import { useMutation } from '@tanstack/react-query';
import { authClient } from '@lib/auth-client';
import { unwrapAuthResponse } from './auth-api';

type SignUpInput = { email: string; password: string };

export const useSignUp = () =>
    useMutation({
        mutationFn: ({ email, password }: SignUpInput) =>
            unwrapAuthResponse(
                authClient.signUp.email({ email, password, name: '' }),
            ),
    });
