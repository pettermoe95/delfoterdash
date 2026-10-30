import { IconButton } from '@brilliant/bds-core';
import type { ReactNode } from 'react';

type PaneLayoutProps = {
    title?: string;
    onBack?: () => void;
    className?: string;
    children?: ReactNode;
};

export function PaneLayout({
    onBack,
    className,
    title,
    children,
}: PaneLayoutProps) {
    return (
        <div className={className}>
            {(onBack || title) && (
                <div className="relative flex justify-center">
                    {onBack && (
                        <div className="absolute left-0">
                            <IconButton
                                size="sm"
                                icon="bv:arrow-left"
                                variant="ghost"
                                color="gray"
                                onClick={onBack}
                            />
                        </div>
                    )}
                    {title && (
                        <div className="text-secondary bv-display-font-xs-medium">
                            {title}
                        </div>
                    )}
                </div>
            )}
            {children}
        </div>
    );
}
