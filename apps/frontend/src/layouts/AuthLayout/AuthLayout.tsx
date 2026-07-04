import { type FC, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSession } from '@hooks/auth';
import styles from './AuthLayout.module.scss';

export const AuthLayout: FC = () => {
    const { data: session, isPending } = useSession();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isPending && session) {
            navigate('/', { replace: true });
        }
    }, [session, isPending, navigate]);

    if (isPending) {
        return null;
    }

    return (
        <div className={styles.authLayout}>
            <Outlet />
        </div>
    );
};
