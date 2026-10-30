import { Button } from '@brilliant/bds-core';
import { PERMISSION, useAccount } from '~/features/auth';
import { useLocalize } from '~/i18n/I18nContext';
import { DefaultPageLayout } from '~/layout/DefaultPageLayout';
import { useAutoLayout } from '~/stores/system';
import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConceptsOverview } from '../components/ConceptsOverview/ConceptsOverview';

export function ConceptsPage() {
    const localize = useLocalize();
    const { hasPermission } = useAccount();
    const [searchParams, setSearchParams] = useSearchParams();
    const isCreateMode = searchParams.get('createMode') === 'true';
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    useAutoLayout('page-layout');

    const openCreateMode = useCallback(() => {
        const next = new URLSearchParams(searchParams);
        next.set('createMode', 'true');
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);

    const closeCreateMode = useCallback(() => {
        const next = new URLSearchParams(searchParams);
        next.delete('createMode');
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);

    return (
        <DefaultPageLayout
            actions={
                <ConceptsActions onOpen={() => setMobileSidebarOpen(true)} />
            }
        >
            <div className="flex h-full w-full flex-col overflow-auto lg:overflow-hidden">
                {!hasPermission(PERMISSION.CONCEPTS_EDIT) ? (
                    localize('users.noAccess')
                ) : (
                    <div className="flex min-h-0 flex-col gap-lg">
                        <div className="min-h-0 overflow-visible lg:overflow-hidden">
                            <ConceptsOverview
                                isCreateMode={isCreateMode}
                                onEnterCreateMode={openCreateMode}
                                onExitCreateMode={closeCreateMode}
                                mobileSidebarOpen={mobileSidebarOpen}
                                onMobileSidebarOpenChange={setMobileSidebarOpen}
                            />
                        </div>
                    </div>
                )}
            </div>
        </DefaultPageLayout>
    );
}

function ConceptsActions({ onOpen }: { onOpen: () => void }) {
    const localize = useLocalize();
    const { hasPermission } = useAccount();

    if (!hasPermission(PERMISSION.CONCEPTS_EDIT)) {
        return null;
    }

    return (
        <div className="lg:hidden">
            <Button
                type="button"
                size="sm"
                leftIcon="bv:search"
                onClick={onOpen}
            >
                {localize('concepts.form.concepts')}
            </Button>
        </div>
    );
}
