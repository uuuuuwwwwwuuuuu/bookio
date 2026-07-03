import type { FC } from 'react';
import { Button, Input } from '@bookio/ui';
import styles from './SignUp.module.scss';

export const SignUp: FC = () => {
    return (
        <form className={styles.signUpForm}>
            <h1>Sign Up</h1>
            <Input type="email" name="email" placeholder="Email" autoComplete="email" />
            <Input type="password" name="password" placeholder="Password" autoComplete="new-password" />
            <Button type="submit" variant="primary-outlined" className={styles.submitButton}>
                Sign Up
            </Button>
        </form>
    );
};