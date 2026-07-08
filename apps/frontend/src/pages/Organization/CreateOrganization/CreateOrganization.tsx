import { useReducer, type FC, type SubmitEvent, type ChangeEvent, useCallback } from 'react';
import styles from './CreateOrganization.module.scss';
import { Button, Input, HiddenField } from '@bookio/ui';
import { ValidatableInput } from '@components/ValidatableInput/ValidatableInput';
import {
    useCreateOrganization,
    type CreateOrganizationResponse,
} from '@api/organizations/createOrganization';
import { useSession } from '@api/auth';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { type CreateOrganizationRequest } from '@api/organizations/createOrganization';
import { useIsOrganizationExists } from '@api/organizations/isOrganizationExists';

const formSchema = z.object({
    name: z.string().min(3).max(255),
    slug: z.string().min(1).max(255),
    password: z
        .string()
        .min(6)
        .max(255)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        }),
}) satisfies z.ZodType<Omit<CreateOrganizationRequest, 'userId'>>;

type FormData = z.infer<typeof formSchema>;

export const CreateOrganization: FC = () => {
    const { data: session } = useSession();
    const { data: organization, mutate, isPending, isSuccess } = useCreateOrganization();
    const [formData, setFormData] = useReducer(
        (prev: FormData, next: Partial<FormData>) => ({ ...prev, ...next }),
        { name: '', slug: '', password: '' },
    );
    const { exists: slugExists } = useIsOrganizationExists(formData.slug);
    const slugIsValid = slugExists === undefined ? undefined : !slugExists;

    const onSubmitForm = (e: SubmitEvent) => {
        e.preventDefault();

        try {
            const result = formSchema.parse(formData);

            if (slugExists === true) {
                toast.error('Organization slug is already taken');
                return;
            }

            mutate({ ...result, userId: session!.user.id });
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

    if (isSuccess && organization.success) {
        return <SuccessfulOrganizationCreation data={organization.data} />;
    }

    return (
        <div className={styles.createOrganization}>
            <form className={styles.form} onSubmit={onSubmitForm}>
                <h2 className={styles.title}>Lets create your organization</h2>
                <div className={styles.formGroup}>
                    <Input
                        name="name"
                        placeholder="Organization name"
                        onChange={handleInputChange}
                        value={formData.name}
                    />
                    <ValidatableInput
                        name="slug"
                        placeholder="Unique organization slug"
                        onChange={handleInputChange}
                        value={formData.slug}
                        isValid={slugIsValid}
                    />
                    <Input
                        name="password"
                        type="password"
                        placeholder="Organization password"
                        autoComplete="new-password"
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
                    Create Organization
                </Button>
            </form>
        </div>
    );
};

const SuccessfulOrganizationCreation: FC<{ data: CreateOrganizationResponse['data'] }> = ({
    data,
}) => {
    const handleCopy = useCallback(() => {
        toast.success('Secret key copied to clipboard');
    }, []);

    return (
        <div className={styles.createOrganization}>
            <div className={styles.content}>
                <h2 className={styles.title}>
                    Organization {data.organization.name} created successfully
                </h2>
                <p className={styles.description}>
                    Your organization has been created successfully. Bellow, in the hidden field,
                    you can find the organization secret key. Copy and keep it in a safe place.
                </p>
                <HiddenField value={data.organization.secretKey} onCopy={handleCopy} />
                <Button
                    type="link"
                    to="/organization/list"
                    className={styles.button}
                    variant="primary-filled"
                >
                    Go to organizations
                </Button>
            </div>
        </div>
    );
};
