import { useEffect, useRef, useState, type CSSProperties, type FC, type ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './PanelFormLayout.module.scss';

type PanelFormLayoutProps = {
    badge?: string;
    title: string;
    description: string;
    children: ReactNode;
    footer?: ReactNode;
    animate?: boolean;
    contentKey?: string;
};

type PanelContent = {
    key: string | undefined;
    badge?: string;
    title: string;
    description: string;
    children: ReactNode;
    footer?: ReactNode;
};

const EXIT_MS = 350;

export const PanelFormLayout: FC<PanelFormLayoutProps> = ({
    badge,
    title,
    description,
    children,
    footer,
    animate = true,
    contentKey,
}) => {
    const [content, setContent] = useState<PanelContent>({
        key: contentKey,
        badge,
        title,
        description,
        children,
        footer,
    });
    const [phase, setPhase] = useState<'enter' | 'exit'>('enter');
    const [enterId, setEnterId] = useState(0);
    const exitTimerRef = useRef<number | null>(null);
    const pendingRef = useRef<PanelContent | null>(null);

    useEffect(() => {
        return () => {
            if (exitTimerRef.current != null) {
                window.clearTimeout(exitTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (contentKey !== content.key) return;

        setContent({
            key: contentKey,
            badge,
            title,
            description,
            children,
            footer,
        });
    }, [badge, title, description, children, footer, contentKey, content.key]);

    useEffect(() => {
        if (contentKey === content.key) return;

        pendingRef.current = {
            key: contentKey,
            badge,
            title,
            description,
            children,
            footer,
        };

        setPhase('exit');

        if (exitTimerRef.current != null) {
            window.clearTimeout(exitTimerRef.current);
        }

        exitTimerRef.current = window.setTimeout(() => {
            if (pendingRef.current) {
                setContent(pendingRef.current);
                pendingRef.current = null;
            }
            setEnterId((id) => id + 1);
            setPhase('enter');
            exitTimerRef.current = null;
        }, EXIT_MS);
    }, [contentKey, content.key, badge, title, description, children, footer]);

    const stageBody =
        content.footer != null ? (
            <>
                <div className={styles.fields}>{content.children}</div>
                <div className={styles.footer}>{content.footer}</div>
            </>
        ) : (
            content.children
        );

    return (
        <div className={styles.wrapper}>
            <div className={clsx(styles.panel, animate && styles.panelAnimate)}>
                <aside className={styles.rail}>
                    <div
                        key={`rail-${content.key ?? 'static'}-${enterId}`}
                        className={clsx(
                            styles.railContent,
                            phase === 'enter' && styles.isEntering,
                            phase === 'exit' && styles.isExiting,
                        )}
                    >
                        {content.badge ? (
                            <span
                                className={clsx(styles.badge, styles.riseItem)}
                                style={{ '--i': 0 } as CSSProperties}
                            >
                                {content.badge}
                            </span>
                        ) : null}
                        <h2
                            className={clsx(styles.title, styles.riseItem)}
                            style={{ '--i': content.badge ? 1 : 0 } as CSSProperties}
                        >
                            {content.title}
                        </h2>
                        <p
                            className={clsx(styles.description, styles.riseItem)}
                            style={{ '--i': content.badge ? 2 : 1 } as CSSProperties}
                        >
                            {content.description}
                        </p>
                    </div>
                </aside>

                <div className={styles.stage}>
                    <div
                        key={`stage-${content.key ?? 'static'}-${enterId}`}
                        className={clsx(
                            styles.stageContent,
                            phase === 'enter' && styles.isEntering,
                            phase === 'exit' && styles.isExiting,
                        )}
                    >
                        {stageBody}
                    </div>
                </div>
            </div>
        </div>
    );
};
