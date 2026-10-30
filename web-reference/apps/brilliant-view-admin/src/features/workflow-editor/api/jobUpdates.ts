import { z } from 'zod';

export const jobStatuses = {
    WorkflowJobWasStarted: 'running',
    WorkflowJobCompletedSuccessfully: 'success',
    WorkflowJobFailed: 'failure',
} as const;

export const jobUpdateSchema = z
    .object({
        name: z.enum([
            'WorkflowJobWasStarted',
            'WorkflowJobCompletedSuccessfully',
            'WorkflowJobFailed',
        ]),
        workflowId: z.string(),
        tenantId: z.string(),
        occurredAt: z.string(),
        payload: z.object({ jobId: z.string() }).passthrough(),
    })
    .passthrough();

export type JobUpdate = {
    message: z.infer<typeof jobUpdateSchema>;
    receivedAt: number;
};

export function buildJobLogsUrl(apiBaseUrl: string, update: JobUpdate) {
    const hostname = new URL(apiBaseUrl, window.location.origin).hostname;
    const environment =
        hostname === 'test.brilliantview.no' ||
        hostname.endsWith('.test.brilliantview.no')
            ? 'test.'
            : hostname === 'dev.brilliantview.no' ||
                hostname.endsWith('.dev.brilliantview.no')
              ? 'dev.'
              : hostname === 'brilliantview.no' ||
                  hostname.endsWith('.brilliantview.no')
                ? ''
                : 'dev.';
    const params = new URLSearchParams({
        query: JSON.stringify(update.message.payload.jobId),
        'g0.range_input': '2m',
        // VMUI expects UTC wall time without a timezone suffix. Its legacy
        // parser shifts ISO strings ending in Z by the browser's UTC offset.
        'g0.end_input': new Date(update.receivedAt).toISOString().slice(0, -1),
        'g0.relative_time': 'none',
    });
    return `https://victorialogs.${environment}brilliantview.no/select/vmui/#/?${params}`;
}

type SubscriptionOptions = {
    workflowId: string;
    tenantId: string;
    apiBaseUrl: string;
    getToken: () => Promise<{ token: string }>;
    onUpdate: (update: JobUpdate) => void;
    onError: (message: string | undefined) => void;
};

export function subscribeToWorkflowJobs(options: SubscriptionOptions) {
    let disposed = false;
    let socket: WebSocket | undefined;
    let subscriptionKey: string | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let connectTimer: ReturnType<typeof setTimeout> | undefined;
    let retryDelay = 1000;

    const retry = () => {
        if (disposed || retryTimer) return;
        options.onError('Live job updates disconnected. Reconnecting…');
        retryTimer = setTimeout(() => {
            retryTimer = undefined;
            void connect();
        }, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30_000);
    };

    const connect = async () => {
        try {
            const { token } = await options.getToken();
            if (disposed) return;
            const url = new URL(options.apiBaseUrl, window.location.origin);
            url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
            url.pathname = '/ws';
            url.search = '';
            url.searchParams.set('token', token);
            const connection = new WebSocket(url);
            socket = connection;
            subscriptionKey = undefined;
            connectTimer = setTimeout(() => connection.close(), 15_000);
            connection.onopen = () => {
                if (disposed) {
                    connection.close();
                    return;
                }
                connection.send(
                    JSON.stringify({
                        command: 'subscribe.workflow',
                        workflowId: options.workflowId,
                    })
                );
            };
            connection.onmessage = (event) => {
                if (
                    disposed ||
                    socket !== connection ||
                    typeof event.data !== 'string'
                )
                    return;
                const receivedAt = Date.now();
                let message: unknown;
                try {
                    message = JSON.parse(event.data);
                } catch {
                    return;
                }
                if (typeof message !== 'object' || message === null) return;
                if (
                    'type' in message &&
                    message.type === 'subscribed.workflow' &&
                    'subscriptionKey' in message &&
                    typeof message.subscriptionKey === 'string'
                ) {
                    clearTimeout(connectTimer);
                    subscriptionKey = message.subscriptionKey;
                    retryDelay = 1000;
                    options.onError(undefined);
                    return;
                }
                if ('type' in message && message.type === 'error') {
                    clearTimeout(connectTimer);
                    options.onError(
                        'Live job updates unavailable: ' +
                            ('message' in message &&
                            typeof message.message === 'string'
                                ? message.message
                                : 'Subscription failed')
                    );
                    // The backend does not distinguish permission errors from temporary failures.
                    // The editor offers an explicit retry instead of looping on denied subscriptions.
                    connection.onclose = null;
                    connection.close();
                    return;
                }
                const parsed = jobUpdateSchema.safeParse(message);
                if (
                    parsed.success &&
                    parsed.data.workflowId === options.workflowId &&
                    parsed.data.tenantId === options.tenantId
                ) {
                    options.onUpdate({ message: parsed.data, receivedAt });
                }
            };
            connection.onerror = () => connection.close();
            connection.onclose = () => {
                clearTimeout(connectTimer);
                retry();
            };
        } catch {
            retry();
        }
    };
    void connect();
    return () => {
        disposed = true;
        clearTimeout(retryTimer);
        clearTimeout(connectTimer);
        if (socket?.readyState === WebSocket.OPEN && subscriptionKey) {
            socket.send(
                JSON.stringify({
                    command: 'unsubscribe.workflow',
                    subscriptionKey,
                })
            );
        }
        socket?.close();
    };
}
