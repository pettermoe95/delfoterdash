export type CreateCredentialRequest = {
    configuration: Record<string, string>;
    flow_id: string;
    name: string;
    secrets: Record<string, string>;
};

export type CreateCredentialResponse = {
    id: string;
};

export type UpdateCredentialRequest = {
    configuration: Record<string, string>;
    name: string;
    secrets?: Record<string, string>;
};

export type CreateCredentialParams = {
    payload: CreateCredentialRequest;
};

export type UpdateCredentialParams = {
    credentialId: string;
    payload: UpdateCredentialRequest;
};

type ConfigurableField = {
    data_type: string;
    display_name: string;
    key: string;
};

export type CredentialFlowDefinition = {
    configuration: ConfigurableField[];
    id: string;
    name: string;
    secrets: ConfigurableField[];
};

export type CredentialListItem = {
    id: string;
    name: string;
    flow_name: string;
    tenant_id: string;
};

export type CredentialDetail = {
    id: string;
    name: string;
    configuration: Record<string, string>;
    flow: CredentialFlowDefinition;
};

export type CredentialReAuthorization = {
    needsReAuth: boolean;
};

export type CredentialReAuthorizationResponse = {
    needsReAuth?: boolean;
};

export type WorkflowListItemResponse = {
    workflow_id: string;
    name: string;
    enabled: boolean;
    last_start: number;
    schedule?: {
        schedule_type: 'interval' | 'specific_time';
        specific_time: string;
        interval_anchor: string;
        interval_seconds: number;
        next_run: number;
    };
    failed_runs_after_last_success: number;
    last_successful_run?: {
        run_id: string;
        started_at: number;
        completed_at: number;
        duration_ms: number;
    };
};

export type WorkflowListItem = {
    workflow_id: string;
    name: string;
    enabled: boolean;
    schedule?: NonNullable<WorkflowListItemResponse['schedule']>;
    intervalAnchor: string | null;
    lastSuccessfulRunAt: Date | null;
    lastSuccessfulRunDurationMs: number | null;
    failedRunsSinceLastSuccess: number;
};

export type WorkflowsListResponse = {
    workflows: WorkflowListItemResponse[];
};

export type UpdateWorkflowParams = {
    workflowId: string;
    enabled: boolean;
};
