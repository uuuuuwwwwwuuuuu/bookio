import { useEffect, useState, type FC } from 'react';
import { useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { BookingForms } from './BookingForms';
import { CreateBookingForm } from './CreateBookingForm/CreateBookingForm';
import styles from './BookingFormsLayout.module.scss';

const FADE_MS = 480;

export const BookingFormsLayout: FC = () => {
    const { pathname } = useLocation();
    const isCreate = pathname.endsWith('/create');
    const [holdCreate, setHoldCreate] = useState(isCreate);
    const [createVisible, setCreateVisible] = useState(false);
    const showCreate = isCreate || holdCreate;

    useEffect(() => {
        if (isCreate) {
            setHoldCreate(true);

            // Double rAF: paint opacity 0 first, then transition to visible.
            let raf2 = 0;
            const raf1 = window.requestAnimationFrame(() => {
                raf2 = window.requestAnimationFrame(() => setCreateVisible(true));
            });

            return () => {
                window.cancelAnimationFrame(raf1);
                window.cancelAnimationFrame(raf2);
            };
        }

        setCreateVisible(false);
        const timer = window.setTimeout(() => setHoldCreate(false), FADE_MS);
        return () => window.clearTimeout(timer);
    }, [isCreate]);

    return (
        <div className={styles.layout}>
            <div
                className={clsx(styles.layer, !isCreate && styles.visible)}
                inert={isCreate || undefined}
            >
                <BookingForms />
            </div>
            {showCreate ? (
                <div
                    className={clsx(styles.layer, createVisible && styles.visible)}
                    inert={!isCreate || undefined}
                >
                    <CreateBookingForm />
                </div>
            ) : null}
        </div>
    );
};
