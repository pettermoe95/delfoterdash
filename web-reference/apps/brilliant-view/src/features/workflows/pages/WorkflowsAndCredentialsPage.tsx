import { TextField } from '@brilliant/bds-core';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@bv/ui';
import { PERMISSION, useAccount } from '~/features/auth';
import { useLocalize } from '~/i18n/I18nContext';
import { useState } from 'react';
import { CredentialsTable } from '../components/Credentials/CredentialsTable/CredentialsTable';
import { EditCredentialsDialog } from '../components/Credentials/EditCredentialsDialog/EditCredentialsDialog';
import { WorkflowsTable } from '../components/Workflows/WorkflowsTable/WorkflowsTable';

type WorkflowsTab = 'workflows' | 'credentials';

export function WorkflowsAndCredentialsPage() {
    const { account, hasPermission } = useAccount();
    const localize = useLocalize();
    const canReadWorkflows = hasPermission(PERMISSION.WORKFLOWS_READ);
    const canManageWorkflows = hasPermission(PERMISSION.WORKFLOWS_MANAGE);
    const canManageOrReadWorkflows = canManageWorkflows || canReadWorkflows;
    const canManageCredentials = hasPermission(PERMISSION.CREDENTIAL_MANAGE);
    const permissionsLoaded = account !== undefined;
    const [activeTab, setActiveTab] = useState<WorkflowsTab>('workflows');
    const [workflowSearch, setWorkflowSearch] = useState('');
    const [credentialsSearch, setCredentialsSearch] = useState('');

    function canAccessTab(tab: WorkflowsTab) {
        return tab === 'workflows'
            ? canManageOrReadWorkflows
            : canManageCredentials;
    }
    const firstAccessibleTab = canAccessTab('workflows')
        ? 'workflows'
        : canAccessTab('credentials')
          ? 'credentials'
          : null;
    const resolvedTab = canAccessTab(activeTab)
        ? activeTab
        : firstAccessibleTab;
    const isCredentialsTab = resolvedTab === 'credentials';
    const activeSearch = isCredentialsTab ? credentialsSearch : workflowSearch;
    const setActiveSearch = isCredentialsTab
        ? setCredentialsSearch
        : setWorkflowSearch;
    const activeSearchPlaceholder = isCredentialsTab
        ? localize('workflows.searchCredentials')
        : localize('workflows.searchWorkflows');

    if (!permissionsLoaded) {
        return null;
    }

    if (!resolvedTab) {
        return localize('workflows.noAccess');
    }

    return (
        <Tabs
            value={resolvedTab}
            onValueChange={(value) => {
                if (
                    (value === 'workflows' || value === 'credentials') &&
                    canAccessTab(value)
                ) {
                    setActiveTab(value);
                }
            }}
            className="flex h-full min-h-0 w-full flex-col gap-xl"
        >
            <TabsList>
                {canManageOrReadWorkflows && (
                    <TabsTrigger value="workflows">
                        {localize('workflows.workflows')}
                    </TabsTrigger>
                )}
                {canManageCredentials && (
                    <TabsTrigger value="credentials">
                        {localize('workflows.credentials')}
                    </TabsTrigger>
                )}
            </TabsList>
            <div className="flex items-center justify-between gap-md">
                <div className="w-full max-w-[480px]">
                    <TextField
                        name={
                            isCredentialsTab
                                ? 'search-credentials'
                                : 'search-workflows'
                        }
                        size="md"
                        leftIcon="bv:search"
                        placeholder={activeSearchPlaceholder}
                        value={activeSearch}
                        onChange={(event) =>
                            setActiveSearch(event.target.value)
                        }
                    />
                </div>
                {isCredentialsTab && canManageCredentials ? (
                    <EditCredentialsDialog disabled={false} mode="create" />
                ) : null}
            </div>
            <TabsContent value="workflows">
                {canManageOrReadWorkflows ? (
                    <WorkflowsTable search={workflowSearch} />
                ) : (
                    localize('workflows.noAccess')
                )}
            </TabsContent>
            <TabsContent value="credentials">
                {canManageCredentials ? (
                    <CredentialsTable search={credentialsSearch} />
                ) : (
                    localize('workflows.noAccess')
                )}
            </TabsContent>
        </Tabs>
    );
}
