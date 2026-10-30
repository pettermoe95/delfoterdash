import { Button, Chip, TextField } from '@brilliant/bds-core';
import { AICard } from '@bv/ui';
import wand from '~/assets/wand.png';
import { useMetricConcepts } from '~/hooks';
import { useLocalize } from '~/i18n/I18nContext';
import { useMemo, useState } from 'react';
import { GraphBuilderDialog } from '../../GraphBuilder/GraphBuilderDialog.tsx';
import { ConceptItemLoader } from '../ConceptsLibrary/ConceptItem.tsx';
import { ConceptsLibrary } from '../ConceptsLibrary/ConceptsLibrary.tsx';
import {
    ComponentFiltersProvider,
    useComponentFilters,
} from './componentFiltersContext.ts';
import { PaneLayout } from './PaneLayout.tsx';
import type { PaneProps } from './panes.ts';
import { filterConcepts } from './utils.ts';

export function ComponentsPane(_props: PaneProps) {
    const localize = useLocalize();
    const [search, setSearch] = useState<string>('');
    const [openGraphBuilder, setOpenGraphBuilder] = useState<boolean>(false);

    const handleOpenDialog = () => {
        setOpenGraphBuilder(false);
        setTimeout(() => setOpenGraphBuilder(true), 0);
    };

    return (
        <ComponentFiltersProvider value={{ search, setSearch }}>
            <PaneLayout className="flex h-full flex-col justify-between">
                <div className="flex h-full flex-col gap-xl">
                    <ComponentFilters />
                    <div className="flex-1 overflow-auto">
                        <ComponentTabs />
                    </div>
                    <div className="mt-3xl flex flex-col justify-end">
                        <AICard>
                            <AICard.Content>
                                <Button
                                    variant="ghost"
                                    color="secondary"
                                    size="sm"
                                    className="w-full"
                                    type="button"
                                    onClick={handleOpenDialog}
                                >
                                    <img src={wand} alt="magic wand icon" />
                                    {localize(
                                        'dashboards.create.generateWithAI'
                                    )}
                                    <Chip
                                        text="Beta"
                                        className="ml-1 rounded-xs border-brand-secondary-solid bg-brand-secondary-alt px-2 py-0"
                                    />
                                </Button>
                            </AICard.Content>
                        </AICard>
                    </div>
                </div>
                <div>
                    {openGraphBuilder && (
                        <GraphBuilderDialog
                            isOpen={openGraphBuilder}
                            setOpenGraphBuilder={setOpenGraphBuilder}
                        />
                    )}
                </div>
            </PaneLayout>
        </ComponentFiltersProvider>
    );
}

function ComponentFilters() {
    const localize = useLocalize();
    const { search, setSearch } = useComponentFilters();

    return (
        <div className="flex w-full items-center justify-between">
            <div className="flex-1">
                <TextField
                    name="search-components"
                    size="md"
                    leftIcon="bv:search"
                    placeholder={localize('dashboards.create.searchComponents')}
                    value={search}
                    onChange={(event) => setSearch?.(event.target.value)}
                />
            </div>
        </div>
    );
}

function ComponentTabs() {
    const localize = useLocalize();
    const { search } = useComponentFilters();
    const { data: metrics, isLoading } = useMetricConcepts();
    const excludeConceptName = true;
    const filteredConcepts = useMemo(
        () => filterConcepts(metrics ?? [], search, excludeConceptName),
        [excludeConceptName, metrics, search]
    );

    if (isLoading || !metrics) return <ConceptItemLoader />;

    return (
        <div className="flex h-full flex-col">
            <div className="pb-md text-primary transition-all bv-text-font-sm-medium">
                {localize('dashboards.create.concepts')} (
                {filteredConcepts.length})
            </div>
            <div className="flex-1 overflow-auto">
                <ConceptsLibrary
                    metrics={filteredConcepts}
                    hasConcepts={metrics.length > 0}
                />
            </div>
        </div>
    );
}
