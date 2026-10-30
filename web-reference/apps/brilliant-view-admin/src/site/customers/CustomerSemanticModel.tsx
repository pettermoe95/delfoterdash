import { ReactFlowProvider } from '@xyflow/react';
import { SemanticModelEditor } from './SemanticModel/SemanticModelEditor';
import '@xyflow/react/dist/style.css';

interface CustomerSemanticModelProps {
    tenantId: string;
}

export function CustomerSemanticModel({
    tenantId,
}: CustomerSemanticModelProps) {
    return (
        <div className="flex h-full min-h-[700px] flex-col gap-4 pt-xl">
            <p className="text-sm text-tertiary">
                Define the business roles and directed relationships used to
                join this customer’s warehouse data.
            </p>
            <ReactFlowProvider key={tenantId}>
                <SemanticModelEditor tenantId={tenantId} />
            </ReactFlowProvider>
        </div>
    );
}
