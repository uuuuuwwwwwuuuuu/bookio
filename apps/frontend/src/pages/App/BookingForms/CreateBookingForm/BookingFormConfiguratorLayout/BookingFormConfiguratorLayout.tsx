import type { FC, ReactNode } from 'react';
import panelStyles from '@components/PanelFormLayout/PanelFormLayout.module.scss';

type BookingFormConfiguratorLayoutProps = {
    children: ReactNode;
    footer?: ReactNode;
};

/** Stage content for a wizard step. Panel chrome lives in CreateBookingForm. */
export const BookingFormConfiguratorLayout: FC<BookingFormConfiguratorLayoutProps> = ({
    children,
    footer,
}) => {
    return (
        <>
            <div className={panelStyles.fields}>{children}</div>
            {footer ? <div className={panelStyles.footer}>{footer}</div> : null}
        </>
    );
};
