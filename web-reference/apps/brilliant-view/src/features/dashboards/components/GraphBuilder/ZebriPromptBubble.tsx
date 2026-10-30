import { cn, cva, Icon } from '@brilliant/bds-core';
import type { MutationStatus } from '@tanstack/react-query';
import zebriSrc from '~/assets/wizardsquare.png';
import { useLocalize } from '~/i18n/I18nContext';
import { useState } from 'react';

type ZebriPromptProps = {
    response?: string;
    status?: MutationStatus;
    updatePrompt?: boolean;
    description?: string;
};

const zebriPromptStyles = cva('bg-tertiary text-secondary dark:bg-active', {
    variants: {
        status: {
            idle: '',
            error: 'bg-warning-primary text-warning-primary dark:bg-primary-warning-600 dark:text-primary-warning-100',
            success: 'bg-brand-primary',
            pending: '',
        } satisfies Record<MutationStatus, string>,
    },
    defaultVariants: {
        status: 'idle',
    },
});

export function ZebriPromptBubble({
    response,
    status,
    description,
    updatePrompt = false,
}: ZebriPromptProps) {
    const localize = useLocalize();
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = () => setIsOpen(!isOpen);

    const text = getZebriPromptText(response, status, localize, updatePrompt);
    const textContainerClasses = zebriPromptStyles({ status });

    return (
        <div className="flex gap-3xl">
            <img src={zebriSrc} className="h-24" />
            <div
                className={cn(
                    'relative w-full rounded-xl px-2xl py-xl bv-text-font-sm-regular',
                    textContainerClasses
                )}
            >
                {' '}
                <div className="items-start gap-3xl">
                    <div>{text}</div>
                    <div
                        className={cn(
                            'absolute -z-10 h-4 w-4 rotate-45',
                            'translate-y-[-50% -left-0 top-[calc(50%-8px)] translate-x-[-50%]',
                            textContainerClasses
                        )}
                    />
                </div>{' '}
                <div className="ml-1 mt-4 flex items-center">
                    {description && (
                        <div className="mt-2">
                            <div
                                className="flex cursor-pointer items-center"
                                onClick={toggleOpen}
                            >
                                <p className="text-xs font-semibold">
                                    {localize('miscTerms.description')}
                                </p>{' '}
                                <Icon
                                    icon={
                                        isOpen
                                            ? 'mdi:chevron-up'
                                            : 'mdi:chevron-down'
                                    }
                                    className="text-lg font-bold"
                                />
                            </div>
                            {isOpen && (
                                <p className="mt-2 text-xs">{description}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getZebriPromptText(
    response: string | undefined,
    status: MutationStatus | undefined,
    localize: (key: string) => string,
    updatePrompt?: boolean
) {
    if (!status || status === 'idle')
        return !updatePrompt
            ? localize('dashboards.aiBuilder.hey1')
            : localize('dashboards.aiBuilder.hey2');
    if (status === 'pending')
        return (
            <Icon
                icon="svg-spinners:3-dots-scale"
                className="text-fg-quinary"
                fontSize={30}
            />
        );
    if (status === 'success')
        return (
            <div className="flex items-center gap-2">
                <Icon
                    icon="bv:check-circle-feedback"
                    className="flex-shrink-0 text-xl"
                />
                <span>{response}</span>
            </div>
        );
    if (status === 'error')
        return (
            <div className="flex items-center gap-2">
                <div>
                    <span>
                        {response != undefined
                            ? `${response}, ${localize('dashboards.aiBuilder.sorry1')}`
                            : localize('dashboards.aiBuilder.sorry2')}
                    </span>
                </div>
            </div>
        );
    return response;
}
