import type { CSSProperties, FC } from 'react';
import type { EntireBookingFormField } from '@api/bookingForms/getEntireBookingFormById';
import { Button } from '@bookio/ui';

import GripVerticalIcon from '@assets/icons/grip-vertical.svg?react';
import EditIcon from '@assets/icons/pen.svg?react';
import TrashIcon from '@assets/icons/trash.svg?react';

import { fieldTypeIcons } from './fieldTypeIcons';
import styles from './ConfiguratorField.module.scss';

interface ConfiguratorFieldProps {
    name: string;
    type: EntireBookingFormField['type'];
    fieldKey: string;
    required?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const ConfiguratorField: FC<ConfiguratorFieldProps> = ({
    name,
    type,
    fieldKey,
    required,
    onEdit,
    onDelete,
}) => {
    const { icon: TypeIcon, color } = fieldTypeIcons[type];

    return (
        <div className={styles.configuratorField}>
            <div className={styles.dragHandle} aria-hidden="true">
                <GripVerticalIcon />
            </div>
            <div className={styles.content}>
                <div
                    className={styles.typeBadge}
                    style={{ '--type-badge-color': color } as CSSProperties}
                >
                    <TypeIcon />
                </div>
                <div className={styles.info}>
                    <div className={styles.nameRow}>
                        <span className={styles.name}>{name}</span>
                        {required ? <span className={styles.requiredDot} aria-label="Required" /> : null}
                    </div>
                    <span className={styles.fieldKey}>{fieldKey}</span>
                </div>
                <div className={styles.actions}>
                    <Button
                        type="button"
                        variant="blue-clean"
                        className={styles.editButton}
                        onClick={onEdit}
                        aria-label={`Edit ${name}`}
                    >
                        <EditIcon />
                    </Button>
                    <Button
                        type="button"
                        variant="red-clean"
                        className={styles.deleteButton}
                        onClick={onDelete}
                        aria-label={`Delete ${name}`}
                    >
                        <TrashIcon />
                    </Button>
                </div>
            </div>
        </div>
    );
};
