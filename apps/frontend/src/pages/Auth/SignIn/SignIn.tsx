import { Input, Button } from '@bookio/ui';
import { type FC, useReducer, useCallback, type ChangeEvent, type SubmitEvent } from 'react';
import styles from './SignIn.module.scss';
import { useSignIn } from '@api/auth';
import { z } from 'zod';
import { toast } from 'react-hot-toast';

const signInSchema = z.object({
    email: z.email(),
    password: z
        .string()
        .min(6, { message: 'Password must be at least 8 characters long' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' })
        .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, {
            message: 'Password must contain at least one special character',
        })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' })
        .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, {
            message: 'Password must contain at least one special character',
        }),
});

type SignInData = z.infer<typeof signInSchema>;

export const SignIn: FC = () => {
    const [data, setData] = useReducer(
        (prev: SignInData, next: Partial<SignInData>) => {
            return {
                ...prev,
                ...next,
            };
        },
        {
            email: '',
            password: '',
        },
    );

    const { mutate, isPending } = useSignIn();

    const handleChangeInput = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setData({
                [e.target.name]: e.target.value,
            });
        },
        [setData],
    );

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault();

        try {
            const zodRes = signInSchema.parse(data);

            mutate(zodRes, {
                onSuccess: () => {
                    toast.success('Sign in successful');
                },
                onError: (error) => {
                    toast.error(error.message);
                },
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorsArr = JSON.parse(error.message);
                toast.error(errorsArr[0].message);
            }
        }
    };

    return (
        <form className={styles.signInForm} onSubmit={handleSubmit}>
            <h1>Sign in</h1>
            <Input
                type="email"
                name="email"
                placeholder="Email"
                autoComplete="email"
                value={data.email}
                onChange={handleChangeInput}
                disabled={isPending}
            />
            <Input
                type="password"
                name="password"
                placeholder="Password"
                autoComplete="new-password"
                value={data.password}
                onChange={handleChangeInput}
                disabled={isPending}
            />
            <Button
                type="submit"
                variant="primary-filled"
                className={styles.submitButton}
                disabled={isPending}
            >
                {isPending ? 'Signing in…' : 'Sign in'}
            </Button>
            <Button type="link" to="/auth/sign-up" variant="simple-outlined">
                Sign Up
            </Button>
        </form>
    );
};
