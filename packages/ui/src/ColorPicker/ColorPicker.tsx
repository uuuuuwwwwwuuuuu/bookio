import {
    autoUpdate,
    flip,
    FloatingPortal,
    offset,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
} from '@floating-ui/react';
import {
    memo,
    useEffect,
    useId,
    useRef,
    useState,
    type ChangeEvent,
    type CSSProperties,
    type KeyboardEvent,
    type PointerEvent,
} from 'react';
import Input from '../Input/Input.js';
import {
    hexToHsv,
    hueToCss,
    hsvToHex,
    isValidHex,
    normalizeHex,
    type Hsv,
} from './colorUtils.js';
import styles from './ColorPicker.module.scss';

const FALLBACK_HSV: Hsv = { h: 0, s: 1, v: 1 };

export type ColorPickerProps = {
    currentColor: string;
    setCurrentColor: (color: string) => void;
    className?: string;
    disabled?: boolean;
    id?: string;
    showValue?: boolean;
    'aria-label'?: string;
};

function ColorPicker({
    currentColor,
    setCurrentColor,
    className,
    disabled = false,
    id,
    showValue = true,
    'aria-label': ariaLabel = 'Choose color',
}: ColorPickerProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [open, setOpen] = useState(false);
    const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(currentColor) ?? FALLBACK_HSV);
    const [hexDraft, setHexDraft] = useState(() => normalizeHex(currentColor) ?? currentColor);
    const svRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const next = hexToHsv(currentColor);
        if (!next) return;
        setHsv(next);
        setHexDraft(normalizeHex(currentColor) ?? currentColor);
    }, [currentColor]);

    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: setOpen,
        placement: 'bottom-start',
        middleware: [offset(4), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    const click = useClick(context, { enabled: !disabled });
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: 'dialog' });
    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

    const commitHsv = (next: Hsv) => {
        setHsv(next);
        const hex = hsvToHex(next.h, next.s, next.v);
        setHexDraft(hex);
        setCurrentColor(hex);
    };

    const updateSvFromPointer = (event: PointerEvent<HTMLDivElement>) => {
        const el = svRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const s = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
        const v = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
        commitHsv({ ...hsv, s, v });
    };

    const updateHueFromPointer = (event: PointerEvent<HTMLDivElement>) => {
        const el = hueRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const h = Math.min(360, Math.max(0, ((event.clientX - rect.left) / rect.width) * 360));
        commitHsv({ ...hsv, h });
    };

    const handleSvPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        updateSvFromPointer(event);
    };

    const handleSvPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        updateSvFromPointer(event);
    };

    const handleHuePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        updateHueFromPointer(event);
    };

    const handleHuePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        updateHueFromPointer(event);
    };

    const commitHexDraft = () => {
        const normalized = normalizeHex(hexDraft.trim());
        if (!normalized) {
            setHexDraft(normalizeHex(currentColor) ?? hsvToHex(hsv.h, hsv.s, hsv.v));
            return;
        }
        setHexDraft(normalized);
        setCurrentColor(normalized);
        const next = hexToHsv(normalized);
        if (next) setHsv(next);
    };

    const handleHexChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setHexDraft(value);
        if (isValidHex(value)) {
            const normalized = normalizeHex(value);
            if (!normalized) return;
            setCurrentColor(normalized);
            const next = hexToHsv(normalized);
            if (next) setHsv(next);
        }
    };

    const handleHexKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            commitHexDraft();
        }
    };

    const displayHex = normalizeHex(currentColor) ?? currentColor;
    const swatchColor = normalizeHex(currentColor) ?? 'transparent';
    const hueColor = hueToCss(hsv.h);
    const previewHex = hsvToHex(hsv.h, hsv.s, hsv.v);

    const rootClasses = [styles.root, !showValue && styles.rootCompact, className]
        .filter(Boolean)
        .join(' ');
    const triggerClasses = [
        styles.trigger,
        !showValue && styles.triggerCompact,
        open && styles.triggerOpen,
        disabled && styles.triggerDisabled,
    ]
        .filter(Boolean)
        .join(' ');

    const svStyle = {
        backgroundColor: hueColor,
        '--sv-thumb-x': `${hsv.s * 100}%`,
        '--sv-thumb-y': `${(1 - hsv.v) * 100}%`,
    } as CSSProperties;

    const hueStyle = {
        '--hue-thumb-x': `${(hsv.h / 360) * 100}%`,
    } as CSSProperties;

    return (
        <div className={rootClasses}>
            <button
                ref={refs.setReference}
                type="button"
                id={inputId}
                className={triggerClasses}
                disabled={disabled}
                aria-label={ariaLabel}
                aria-haspopup="dialog"
                aria-expanded={open}
                {...getReferenceProps()}
            >
                <span
                    className={styles.swatch}
                    style={{ backgroundColor: swatchColor }}
                    data-empty={!normalizeHex(currentColor) || undefined}
                />
                {showValue && <span className={styles.triggerValue}>{displayHex || '—'}</span>}
            </button>

            {open && (
                <FloatingPortal>
                    <div
                        ref={refs.setFloating}
                        style={floatingStyles}
                        className={styles.popover}
                        {...getFloatingProps()}
                    >
                        <div
                            ref={svRef}
                            className={styles.sv}
                            style={svStyle}
                            onPointerDown={handleSvPointerDown}
                            onPointerMove={handleSvPointerMove}
                            role="presentation"
                        >
                            <span className={styles.svThumb} />
                        </div>

                        <div
                            ref={hueRef}
                            className={styles.hue}
                            style={hueStyle}
                            onPointerDown={handleHuePointerDown}
                            onPointerMove={handleHuePointerMove}
                            role="presentation"
                        >
                            <span className={styles.hueThumb} />
                        </div>

                        <div className={styles.hexRow}>
                            <span
                                className={styles.preview}
                                style={{ backgroundColor: previewHex }}
                                aria-hidden
                            />
                            <Input
                                value={hexDraft}
                                onChange={handleHexChange}
                                onBlur={commitHexDraft}
                                onKeyDown={handleHexKeyDown}
                                placeholder="#000000"
                                aria-label="Hex color"
                                className={styles.hexInput}
                                spellCheck={false}
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </FloatingPortal>
            )}
        </div>
    );
}

export default memo(ColorPicker);
