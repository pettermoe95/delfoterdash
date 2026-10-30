import * as React from 'react';
import { cn } from '../..';

export const textareaSizes = ['sm', 'md'] as const;
export type TextareaSize = (typeof textareaSizes)[number];

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    size?: TextareaSize;
}

const textareaSizeStyles: Record<TextareaSize, string> = {
    sm: 'min-h-[64px] bv-text-font-sm-regular',
    md: 'min-h-[80px] bv-text-font-md-regular',
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, size = 'md', ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    'flex w-full rounded-sm shadow-xs',
                    'ring-bran border border-primary bg-primary px-3 py-2',
                    'ring-offset-background text-primary placeholder:text-placeholder',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-brand-500 dark:focus-visible:ring-primary-brand-700',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    textareaSizeStyles[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = 'Textarea';

export { Textarea };
