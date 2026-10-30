import { Breadcrumbs } from '@bv/ui';
import { useLocalize } from '~/i18n/I18nContext';
import { useBreadcrumbsMap } from '~/stores/breadcrumbs';
import { useLayoutConfig } from '~/stores/system';
import type { ReactNode } from 'react';

type AppHeaderProps = {
    actions?: ReactNode;
};

export function AppHeader({ actions }: AppHeaderProps) {
    const localize = useLocalize();
    const { showAppHeader } = useLayoutConfig();
    const breadcrumbsMap = useBreadcrumbsMap();

    if (!showAppHeader) return null;

    return (
        <header className="flex min-h-[42px] max-w-screen-wide items-center justify-between px-4xl">
            <Breadcrumbs
                formatCrumbName={(crumb) => {
                    const mapping = breadcrumbsMap[crumb.to];
                    if (mapping) return mapping;
                    const unmapped = crumb.name
                        .split('-')
                        .map((s) => capitalize(s))
                        .join(' ');

                    const i18nKey =
                        'breadcrumbs.breadcrumb_' + unmapped.toLowerCase();
                    if (localize(i18nKey) !== i18nKey) {
                        return localize(i18nKey);
                    } //If no match in translation dictionary, use original unmapped value
                    return unmapped;
                }}
            />
            <div className="flex items-center gap-xl">{actions}</div>
        </header>
    );
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
