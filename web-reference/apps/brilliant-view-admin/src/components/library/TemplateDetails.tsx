import { Button } from '@brilliant/bds-core';
import { APP_ROUTES } from '~/routes/routes';
import { asRecord } from '~/utils/typeGuards';
import { generatePath, useNavigate } from 'react-router-dom';
import { AdminJsonEditor } from '../AdminJsonEditor';
import { AdminObjectEntriesDisplay } from '../AdminObjectEntriesDisplay';
import { AdminGraphPreview } from './AdminGraphPreview';
import type { AdminTemplateListing } from './sharedTemplateTypes';

export function LibraryTemplateDetails({
    template,
}: {
    template: AdminTemplateListing;
}) {
    const navigate = useNavigate();
    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="mb-3 flex justify-between">
                <h3 className="font-bold bv-display-font-sm-regular">
                    {template.template_name}
                </h3>
                <Button
                    size="sm"
                    leftIcon={'mdi:pencil'}
                    onClick={() => {
                        navigate(
                            generatePath(APP_ROUTES.library_edit_template, {
                                templateId: template.template_id.toString(),
                            })
                        );
                    }}
                >
                    Edit Template
                </Button>
            </div>
            <AdminObjectEntriesDisplay
                object={template}
                omit={['graph_query', 'graph_display']}
            />
            {template.graph_query != null && (
                <div style={{ minHeight: '250px' }}>
                    <AdminGraphPreview
                        graphQuery={asRecord(template.graph_query)}
                        graphType={template.graph_type_name}
                        graphDisplay={template.graph_display}
                    />
                </div>
            )}
            <AdminJsonEditor
                title="Query"
                json={JSON.stringify(template.graph_query)}
                enabled={false}
            />
            <AdminJsonEditor
                title="Display"
                json={JSON.stringify(template.graph_display)}
                enabled={false}
            />
        </div>
    );
}
