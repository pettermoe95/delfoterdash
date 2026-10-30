import { cn } from '@bv/ui';
import type { ReactNode } from 'react';

type AdminPageLayoutProps = {
    title: string;
    actions?: ReactNode;
    innerClass?: string;
    children?: ReactNode;
};
export function AdminPageLayout({
    title,
    actions,
    innerClass = 'px-8 py-4',
    children,
}: AdminPageLayoutProps) {
    return (
        <div className="flex h-full min-h-full flex-col items-stretch">
            <div className="flex w-full flex-row justify-between gap-12 border-b border-gray-200 px-8 pb-4 pt-8">
                <h1 className="bv-display-font-md-regular">{title}</h1>
                {actions}
            </div>
            <div
                className={cn(
                    'flex h-full flex-col gap-lg overflow-y-auto',
                    innerClass
                )}
            >
                {children}
            </div>
        </div>
    );
}
