import { cn } from '@brilliant/bds-core';
import type { PropsWithChildren } from 'react';

type AICardProps = PropsWithChildren & {
    className?: string;
};

export const AICard = ({ children, className }: AICardProps) => {
    return (
        <div
            className={cn(
                'bg-gradient-to-r from-primary-brand-500 via-secondary-violet-500 to-secondary-gold-600',
                'rounded-sm p-0.5',
                className
            )}
        >
            {children}
        </div>
    );
};

const AICardContent = ({ children, className }: AICardProps) => {
    return (
        <div className={cn('rounded-xs bg-primary', className)}>{children}</div>
    );
};

AICard.Content = AICardContent;
