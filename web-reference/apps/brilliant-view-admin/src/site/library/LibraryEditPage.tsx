import { Button, SingleSelect, TextField } from '@brilliant/bds-core';
import type { DashboardGraphType } from '@bv/api';
import { cn } from '@bv/ui';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '~/api/service';
import { AdminJsonEditor } from '~/components/AdminJsonEditor';
import { AdminGraphPreview } from '~/components/library/AdminGraphPreview';
import { TEMPLATE_STATUSES } from '~/components/library/sharedTemplateTypes';
import type {
    AdminTemplateListing,
    TemplateStatus,
} from '~/components/library/sharedTemplateTypes';
import { useTemplate, useTemplateMutation } from '~/hooks/useTemplate';
import { isJsonObject, parseJsonObject } from '~/utils/jsonUtils';
import { asRecord } from '~/utils/typeGuards';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { AdminPageLayout } from '../../layout/AdminPageLayout';

export function LibraryEditPage() {
    const { templateId } = useParams();
    const { template } = useTemplate(templateId);
    if (template == undefined) {
        return <b>Loading...</b>;
    }
    return <LibraryEditPageForm template={template} />;
}

type TemplateForm = {
    query: Record<string, unknown>;
    display: Record<string, unknown>;
    name: string;
    type: string;
    status: TemplateStatus;
};

function LibraryEditPageForm({ template }: { template: AdminTemplateListing }) {
    const { updateTemplate } = useTemplateMutation(template.template_id);
    const [isCommitting, setIsCommiting] = useState(false);

    const form = useForm<TemplateForm>({
        defaultValues: {
            query: template.graph_query as Record<string, unknown>,
            display: template.graph_display,
            name: template.template_name,
            type: template.graph_type_name,
            status: template.template_status,
        },
    });

    const { data: graphTypes } = useQuery<DashboardGraphType[]>({
        queryKey: ['list-graph-types'] as const,
        queryFn: () =>
            apiService.getData<DashboardGraphType[]>('v1/graph_types'),
    });
    const title = useWatch({ control: form.control, name: 'name' });
    const graphQuery = useWatch({ control: form.control, name: 'query' });
    const graphType = useWatch({ control: form.control, name: 'type' });
    const graphDisplay = useWatch({ control: form.control, name: 'display' });

    function saveTemplate(form: TemplateForm) {
        setIsCommiting(true);
        void updateTemplate
            .mutateAsync({
                graph_query: form.query,
                graph_display: form.display,
                graph_type_id: graphTypes?.find((t) => t.name == form.type)?.id,
                name: form.name,
                status: form.status,
            })
            .finally(() => {
                setIsCommiting(false);
            });
    }

    return (
        <AdminPageLayout title={title}>
            <div className="flex h-full max-h-full gap-4">
                <form
                    onSubmit={form.handleSubmit(saveTemplate)}
                    className="flex max-h-full flex-1 basis-1 flex-col justify-start gap-2 overflow-y-auto"
                >
                    <div className="flex w-full items-center gap-2">
                        <div className="flex-1">
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field }) => (
                                    <TextField size="sm" {...field} />
                                )}
                            />
                        </div>
                        <div className="max-w-48 flex-1">
                            <Controller
                                name="type"
                                control={form.control}
                                render={({ field }) => (
                                    <SingleSelect
                                        options={
                                            graphTypes?.map((t) => ({
                                                label:
                                                    t.name
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                    t.name.slice(1),
                                                value: t.name,
                                            })) ?? []
                                        }
                                        {...field}
                                    />
                                )}
                            />
                        </div>
                        <div className="max-w-32 flex-1">
                            <Controller
                                name="status"
                                control={form.control}
                                render={({ field }) => (
                                    <SingleSelect
                                        options={
                                            TEMPLATE_STATUSES.map((t) => ({
                                                label:
                                                    t.charAt(0).toUpperCase() +
                                                    t.slice(1),
                                                value: t,
                                            })) ?? []
                                        }
                                        {...field}
                                    />
                                )}
                            />
                        </div>
                        <div className="flex justify-center">
                            <Button
                                size="sm"
                                leftIcon="save"
                                disabled={isCommitting}
                                type="submit"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                    <div className="basis-1">
                        <AdminJsonEditor
                            title="Graph Query"
                            json={JSON.stringify(template.graph_query)}
                            validateValue={isJsonObject}
                            onSave={(json) => {
                                const value = parseJsonObject(json);
                                if (value !== undefined) {
                                    form.setValue('query', value);
                                }
                            }}
                        />
                    </div>
                    <div className="basis-1">
                        <AdminJsonEditor
                            title="Graph Display"
                            json={JSON.stringify(template.graph_display)}
                            validateValue={isJsonObject}
                            onSave={(json) => {
                                const value = parseJsonObject(json);
                                if (value !== undefined) {
                                    form.setValue('display', value);
                                }
                            }}
                        />
                    </div>
                </form>

                <div
                    className={cn({
                        'flex max-h-full flex-1 basis-3 flex-col gap-2 overflow-y-auto':
                            true,
                        'opacity-80': isCommitting,
                    })}
                >
                    <b>Edited Template</b>
                    <AdminGraphPreview
                        graphId={null}
                        graphQuery={graphQuery}
                        graphType={graphType}
                        graphDisplay={graphDisplay}
                    />
                    <b>Current Template</b>
                    <AdminGraphPreview
                        graphId={null}
                        graphQuery={asRecord(template.graph_query)}
                        graphType={template.graph_type_name}
                        graphDisplay={template.graph_display}
                    />
                </div>
            </div>
        </AdminPageLayout>
    );
}
