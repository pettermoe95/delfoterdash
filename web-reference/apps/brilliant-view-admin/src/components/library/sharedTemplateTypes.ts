export type TemplateStatus = 'draft' | 'preview' | 'active';

export const TEMPLATE_STATUSES: TemplateStatus[] = [
    'draft',
    'preview',
    'active',
];

export type AdminTemplateListing = {
    template_id: number;
    template_name: string;
    template_status: TemplateStatus;
    graph_type_id: number;
    graph_type_name: string;
    graph_query: unknown;
    graph_display: Record<string, unknown>;
    total_uses: number;
    total_customers: number;
};
