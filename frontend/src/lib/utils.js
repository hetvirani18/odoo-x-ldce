import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/api\/?$/, '');

export function resolveAssetUrl(path) {
    if (!path) return null;
    if (/^(https?:)?\/\//.test(path)) return path;
    return `${API_ORIGIN}${path}`;
}

export function getInitials(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    return parts
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');
}
