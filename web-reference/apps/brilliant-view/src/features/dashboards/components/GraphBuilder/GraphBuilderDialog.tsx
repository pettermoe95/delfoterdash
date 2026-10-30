import {
    Chip,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Textarea,
    useOverlayContainer,
} from '@brilliant/bds-core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY } from '~/api/queryKeys';
import { useLocalize } from '~/i18n/I18nContext';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import type { GraphPromptValues } from '../../api';
import { graphPromptSchema } from '../../api';
import { useDashboardId } from '../../hooks';
import { GeneratedGraphView } from './GeneratedGraphView';
import { GenerateGraphButton } from './GenerateGraphButton';
import { GraphBuilderProvider } from './graphBuilderContext';
import { GraphBuilderUserGuide } from './GraphBuilderUserGuide';
import { useGraphBuilderPrompt } from './useGraphBuilderPrompt';
import { ZebriPromptBubble } from './ZebriPromptBubble';

export function GraphBuilderDialog({
    isOpen,
    setOpenGraphBuilder,
}: GraphBuilderElementProps) {
    if (!isOpen) return null;

    return (
        <GraphBuilderDialogInner
            isOpen={isOpen}
            setOpenGraphBuilder={setOpenGraphBuilder}
        />
    );
}

type GraphBuilderElementProps = {
    isOpen: boolean;
    setOpenGraphBuilder: React.Dispatch<React.SetStateAction<boolean>>;
};

function GraphBuilderDialogInner({
    isOpen,
    setOpenGraphBuilder,
}: GraphBuilderElementProps) {
    const localize = useLocalize();
    const queryClient = useQueryClient();
    const dashboardId = useDashboardId();
    const overlayContainer = useOverlayContainer();
    const [isGuideOpen, setGuideOpen] = useState(true);

    function handleOpenChange() {
        setOpenGraphBuilder(false);
        setGuideOpen(false);
        void queryClient.invalidateQueries({
            queryKey: [QUERY_KEY.DASHBOARD, dashboardId] as const,
        });
    }

    const { sendPrompt, isLoading, data, status } = useGraphBuilderPrompt();

    const form = useForm<GraphPromptValues>({
        defaultValues: {
            prompt: '',
        },
        resolver: zodResolver(graphPromptSchema),
    });

    function handleSubmit(values: GraphPromptValues) {
        sendPrompt(values.prompt).catch((err) => {
            console.error(err);
        });
    }

    function handleEnterSubmit(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        const enterPressed = !e.shiftKey && e.key === 'Enter';
        if (!enterPressed) return;
        e.preventDefault();
        handleSubmit(form.getValues());
    }

    return (
        <GraphBuilderProvider value={{ onClose: handleOpenChange }}>
            {isGuideOpen &&
                createPortal(
                    <div className="user-guide pointer-events-auto fixed right-0 top-0 z-[9999] h-full w-[380px] select-text overflow-y-auto bg-primary p-6 shadow-lg">
                        <GraphBuilderUserGuide
                            onClose={() => setGuideOpen(false)}
                        />
                    </div>,
                    overlayContainer ?? document.body
                )}
            <div className="fixed z-40 flex items-center justify-center">
                <Dialog
                    open={isOpen}
                    onOpenChange={handleOpenChange}
                    modal={true}
                >
                    <DialogContent
                        className="max-w-[200px] lg:max-w-screen-sm"
                        onPointerDownOutside={(event) => {
                            if (
                                (event.target as HTMLElement)?.closest(
                                    '.user-guide'
                                )
                            ) {
                                event.preventDefault();
                            }
                        }}
                    >
                        <DialogHeader>
                            <div className="flex">
                                <DialogTitle>
                                    {localize('dashboards.aiBuilder.header')}
                                </DialogTitle>
                                <Chip
                                    text="Beta"
                                    className="ml-4 rounded-xs border-brand-secondary-solid bg-brand-secondary-alt px-4 py-0"
                                />
                            </div>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(handleSubmit)}>
                            <div className="flex flex-col space-y-3xl">
                                <Textarea
                                    placeholder={localize(
                                        'dashboards.aiBuilder.describe'
                                    )}
                                    {...form.register('prompt')}
                                    onKeyDown={handleEnterSubmit}
                                />

                                <GenerateGraphButton
                                    disabled={!form.formState.isValid}
                                    isLoading={isLoading}
                                />
                            </div>
                        </form>
                        <div className="space-y-3xl">
                            <ZebriPromptBubble
                                response={data?.message}
                                description={data?.description}
                                status={status}
                            />
                            <GeneratedGraphView response={data} />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </GraphBuilderProvider>
    );
}
