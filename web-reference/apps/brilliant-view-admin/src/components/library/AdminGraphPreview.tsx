import type { GenericData } from '@bv/api';
import { cn, GraphElement } from '@bv/ui';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '~/api/service';
import type { AxiosError } from 'axios';
import ReactAce from 'react-ace/lib/ace';

type AdminGraphPreviewProps = {
    graphId?: number | null;
    graphQuery?: Record<string, unknown> | null;
    graphType: string;
    graphDisplay?: Record<string, unknown>;
};
export function AdminGraphPreview({
    graphId: graph_id = null,
    graphQuery: graph_query = null,
    graphType: graph_type,
    graphDisplay: graph_display,
}: AdminGraphPreviewProps) {
    const enabled = graph_id != null || graph_query != null;
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['query', graph_id ?? JSON.stringify(graph_query)] as const,
        queryFn: () => {
            if (graph_query != null) {
                return apiService.postData<
                    GenericData,
                    Record<string, unknown>
                >('/v1/query/data', graph_query);
            } else {
                return null;
            }
        },
        retry: false,
        enabled: graph_id != null || graph_query != null,
        placeholderData: (previousData) => previousData,
    });

    const axiosError = error as AxiosError;
    return (
        <div
            className={cn({
                'h-full w-full rounded-lg border border-gray-300 bg-white p-4':
                    true,
                'border-2 border-red-500': isError,
                'opacity-50': isLoading,
                'overflow-hidden': true,
            })}
        >
            {!enabled && <b>No query</b>}
            {isError && (
                <div className="flex-1 overflow-y-auto">
                    <ReactAce
                        value={JSON.stringify(
                            axiosError.response?.data,
                            null,
                            2
                        )}
                        mode="json"
                        theme="tomorrow"
                        editorProps={{ readOnly: true, maxLines: 10 }}
                    />
                </div>
            )}
            {isLoading && !data && <span>Loading...</span>}
            {data && !isError && (
                <GraphElement
                    type={graph_type}
                    display={graph_display}
                    data={data}
                />
            )}
        </div>
    );
}
