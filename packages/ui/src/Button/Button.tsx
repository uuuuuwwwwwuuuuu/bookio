import { memo, type ComponentProps } from 'react';
import styles from './Button.module.scss';

export type ButtonVariant =
    | 'plain'
    | 'primary-filled'
    | 'primary-outlined'
    | 'outlined'
    | 'cancel'
    | 'approve';

export type ButtonProps = {
    variant?: ButtonVariant;
    className?: string;
} & Omit<ComponentProps<'button'>, 'className'>;

const VARIANT_CLASS: Record<Exclude<ButtonVariant, 'plain'>, string> = {
    'primary-filled': styles.primaryFilled,
    'primary-outlined': styles.primaryOutlined,
    outlined: styles.outlined,
    cancel: styles.cancel,
    approve: styles.approve,
};

function Button({ variant = 'plain', className, type = 'button', ...rest }: ButtonProps) {
    const classes = [
        styles.button,
        variant !== 'plain' ? VARIANT_CLASS[variant] : undefined,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return <button type={type} className={classes} {...rest} />;
}

export default memo(Button);