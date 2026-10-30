import { Icon } from '@brilliant/bds-core';
import type { GraphPromptResponse } from '../../api';
import { useGraphDataQuery } from '../../hooks/useGraphDataQuery';
import { GeneratedGraphForm } from './GeneratedGraphForm';

type GraphPreviewProps = {
    response?: GraphPromptResponse;
};

export function GeneratedGraphView({ response }: GraphPreviewProps) {
    if (!response?.query || !response.graph_title) return null;
    return (
        <GraphQueryLoader
            name={response.graph_title ?? ''} // TODO: Should not even get here if we got no title in response
            query={response.query}
        />
    );
}

type GraphQueryLoaderProps = {
    query: Record<string, unknown>;
    name?: string;
};

function GraphQueryLoader({ name, query }: GraphQueryLoaderProps) {
    const { data, isLoading, isError } = useGraphDataQuery(query);

    if (isLoading && !data)
        return (
            <div className="flex items-center gap-sm bv-text-font-md-regular">
                <Icon icon="bv:loading" className="animate-spin" />
                <span>Loading data</span>
            </div>
        );

    if (isError)
        return (
            <div className="flex items-center gap-sm text-error-primary bv-text-font-md-regular">
                Could not create graph from query
            </div>
        );

    // Add null check for data before rendering GeneratedGraphForm
    if (!data) {
        return (
            <div className="flex items-center gap-sm text-error-primary bv-text-font-md-regular">
                No data available
            </div>
        );
    }

    return <GeneratedGraphForm data={data} name={name} query={query} />;
}
