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

const DATE_FORMAT = { month: 'short', day: 'numeric' };

export function formatDateRange(startDate, endDate) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const sameYear = start.getFullYear() === end.getFullYear();
    const startLabel = start.toLocaleDateString('en-US', DATE_FORMAT);
    const endLabel = end.toLocaleDateString('en-US', { ...DATE_FORMAT, year: 'numeric' });
    if (sameYear) {
        return `${startLabel} – ${endLabel}`;
    }
    return `${start.toLocaleDateString('en-US', { ...DATE_FORMAT, year: 'numeric' })} – ${endLabel}`;
}

export function getTripStatus(startDate, endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (end < today) return 'completed';
    if (start > today) return 'upcoming';
    return 'ongoing';
}
