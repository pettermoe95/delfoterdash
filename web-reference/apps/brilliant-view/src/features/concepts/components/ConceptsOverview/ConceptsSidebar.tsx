import { Button, TextField } from '@brilliant/bds-core';
import type { Concept, ConceptType } from '@bv/api';
import {
    AICard,
    Sheet,
    SheetContent,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@bv/ui';
import { useLocalize } from '~/i18n/I18nContext';
import { ConceptList } from './ConceptList';

interface ConceptsSidebarProps {
    search: string;
    onSearchChange: (value: string) => void;
    activeTab: ConceptType;
    onTabChange: (value: ConceptType) => void;
    filteredFields: Concept[];
    filteredMetrics: Concept[];
    isLoading: boolean;
    handleSelectConcept: (concept: Concept, type: ConceptType) => void;
    selectedConcept?: Concept | null;
    onCreateConcept?: () => void;
    mobileOpen?: boolean;
    onMobileOpenChange?: (open: boolean) => void;
}

export function ConceptsSidebar({
    search,
    onSearchChange,
    activeTab,
    onTabChange,
    filteredFields,
    filteredMetrics,
    isLoading,
    handleSelectConcept,
    selectedConcept,
    onCreateConcept,
    mobileOpen = false,
    onMobileOpenChange,
}: ConceptsSidebarProps) {
    const localize = useLocalize();
    const sidebarContent = (
        <div className="flex h-full min-h-0 flex-col gap-lg">
            <div className="w-full pr-10 lg:pr-0">
                <TextField
                    name="search-concepts"
                    size="md"
                    leftIcon="bv:search"
                    placeholder={localize('concepts.searchConcepts')}
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </div>
            <Tabs
                value={activeTab}
                onValueChange={(value) => {
                    if (isConceptTabValue(value)) {
                        onTabChange(value);
                    }
                }}
                className="flex h-full min-h-0 flex-1 flex-col"
            >
                <TabsList>
                    <TabsTrigger value="metric">
                        {localize('concepts.metrics')} ({filteredMetrics.length}
                        )
                    </TabsTrigger>
                    <TabsTrigger value="field">
                        {localize('concepts.fields')} ({filteredFields.length})
                    </TabsTrigger>
                </TabsList>
                <TabsContent
                    value="metric"
                    className="min-h-0 flex-1 overflow-auto"
                >
                    <ConceptList
                        concepts={filteredMetrics}
                        conceptType="metric"
                        isLoading={isLoading}
                        onSelectConcept={handleSelectConcept}
                        selectedConcept={selectedConcept}
                        emptyLabel={
                            search
                                ? localize('concepts.noMetricsSearch')
                                : localize('concepts.noMetricsAvailable')
                        }
                    />
                </TabsContent>
                <TabsContent
                    value="field"
                    className="min-h-0 flex-1 overflow-auto"
                >
                    <ConceptList
                        concepts={filteredFields}
                        conceptType="field"
                        isLoading={isLoading}
                        onSelectConcept={handleSelectConcept}
                        selectedConcept={selectedConcept}
                        emptyLabel={
                            search
                                ? localize('concepts.noFieldsSearch')
                                : localize('concepts.noFieldsAvailable')
                        }
                    />
                </TabsContent>
            </Tabs>
            {onCreateConcept ? (
                <div className="mb-6xl mt-auto lg:mb-0">
                    <AICard>
                        <AICard.Content>
                            <Button
                                variant="ghost"
                                color="secondary"
                                type="button"
                                size="sm"
                                className="w-full"
                                leftIcon="bv:plus"
                                onClick={onCreateConcept}
                            >
                                {localize('concepts.createConcept')}
                            </Button>
                        </AICard.Content>
                    </AICard>
                </div>
            ) : null}
        </div>
    );

    return (
        <>
            <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange} modal>
                <SheetContent
                    overlay
                    side="right"
                    className="h-full w-full border-l-0 px-4 py-4 focus-within:!shadow-none focus-within:!outline-none lg:hidden"
                >
                    {sidebarContent}
                </SheetContent>
            </Sheet>
            <Sheet open modal={false}>
                <SheetContent
                    overlay={false}
                    showCloseButton={false}
                    className="hidden w-[var(--edit-panel-width)] focus-within:!shadow-none focus-within:!outline-none lg:block"
                >
                    {sidebarContent}
                </SheetContent>
            </Sheet>
        </>
    );
}

function isConceptTabValue(value: string): value is ConceptType {
    return value === 'field' || value === 'metric';
}
