import { useEffect, useState, type FC } from 'react';
import { Input, type InputProps } from '@bookio/ui';
import styles from './ValidatableInput.module.scss';

export type ValidatableInputProps = InputProps & {
    isValid?: boolean | null;
};

export const ValidatableInput: FC<ValidatableInputProps> = ({
    isValid,
    className,
    ...inputProps
}) => {
    const [isShaking, setIsShaking] = useState(false);

    useEffect(() => {
        if (isValid === false) {
            setIsShaking(false);
            requestAnimationFrame(() => setIsShaking(true));
            return;
        }

        setIsShaking(false);
    }, [isValid]);

    useEffect(() => {
        if (!isShaking) return;

        const timer = setTimeout(() => setIsShaking(false), 500);
        return () => clearTimeout(timer);
    }, [isShaking]);

    const validationClass =
        isValid === true ? styles.valid : isValid === false ? styles.invalid : undefined;

    const classes = [validationClass, isShaking && styles.shake, className].filter(Boolean).join(' ');

    return <Input {...inputProps} className={classes || undefined} />;
};
