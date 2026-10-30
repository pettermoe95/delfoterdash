import { generatePath } from 'react-router-dom';

export const APP_ROUTES = {
    customers: '/customers',
    delfoter_arcade: '/delfoter-arcade',
    delfoter_dash: '/delfoter-arcade/dash',
    delfoter_td: '/delfoter-arcade/ai-takeover',
    delfoter_adventure: '/delfoter-adventure',
    customer_details: '/customers/:tenantId',
    workflow_editor: '/workflow/editor/:workflowId',
    workflow_editor_v2: '/workflow/editor-v2/:workflowId',
    library: '/library',
    library_edit_template: '/library/:templateId',
    assistant: '/assistant',
} as const;

export const getCustomerDetailsPath = (tenantId: string) =>
    generatePath(APP_ROUTES.customer_details, { tenantId });

export const getCustomerWorkflowsPath = (tenantId: string) =>
    `${getCustomerDetailsPath(tenantId)}?tab=workflows`;
