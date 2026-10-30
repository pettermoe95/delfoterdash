import { cn } from '@bv/ui';
import { useLayoutConfig } from '~/stores/system';
import type { ReactNode } from 'react';
import { AppHeader } from './AppHeader';

type DefaultPageLayoutProps = {
    actions?: ReactNode;
    children: ReactNode;
};

export function DefaultPageLayout({
    actions,
    children,
}: DefaultPageLayoutProps) {
    const { layoutPadding, maxWidthClass } = useLayoutConfig();

    return (
        <>
            <AppHeader actions={actions} />
            <main
                className={cn(
                    'flex h-full flex-1 flex-col overflow-y-auto',
                    '-mt-4 pt-4',
                    maxWidthClass,
                    layoutPadding?.horizontal
                )}
            >
                {children}
            </main>
        </>
    );
}
