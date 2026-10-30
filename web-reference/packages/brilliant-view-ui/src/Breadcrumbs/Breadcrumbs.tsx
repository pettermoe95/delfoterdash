import { createSafeContext, Icon } from '@brilliant/bds-core';
import { Fragment } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../utils';

export type CrumbLinkFormatter = (crumb: CrumbLinkItem) => string | undefined;

type BreadcrumbsContextValue = {
    currentLocation: string;
    formatCrumbName?: CrumbLinkFormatter;
};

const [BreadcrumbsProvider, useBreadcrumbs] =
    createSafeContext<BreadcrumbsContextValue>(
        'No breadcrumbs component found in the tree'
    );

export function Breadcrumbs(
    props: Pick<BreadcrumbsContextValue, 'formatCrumbName'>
) {
    const currentLocation = useLocation();
    const crumbs = getCrumbItems(currentLocation.pathname);

    if (currentLocation.pathname === '/dashboards/overview') {
        return (
            <NavLink
                to={location.href}
                className={cn(
                    'flex cursor-pointer items-center gap-md',
                    'text-fg-senary hover:text-tertiary-hover hover:underline',
                    'text-brand-secondary bv-text-font-md-regular'
                )}
            >
                <Icon icon="bv:home" fontSize={24} />
            </NavLink>
        );
    }

    return (
        <BreadcrumbsProvider
            value={{
                currentLocation: currentLocation.pathname,
                formatCrumbName: props.formatCrumbName,
            }}
        >
            <div className="flex items-center gap-lg">
                {crumbs.map((match, idx) => {
                    return (
                        <Fragment key={match.name}>
                            <CrumbLink crumb={match} />
                            {idx < crumbs.length - 1 && (
                                <div className="item-center flex text-fg-senary">
                                    <Icon icon="bv:chevron-right" />
                                </div>
                            )}
                        </Fragment>
                    );
                })}
            </div>
        </BreadcrumbsProvider>
    );
}

export type CrumbLinkItem = { to: string; name: string };

function getCrumbItems(path: string): CrumbLinkItem[] {
    const crumbs = path.split('/').filter(onlyUnique);
    return crumbs.map((crumb, idx) => ({
        to: crumb === '' ? '/' : crumbs.slice(0, idx + 1).join('/'),
        name: crumb === '' ? '' : crumb,
    }));
}

type CrumbLinkProps = { crumb: CrumbLinkItem };
export function CrumbLink({ crumb }: CrumbLinkProps) {
    const { currentLocation, formatCrumbName } = useBreadcrumbs();
    const match = crumb.to === currentLocation;

    const crumbText =
        crumb.to === '/' ? (
            <>
                <Icon icon="bv:home" fontSize={24} />
                {match && <span>{crumb.name}</span>}
            </>
        ) : (
            (formatCrumbName?.(crumb) ?? capitalize(crumb.name))
        );

    return (
        <NavLink
            to={crumb.to}
            className={cn(
                'flex cursor-pointer items-center gap-md',
                'text-fg-senary hover:text-tertiary-hover hover:underline',
                match && 'text-brand-secondary bv-text-font-md-regular'
            )}
        >
            {crumbText}
        </NavLink>
    );
}

function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function onlyUnique<T>(value: T, index: number, array: T[]) {
    return array.indexOf(value) === index;
}
