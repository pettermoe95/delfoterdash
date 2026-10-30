import type { QueryKey } from '@tanstack/react-query';
import { API } from '~/api';
import { env } from '~/config/env.ts';
import { queryClient } from '~/config/queryClient';

type QueryPayload = Record<string, unknown>;

type QuerySubscribedMessage = {
    type: 'subscribed.query';
    subscriptionKey: string;
    externalRef: string;
};

type QueryDataMessage<TData = unknown> = {
    type: 'query_data';
    subscriptionKey: string;
    data: TData;
};

type QueryErrorMessage = {
    type: 'error';
    message: string;
    externalRef: string;
};

type SubscriptionMessage<TData = unknown> =
    | QuerySubscribedMessage
    | QueryDataMessage<TData>
    | QueryErrorMessage;

type QueryEntry<TData = unknown> = {
    cacheKey: string;
    externalRef: string;
    queryKey: QueryKey;
    query: QueryPayload;
    consumers: number;
    subscriptionKey?: string;
    subscribePending: boolean;
    initialDataPromise: Promise<TData>;
    resolveInitialData: (data: TData) => void;
    rejectInitialData: (error: Error) => void;
    hasSettledInitialData: boolean;
    latestData?: TData;
    isError: boolean;
};

class QuerySubscriptionManager {
    private socket: WebSocket | null = null;
    private connectPromise: Promise<void> | null = null;
    private reconnectTimeoutId: number | null = null;
    private readonly entries = new Map<string, QueryEntry>();
    private readonly externalRefToCacheKey = new Map<string, string>();
    private readonly subscriptionKeyToCacheKey = new Map<string, string>();

    subscribe(queryKey: QueryKey, query: QueryPayload) {
        const entry = this.getOrCreateEntry(queryKey, query);
        entry.consumers += 1;
        void this.ensureConnected()
            .then(() => this.subscribeEntry(entry))
            .catch((error) => {
                console.error('Failed to establish query websocket', error);
            });
    }

    unsubscribe(queryKey: QueryKey) {
        const cacheKey = this.serializeQueryKey(queryKey);
        const entry = this.entries.get(cacheKey);

        if (!entry) {
            return;
        }

        entry.consumers = Math.max(0, entry.consumers - 1);
        if (entry.consumers > 0) {
            return;
        }

        if (entry.subscriptionKey && this.isSocketOpen()) {
            this.send({
                command: 'unsubscribe.query',
                subscriptionKey: entry.subscriptionKey,
            });
        }

        this.cleanupEntry(entry);
        this.closeSocketIfIdle();
    }

    /**
     * Get data when it is received from the server. Does not initiate data fetching.
     * @param queryKey
     * @param query
     * @param signal
     */
    async waitForInitialData<TData>(
        queryKey: QueryKey,
        query: QueryPayload,
        signal?: AbortSignal
    ): Promise<TData> {
        const cacheKey = this.serializeQueryKey(queryKey);
        const cachedData = queryClient.getQueryData<TData>(queryKey);

        if (cachedData !== undefined) {
            return cachedData;
        }

        const entry = this.getOrCreateEntry<TData>(queryKey, query);

        if (entry.latestData !== undefined) {
            return entry.latestData;
        }

        if (signal?.aborted) {
            throw new DOMException('Query subscription aborted', 'AbortError');
        }

        await this.ensureConnected();

        const pendingEntry = this.entries.get(cacheKey) as
            | QueryEntry<TData>
            | undefined;
        if (!pendingEntry) {
            throw new DOMException('Query subscription aborted', 'AbortError');
        }

        this.subscribeEntry(pendingEntry);

        return new Promise<TData>((resolve, reject) => {
            const abortHandler = () => {
                signal?.removeEventListener('abort', abortHandler);
                reject(
                    new DOMException('Query subscription aborted', 'AbortError')
                );
            };

            pendingEntry.initialDataPromise.then(
                (data) => {
                    signal?.removeEventListener('abort', abortHandler);
                    resolve(data);
                },
                (error) => {
                    signal?.removeEventListener('abort', abortHandler);
                    pendingEntry.isError = true;
                    reject(
                        error instanceof Error
                            ? error
                            : new Error('Query subscription failed')
                    );
                }
            );

            signal?.addEventListener('abort', abortHandler, { once: true });
        });
    }

