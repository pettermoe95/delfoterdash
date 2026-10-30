import { Tabs, TabsContent, TabsList, TabsTrigger } from '@bv/ui';
import { useQuery } from '@tanstack/react-query';
import type { TenantCustomer } from '~/api/customers';
import { useWorkflowListing } from '~/hooks/workflow.ts';
import { useParams, useSearchParams } from 'react-router-dom';
import { apiService } from '../../api/service';
import { CustomerDashboardsTable } from '../../components/customer/CustomerDashboardTable';
import { CustomerUserTable } from '../../components/customer/CustomerUserTable';
import { AdminPageLayout } from '../../layout/AdminPageLayout';
import { CustomerSemanticModel } from './CustomerSemanticModel';
import { CustomerWorkflows } from './CustomerWorkflows';
import '@xyflow/react/dist/style.css';

const customerTabs = ['users', 'dashboards', 'workflows', 'semantic-model'];

export function CustomerDetailsPage() {
    const { tenantId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedTab = searchParams.get('tab');
    const activeTab =
        requestedTab && customerTabs.includes(requestedTab)
            ? requestedTab
            : 'users';
    const { data: allCustomers } = useQuery<TenantCustomer[]>({
        queryKey: ['customers'] as const,
        queryFn: () =>
            apiService.getData<TenantCustomer[]>('/v1/admin/customers'),
    });
    const customer = allCustomers?.find((c) => c.tenant_id === tenantId);

    const { isLoading: isWorkflowsLoading, workflows } =
        useWorkflowListing(tenantId);
    if (customer == undefined || tenantId == undefined) {
        return <b>Not found</b>;
    }

    return (
        <AdminPageLayout
            title={customer.organization_name}
            innerClass="min-h-0 flex-1 overflow-hidden px-8 py-4"
        >
            <Tabs
                value={activeTab}
                onValueChange={(tab) => {
                    setSearchParams((current) => {
                        const next = new URLSearchParams(current);
                        next.set('tab', tab);
                        return next;
                    });
                }}
                className="flex min-h-0 flex-1 flex-col gap-lg"
            >
                <TabsList aria-label="Customer details" className="flex-wrap">
                    <TabsTrigger value="users">
                        Users ({customer.user_count})
                    </TabsTrigger>
                    <TabsTrigger value="dashboards">
                        Dashboards ({customer.dashboard_count})
                    </TabsTrigger>
                    <TabsTrigger value="workflows">
                        Workflows (
                        {isWorkflowsLoading ? '...' : workflows?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="semantic-model">
                        Semantic model
                    </TabsTrigger>
                </TabsList>
                <TabsContent
                    value="users"
                    className="min-h-0 flex-1 overflow-auto"
                >
                    <CustomerUserTable tenantId={tenantId} />
                </TabsContent>
                <TabsContent
                    value="dashboards"
                    className="min-h-0 flex-1 overflow-auto"
                >
                    <CustomerDashboardsTable tenantId={tenantId} />
                </TabsContent>
                <TabsContent
                    value="workflows"
                    className="min-h-0 flex-1 overflow-auto"
                >
                    <CustomerWorkflows
                        key={tenantId}
                        tenantId={tenantId}
                        workflows={workflows ?? []}
                    />
                </TabsContent>
                <TabsContent
                    value="semantic-model"
                    className="min-h-0 flex-1 overflow-auto"
                >
                    <CustomerSemanticModel tenantId={tenantId} />
                </TabsContent>
            </Tabs>
        </AdminPageLayout>
    );
}
