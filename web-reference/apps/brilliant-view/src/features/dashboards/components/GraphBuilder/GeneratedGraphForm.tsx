import { Button, Icon } from '@brilliant/bds-core';
import type { GenericData } from '@bv/api';
import { cn, GraphElement } from '@bv/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateGraph } from '~/features/dashboards/hooks/useCreateGraph';
import { TruncateText } from '~/features/utility/functions';
import { useLocalize } from '~/i18n/I18nContext';
import type { PropsWithChildren } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { CreateGraphPayload } from '../../api';
import { useAxisGraphType } from '../../hooks';
import { useGraphBuilderContext } from './graphBuilderContext';

type GraphBuilderFormProps = PropsWithChildren<{
    data: GenericData;
    query: Record<string, unknown>;
    name?: string;
}>;

const NAME_MAX_LENGTH = 45;
const graphNameSchema = z.object({
    domainName: z.string().min(1).max(NAME_MAX_LENGTH),
});

type GeneratedGraphValues = z.infer<typeof graphNameSchema>;

export function GeneratedGraphForm({
    name,
    data,
    query,
}: GraphBuilderFormProps) {
    const localize = useLocalize();
    const { onClose } = useGraphBuilderContext();
    const { graphType } = useAxisGraphType();

    const placeholder =
        name ??
        data?.calculations
            .map((calculation) => calculation.label)
            .filter(Boolean)
            .join(', ');

    const form = useForm({
        values: {
            domainName: TruncateText({
                text: placeholder,
                maxLength: 40,
            }),
        },
        resolver: zodResolver(graphNameSchema),
    });

    const {
        mutateAsync: saveGeneratedGraph,
        isError,
        isPending,
    } = useCreateGraph({ scrollToCreatedGraph: true });

    function handleSaveGraph(values: GeneratedGraphValues) {
        if (!graphType) return;
        const payload: CreateGraphPayload = {
            name: values.domainName,
            query: query,
            type_id: graphType.id,
        };

        saveGeneratedGraph(payload)
            .then(() => onClose())
            .catch((err) => {
                console.error(err);
            });
    }

    return (
        <form
            className="space-y-3xl"
            onSubmit={form.handleSubmit(handleSaveGraph)}
        >
            <div className="aspect-video w-full overflow-hidden rounded-lg border border-secondary bg-primary-hover p-4">
                <div className="mb-sm flex items-center gap-2 text-secondary">
                    <Icon icon="bv:pen" className="flex-shrink-0" />
                    <Controller
                        control={form.control}
                        name="domainName"
                        render={({ field }) => (
                            <input
                                className={cn(
                                    'border-0 border-b border-solid border-primary',
                                    'uppercase bv-text-font-md-regular placeholder:text-placeholder',
                                    'overflow truncate'
                                )}
                                maxLength={40}
                                placeholder={localize(
                                    'dashboards.aiBuilder.graphName'
                                )}
                                style={{
                                    width: `${field.value.length}ch`,
                                    minWidth: `10ch`,
                                }}
                                type="text"
                                {...field}
                            />
                        )}
                    />
                </div>
                <GraphElement data={data} type="axis" />
            </div>
            {isError ? (
                <div className="flex items-center gap-2 rounded-md bg-error-primary p-2 text-error-primary bv-text-font-lg-regular">
                    <Icon icon="mdi:error-outline" />
                    <span>{localize('dashboards.aiBuilder.saveFailed')}</span>
                </div>
            ) : null}
            <div className="flex justify-end gap-md">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-max"
                    color="gray"
                    type="button"
                    onClick={onClose}
                >
                    {localize('dashboards.aiBuilder.exit')}
                </Button>
                <Button
                    size="sm"
                    type="submit"
                    isLoading={isPending}
                    disabled={!form.formState.isValid || isPending}
                >
                    {localize('dashboards.aiBuilder.save')}
                </Button>
            </div>
        </form>
    );
}
