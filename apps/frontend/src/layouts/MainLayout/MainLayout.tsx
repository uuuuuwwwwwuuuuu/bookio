import type { FC } from "react";
import styles from './MainLayout.module.scss';
import { Outlet } from "react-router-dom";

export const MainLayout: FC = () => {
    return (
        <div className={styles.mainLayout}>
            <Outlet />
        </div>
    );
};