import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/* Consider creating a separate package for utils like this */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
