import { type FC, type ChangeEvent, type SubmitEvent, useReducer, useCallback } from 'react';
import styles from './ConnectOrganization.module.scss';
import { Button, Input } from '@bookio/ui';
import {
    useConnectToOrganization,
    type ConnectToOrganizationRequest,
} from '@api/organizations/connectToOrganization';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
    slug: z.string().min(1).max(255),
    password: z.string().min(6).max(255),
}) satisfies z.ZodType<Omit<ConnectToOrganizationRequest, 'userId'>>;

type FormData = z.infer<typeof formSchema>;

export const ConnectOrganization: FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useReducer(
        (prev: FormData, next: Partial<FormData>) => ({ ...prev, ...next }),
        { slug: '', password: '' },
    );
    const { mutateAsync, data, isPending } = useConnectToOrganization();

    const onSubmitForm = (e: SubmitEvent) => {
        e.preventDefault();

        try {
            const result = formSchema.parse(formData);

            toast.promise(mutateAsync(result), {
                loading: 'Connecting to organization...',
                success: 'Connected to organization successfully',
                error: (error: Error) => error.message,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                toast.error('Invalid form data');
            }
        }
    };

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ [name]: value });
    }, []);

    if (data?.success) {
        navigate('/organization/list', { replace: true });
    }

    return (
        <div className={styles.connectOrganization}>
            <form className={styles.form} onSubmit={onSubmitForm}>
                <h2 className={styles.title}>Lets connect to organization</h2>
                <div className={styles.formGroup}>
                    <Input
                        name="slug"
                        placeholder="Organization slug"
                        onChange={handleInputChange}
                        value={formData.slug}
                    />
                    <Input
                        name="password"
                        type="password"
                        placeholder="Organization password"
                        onChange={handleInputChange}
                        value={formData.password}
                    />
                </div>
                <Button
                    className={styles.button}
                    variant="primary-filled"
                    type="submit"
                    disabled={isPending}
                >
                    Connect to Organization
                </Button>
            </form>
        </div>
    );
};
