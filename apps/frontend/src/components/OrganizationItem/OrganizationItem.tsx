import type { FC } from 'react';
import styles from './OrganizationItem.module.scss';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { clsx } from 'clsx';
import PlaceholderImage from '@assets/images/OrganizationPlaceholder.webp';

import type { OrganizationsResponse } from '@api/organizations/getOrganizationsByUserId';
import { Button } from '@bookio/ui';

import TrashIcon from '@assets/icons/trash.svg?react';
import ConnectIcon from '@assets/icons/connect.svg?react';

interface OrganizationItemProps {
    organizationName: OrganizationsResponse[number]['name'];
    organizationId: OrganizationsResponse[number]['id'];
    imageUrl?: string;
    createdAt: OrganizationsResponse[number]['createdAt'];
    role: OrganizationsResponse[number]['role'];
}

export const OrganizationItem: FC<OrganizationItemProps> = ({
    organizationName,
    createdAt,
    organizationId,
    imageUrl,
    role,
}) => {
    

    return (
        <div className={styles.organizationItem}>
            <img src={imageUrl || PlaceholderImage} alt={organizationName} />
            <div className={styles.organizationInfo}>
                <h3>{organizationName}</h3>
                <div className={styles.organizationAdditionalInfo}>
                    <div className={clsx(styles.role, { [styles.owner]: role === 'owner' })}>
                        {role}
                    </div>
                    <span>{format(new Date(createdAt), 'dd/MM/yyyy', { locale: ru })}</span>
                </div>
            </div>

            <div className={styles.actionButtons}>
                <Button variant="red-clean">
                    <TrashIcon />
                </Button>
            </div>
        </div>
    );
};
