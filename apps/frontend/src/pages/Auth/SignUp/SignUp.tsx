import { type FC, type ChangeEvent, type SubmitEvent, useReducer, useCallback } from 'react';
import { Button, Input } from '@bookio/ui';
import styles from './SignUp.module.scss';
import { useSignUp } from '@api/auth';
import { z } from 'zod';
import { toast } from 'react-hot-toast';

const passwordSchema = z
    .string()
    .min(6, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, {
        message: 'Password must contain at least one special character',
    });

const signUpSchema = z
    .object({
        email: z.email(),
        password: passwordSchema,
        confirmPassword: passwordSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type SignUpData = z.infer<typeof signUpSchema>;

export const SignUp: FC = () => {
    const [data, setData] = useReducer(
        (prev: SignUpData, next: Partial<SignUpData>) => {
            return {
                ...prev,
                ...next,
            };
        },
        {
            email: '',
            password: '',
            confirmPassword: '',
        },
    );

    const { mutateAsync, isPending } = useSignUp();

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
            const zodRes = signUpSchema.parse(data);

            toast.promise(mutateAsync(zodRes), {
                loading: 'Signing up...',
                success: 'Signed up successfully',
                error: (error: Error) => error.message
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorsArr = JSON.parse(error.message);
                toast.error(errorsArr[0].message);
            }
        }
    };

    return (
        <form className={styles.signUpForm} onSubmit={handleSubmit}>
            <h1>Sign up</h1>
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
            <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                autoComplete="new-password"
                value={data.confirmPassword}
                onChange={handleChangeInput}
                disabled={isPending}
            />
            <Button
                type="submit"
                variant="primary-filled"
                className={styles.submitButton}
                disabled={isPending}
            >
                {isPending ? 'Signing up…' : 'Sign Up'}
            </Button>
            <Button type="link" to="/auth/sign-in" variant="simple-outlined">
                Sign in
            </Button>
        </form>
    );
};
