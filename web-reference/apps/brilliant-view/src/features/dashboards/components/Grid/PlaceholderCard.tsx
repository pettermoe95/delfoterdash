import { cn } from '@brilliant/bds-core';
import { ReactComponent as EmptyDashboard } from '~/assets/empty-dashboard.svg';
import type { ReactNode } from 'react';

type PlaceholderCardProps = {
    className?: string;
    action?: ReactNode;
    title?: ReactNode;
};

export function PlaceholderCard({
    action,
    title,
    className,
}: PlaceholderCardProps) {
    return (
        <div
            data-component-name={PlaceholderCard.name}
            className={cn(
                'absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]',
                className
            )}
        >
            <div className="flex flex-col gap-5xl">
                <EmptyDashboard style={{ color: 'var(--bg-primary)' }} />
                <div className="space-y-2xl">
                    <h3 className="max-w-[400px] text-center text-secondary bv-text-font-md-regular">
                        {title}
                    </h3>
                    {action && (
                        <div className="flex justify-center">{action}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
