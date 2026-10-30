import { Icon } from '@brilliant/bds-core';
import { EditableTextField } from '~/features/utility/components/EditableTextField/EditableTextField';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface EditableGraphTitleProps {
    graphTitle?: string;
    displayTitle: string;
    setGraphTitle?: (graphTitle: string) => void;
    showEditIcon?: boolean;
}

interface GraphTitleForm {
    name: string;
}

export function EditableGraphTitle({
    graphTitle,
    displayTitle,
    setGraphTitle,
    showEditIcon,
}: EditableGraphTitleProps) {
    const isEditGraphMode = showEditIcon ?? false;
    const customTitle = (graphTitle ?? '').trim();

    const form = useForm<GraphTitleForm>({
        defaultValues: { name: customTitle },
    });

    useEffect(() => {
        if (form.getValues('name') !== customTitle) {
            form.reset({ name: customTitle });
        }
    }, [customTitle, form]);

    function handleSubmit(values: GraphTitleForm) {
        const trimmedName = (values.name ?? '').trim();

        if (trimmedName !== customTitle && setGraphTitle) {
            setGraphTitle(trimmedName);
        }
    }

    function handleCancel() {
        form.reset({ name: customTitle });
    }

    return (
        <div className="flex min-w-0 flex-row items-center gap-2">
            {isEditGraphMode && (
                <Icon icon="bv:pen" className="flex-shrink-0 text-secondary" />
            )}
            <EditableTextField
                control={form.control}
                inputText="name"
                placeholder={displayTitle || 'Graph title'}
                headingClassName="bv-graph-font-md-regular px-2"
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                width="20ch"
                disabled={!isEditGraphMode}
            />
        </div>
    );
}
