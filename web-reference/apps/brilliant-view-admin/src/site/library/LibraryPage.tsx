import { LibraryTemplateDetails } from '~/components/library/TemplateDetails';
import { useState } from 'react';
import { SharedTemplatesTable } from '../../components/library/SharedTemplatesTable';
import type { AdminTemplateListing } from '../../components/library/sharedTemplateTypes';
import { AdminPageLayout } from '../../layout/AdminPageLayout';

export function LibraryPage() {
    const [preview, setPreview] = useState<AdminTemplateListing>();
    return (
        <AdminPageLayout title="Graph Library" innerClass="">
            <div className="flex h-full max-h-full max-w-full gap-4">
                <div className="flex max-w-3xl flex-1 flex-col overflow-y-auto border-r border-gray-200 p-4">
                    <SharedTemplatesTable
                        onSelect={(template) => setPreview(template)}
                    />
                </div>
                <div
                    className="flex h-full max-h-full flex-1 overflow-y-auto p-4"
                    key={preview?.template_id}
                >
                    {preview && <LibraryTemplateDetails template={preview} />}
                    {!preview && <i>No selection</i>}
                </div>
            </div>
        </AdminPageLayout>
    );
}