    private getOrCreateEntry<TData>(
        queryKey: QueryKey,
        query: QueryPayload
    ): QueryEntry<TData> {
        const cacheKey = this.serializeQueryKey(queryKey);
        const existingEntry = this.entries.get(cacheKey) as
            | QueryEntry<TData>
            | undefined;

        if (existingEntry) {
            return existingEntry;
        }

        let resolveInitialData!: (data: TData) => void;
        let rejectInitialData!: (error: Error) => void;

        const initialDataPromise = new Promise<TData>((resolve, reject) => {
            resolveInitialData = resolve;
            rejectInitialData = reject;
        });

        const entry: QueryEntry<TData> = {
            cacheKey,
            externalRef:
                globalThis.crypto?.randomUUID?.() ??
                `query-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            queryKey,
            query,
            consumers: 0,
            subscribePending: false,
            initialDataPromise,
            resolveInitialData,
            rejectInitialData,
            hasSettledInitialData: false,
            isError: false,
        };

        this.entries.set(cacheKey, entry as QueryEntry);
        this.externalRefToCacheKey.set(entry.externalRef, cacheKey);

        return entry;
    }

    private async ensureConnected() {
        if (this.isSocketOpen()) {
            return;
        }

        if (this.connectPromise) {
            return this.connectPromise;
        }

        this.connectPromise = this.openSocket();

        try {
            await this.connectPromise;
        } finally {
            this.connectPromise = null;
        }
    }

    private async openSocket() {
        const { token } = await API.getWebSocketToken();

        await new Promise<void>((resolve, reject) => {
            const socket = new WebSocket(this.buildSocketUrl(token));
            let settled = false;

            socket.onopen = () => {
                settled = true;
                this.socket = socket;
                this.flushSubscriptions();
                resolve();
            };

            socket.onmessage = (event) => {
                if (typeof event.data === 'string') {
                    this.handleMessage(event.data);
                }
            };

            socket.onerror = () => {
                if (!settled) {
                    settled = true;
                    reject(new Error('Failed to establish query websocket'));
                }
            };

            socket.onclose = () => {
                const wasActiveSocket = this.socket === socket;

                if (wasActiveSocket) {
                    this.socket = null;
                }

                this.resetServerSubscriptionState();
                this.scheduleReconnect();

                if (!settled) {
                    settled = true;
                    reject(new Error('Failed to establish query websocket'));
                }
            };
        });
    }

    private flushSubscriptions() {
        this.entries.forEach((entry) => {
            if (entry.consumers > 0) {
                this.subscribeEntry(entry);
            }
        });
    }

    private subscribeEntry<TData>(entry: QueryEntry<TData>) {
        if (
            entry.consumers === 0 ||
            !this.isSocketOpen() ||
            entry.subscriptionKey ||
            entry.subscribePending
        ) {
            return;
        }

        entry.subscribePending = true;
        this.send({
            command: 'subscribe.query',
            externalRef: entry.externalRef,
            query: entry.query,
        });
    }

    private handleMessage(rawMessage: string) {
        let message: SubscriptionMessage;

        try {
            message = JSON.parse(rawMessage) as SubscriptionMessage;
        } catch (error) {
            console.error('Could not parse query websocket message', error, {
                rawMessage,
            });
            return;
        }

        if (message.type === 'subscribed.query') {
            const cacheKey = this.externalRefToCacheKey.get(
                message.externalRef
            );
            if (!cacheKey) {
                return;
            }

            const entry = this.entries.get(cacheKey);
            if (!entry) {
                return;
            }

            entry.subscribePending = false;
            entry.subscriptionKey = message.subscriptionKey;
            this.subscriptionKeyToCacheKey.set(
                message.subscriptionKey,
                cacheKey
            );
            return;
        }

        if (message.type === 'error') {
            const cacheKey = this.externalRefToCacheKey.get(
                message.externalRef
            );
            if (!cacheKey) {
                return;
            }

            const entry = this.entries.get(cacheKey);
            if (!entry) {
                return;
            }

            entry.subscribePending = false;

            if (!entry.hasSettledInitialData) {
                entry.hasSettledInitialData = true;
                entry.isError = true;
                entry.rejectInitialData(new Error(message.message));
            }

            return;
        }

        if (message.type === 'query_data') {
            const cacheKey = this.subscriptionKeyToCacheKey.get(
                message.subscriptionKey
            );
            if (!cacheKey) {
                return;
            }

            const entry = this.entries.get(cacheKey);
            if (!entry) {
                return;
            }

            entry.latestData = message.data;
            queryClient.setQueryData(entry.queryKey, message.data);

            if (!entry.hasSettledInitialData) {
                entry.hasSettledInitialData = true;
                entry.resolveInitialData(message.data);
            }
        }
    }

    private scheduleReconnect() {
        if (this.reconnectTimeoutId || this.entries.size === 0) {
            return;
        }

        this.reconnectTimeoutId = window.setTimeout(() => {
            this.reconnectTimeoutId = null;

            if (this.entries.size === 0) {
                return;
            }

            void this.ensureConnected().catch((error) => {
                console.error('Failed to reconnect query websocket', error);
                this.scheduleReconnect();
            });
        }, 1000);
    }

    private resetServerSubscriptionState() {
        this.subscriptionKeyToCacheKey.clear();
        this.entries.forEach((entry) => {
            entry.subscriptionKey = undefined;
            entry.subscribePending = false;
        });
    }

    private closeSocketIfIdle() {
        if (this.entries.size > 0) {
            return;
        }

        if (this.reconnectTimeoutId) {
            window.clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
        }

        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    private cleanupEntry(entry: QueryEntry) {
        this.entries.delete(entry.cacheKey);
        this.externalRefToCacheKey.delete(entry.externalRef);

        if (entry.subscriptionKey) {
            this.subscriptionKeyToCacheKey.delete(entry.subscriptionKey);
        }
    }

    private send(payload: Record<string, unknown>) {
        if (!this.isSocketOpen()) {
            return;
        }

        this.socket?.send(JSON.stringify(payload));
    }

    private isSocketOpen() {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    private serializeQueryKey(queryKey: QueryKey) {
        return JSON.stringify(queryKey);
    }

    private buildSocketUrl(token: string) {
        const websocketUrl = new URL(env.apiBaseUrl);

        websocketUrl.protocol =
            websocketUrl.protocol === 'https:' ? 'wss:' : 'ws:';
        websocketUrl.pathname = '/ws';
        websocketUrl.searchParams.set('token', token);

        return websocketUrl.toString();
    }
}

export const querySubscriptionManager = new QuerySubscriptionManager();
