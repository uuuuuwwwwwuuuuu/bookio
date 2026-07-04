import { memo, type ComponentProps } from 'react';
import styles from './Input.module.scss';

type TextareaProps = {
    type: 'textarea';
    className?: string;
} & Omit<ComponentProps<'textarea'>, 'className'>;

type NativeInputProps = {
    type?: Exclude<ComponentProps<'input'>['type'], 'textarea'>;
    className?: string;
} & Omit<ComponentProps<'input'>, 'type' | 'className'>;

export type InputProps = TextareaProps | NativeInputProps;

function Input(props: TextareaProps): React.JSX.Element;
function Input(props: NativeInputProps): React.JSX.Element;
function Input(props: InputProps): React.JSX.Element {
    const classes = [styles.input, props.className].filter(Boolean).join(' ');

    if (props.type === 'textarea') {
        const { type, className, ...rest } = props as TextareaProps;
        return <textarea className={classes} {...rest} />;
    }

    const { type = 'text', className, ...rest } = props as NativeInputProps;
    return <input type={type} className={classes} {...rest} />;
}

export default memo(Input);