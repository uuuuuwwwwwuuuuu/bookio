import type { FC } from "react";
import { Outlet } from "react-router-dom";
import styles from './OrganizationLayout.module.scss';
import { Header } from "@components/Header/Header";

export const OrganizationLayout: FC = () => {
    return (
        <div className={styles.organizationLayout}>
            <Header />
            <Outlet />
        </div>
    );
};