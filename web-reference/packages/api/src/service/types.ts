export type APIService = {
    getData: <
        TData,
        TParams extends Record<string, unknown> = Record<string, unknown>,
    >(
        endpoint: string,
        params?: TParams
    ) => Promise<TData>;
    postData: <
        TData,
        TBody extends Record<string, unknown> | Record<string, unknown>[],
    >(
        endpoint: string,
        data: TBody
    ) => Promise<TData>;
    patchData: <TData, TBody extends Record<string, unknown>>(
        endpoint: string,
        data: TBody
    ) => Promise<TData>;
    deleteData: <TData, TBody extends Record<string, unknown>>(
        endpoint: string,
        data: TBody
    ) => Promise<TData>;
};

export type PatchPayload<TBody extends Record<string, unknown>> = {
    id: string;
    data: TBody;
};

export type APIServiceOptions = {
    baseUrl: string;
    handleError?: (error: unknown) => void;
};
