import { Button, Icon, TextField } from '@brilliant/bds-core';
import { cn } from '@bv/ui';
import { AdminGraphPreview } from '~/components/library/AdminGraphPreview';
import { env } from '~/config/env';
import { AdminPageLayout } from '~/layout/AdminPageLayout';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

type MessageRole = 'assistant' | 'user';

type AssistantMessageEvent = {
    event_type: 'message';
    role: MessageRole;
    content: string;
};
type AssistantGraphEvent = {
    event_type: 'graph';
    message: string;
    query: Record<string, unknown>;
};
type AssistantStatusEvent = {
    event_type: 'status';
    loading: boolean;
};
type AssistantEvent =
    | AssistantMessageEvent
    | AssistantGraphEvent
    | AssistantStatusEvent;

type AssistantMessageRequest = {
    event_type: 'message';
    content: string;
};
type AssistantRequest = AssistantMessageRequest;

type Message = {
    id: number;
    role: MessageRole;
    content: string;
    query?: Record<string, unknown>;
};

function isAssistantEvent(value: unknown): value is AssistantEvent {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const eventType = (value as { event_type?: unknown }).event_type;
    return (
        eventType === 'message' ||
        eventType === 'graph' ||
        eventType === 'status'
    );
}

export function AssistantPage() {
    const [userInput, setUserInput] = useState('');

    const socketRef = useRef<WebSocket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleEvent = useCallback((event: AssistantEvent) => {
        if (event.event_type === 'message') {
            setMessages((messages) => [
                {
                    role: event.role,
                    content: event.content,
                    id: messages.length,
                },
                ...messages,
            ]);
        }
        if (event.event_type === 'graph') {
            setMessages((messages) => [
                {
                    role: 'assistant',
                    query: event.query,
                    content: event.message,
                    id: messages.length,
                },
                ...messages,
            ]);
        }
        if (event.event_type === 'status') {
            setIsLoading(event.loading);
        }
    }, []);

    function sendRequest(request: AssistantRequest) {
        const data = JSON.stringify(request);
        socketRef.current?.send(data);
    }

    useEffect(() => {
        if (socketRef.current != null) {
            return;
        }
        const baseUrl = env.apiBaseUrl
            .replace('https://', 'wss://')
            .replace('http://', 'ws://');
        const websocket = new WebSocket(`${baseUrl}/v1/llm/chat`);
        websocket.addEventListener('open', (_event) => {
            socketRef.current = websocket;
        });
        websocket.addEventListener('message', (event) => {
            try {
                const data: unknown = JSON.parse(String(event.data));
                if (isAssistantEvent(data)) {
                    handleEvent(data);
                }
            } catch {
                return;
            }
        });
        return () => {
            socketRef.current = null;
            websocket.close();
        };
    }, [handleEvent]);

    return (
        <AdminPageLayout title="Assistant">
            <div className="flex max-h-full max-w-6xl flex-1 flex-col">
                <div className="flex h-full w-full flex-col-reverse gap-4 overflow-y-auto p-8">
                    {isLoading && (
                        <Bubble
                            assistant
                            key={`loading-${messages.length + 1}`}
                        >
                            <Icon
                                icon="svg-spinners:3-dots-bounce"
                                fontSize={30}
                                opacity={0.5}
                            />
                        </Bubble>
                    )}
                    {messages.map((msg) => {
                        const assistant = msg.role == 'assistant';
                        return (
                            <div className="flex flex-col gap-2" key={msg.id}>
                                <Bubble assistant={assistant}>
                                    {msg.content}
                                </Bubble>
                                {msg.query != null && (
                                    <Bubble assistant={assistant} content>
                                        <div style={{ height: '400px' }}>
                                            <AdminGraphPreview
                                                graphType="axis"
                                                graphQuery={msg.query}
                                            />
                                        </div>
                                    </Bubble>
                                )}
                            </div>
                        );
                    })}
                </div>
                <form
                    className="mt-4 flex justify-stretch gap-4"
                    onSubmit={(evt) => {
                        evt.preventDefault();
                        sendRequest({
                            event_type: 'message',
                            content: userInput,
                        });
                        setUserInput('');
                    }}
                >
                    <div className="flex-1">
                        <TextField
                            key={messages.length}
                            name="name"
                            value={userInput}
                            autoComplete="off"
                            onChange={(v) => {
                                setUserInput(v.currentTarget.value);
                            }}
                        />
                    </div>
                    <Button type="submit">Send</Button>
                </form>
            </div>
        </AdminPageLayout>
    );
}

export function Bubble(props: {
    assistant?: boolean;
    content?: boolean;
    children: ReactNode;
}) {
    return (
        <div
            className={cn({
                flex: true,
                'flex-row-reverse': !props.assistant,
            })}
        >
            <div
                className={cn({
                    'max-w-2xl rounded-lg px-4 py-3 text-lg': !props.content,
                    'ml-6 bg-blue-100': !props.assistant && !props.content,
                    'mr-6 bg-gray-200': props.assistant && !props.content,
                    'w-full max-w-2xl': props.content,
                })}
            >
                {props.children}
            </div>
        </div>
    );
}
