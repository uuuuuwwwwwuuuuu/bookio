import type { FC } from "react";
import styles from './OrganizationList.module.scss';

export const OrganizationList: FC = () => {
    return (
        <div className={styles.organizationList}>
            <h1>Organization List</h1>
        </div>
    );
};