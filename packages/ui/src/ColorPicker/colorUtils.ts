export type Hsv = { h: number; s: number; v: number };

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function isValidHex(value: string): boolean {
    return HEX_RE.test(value);
}

/** Expands #RGB → #RRGGBB and lowercases. Returns null if invalid. */
export function normalizeHex(value: string): string | null {
    if (!isValidHex(value)) return null;

    const raw = value.slice(1);
    if (raw.length === 3) {
        return `#${raw
            .split('')
            .map((c) => c + c)
            .join('')
            .toLowerCase()}`;
    }

    return `#${raw.toLowerCase()}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const normalized = normalizeHex(hex);
    if (!normalized) return null;

    return {
        r: Number.parseInt(normalized.slice(1, 3), 16),
        g: Number.parseInt(normalized.slice(3, 5), 16),
        b: Number.parseInt(normalized.slice(5, 7), 16),
    };
}

export function rgbToHex(r: number, g: number, b: number): string {
    const toByte = (n: number) =>
        Math.round(Math.min(255, Math.max(0, n)))
            .toString(16)
            .padStart(2, '0');

    return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

export function rgbToHsv(r: number, g: number, b: number): Hsv {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;

    let h = 0;
    if (d !== 0) {
        if (max === rn) h = ((gn - bn) / d) % 6;
        else if (max === gn) h = (bn - rn) / d + 2;
        else h = (rn - gn) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
    }

    const s = max === 0 ? 0 : d / max;
    return { h, s, v: max };
}

export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let rp = 0;
    let gp = 0;
    let bp = 0;

    if (h < 60) [rp, gp, bp] = [c, x, 0];
    else if (h < 120) [rp, gp, bp] = [x, c, 0];
    else if (h < 180) [rp, gp, bp] = [0, c, x];
    else if (h < 240) [rp, gp, bp] = [0, x, c];
    else if (h < 300) [rp, gp, bp] = [x, 0, c];
    else [rp, gp, bp] = [c, 0, x];

    return {
        r: (rp + m) * 255,
        g: (gp + m) * 255,
        b: (bp + m) * 255,
    };
}

export function hexToHsv(hex: string): Hsv | null {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

export function hsvToHex(h: number, s: number, v: number): string {
    const { r, g, b } = hsvToRgb(h, s, v);
    return rgbToHex(r, g, b);
}

export function hueToCss(h: number): string {
    const { r, g, b } = hsvToRgb(h, 1, 1);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}
