import axios, { isAxiosError } from 'axios';
import type { APIService, APIServiceOptions } from './types';

export function createAPIService(options: APIServiceOptions): APIService {
    const { baseUrl } = options;

    const axiosClient = buildAxiosClient(baseUrl);

    async function getData<TData>(
        endpoint: string,
        params?: Record<string, unknown>
    ): Promise<TData> {
        const response = await axiosClient.get<TData>(endpoint, {
            method: 'GET',
            params,
            paramsSerializer: {
                serialize: (nextParams) =>
                    buildQueryString(nextParams as Record<string, unknown>),
            },
        });
        return response.data;
    }

    async function postData<
        TData,
        TBody extends Record<string, unknown> | Record<string, unknown>[],
    >(endpoint: string, data: TBody): Promise<TData> {
        const response = await axiosClient.post<TData>(endpoint, data);
        if (isAxiosError(response)) {
            throw new Error(response.response?.statusText);
        }
        return response.data;
    }

    async function patchData<TData, TBody extends Record<string, unknown>>(
        endpoint: string,
        data: TBody
    ): Promise<TData> {
        const response = await axiosClient.patch<TData>(endpoint, data);
        if (isAxiosError(response)) {
            throw new Error(response.response?.statusText);
        }
        return response.data;
    }

    async function deleteData<TData, TBody extends Record<string, unknown>>(
        endpoint: string,
        data: TBody
    ): Promise<TData> {
        const response = await axiosClient.delete<TData>(endpoint, {
            data,
        });
        if (isAxiosError(response)) {
            throw new Error(response.response?.statusText);
        }
        return response.data;
    }

    return {
        getData,
        postData,
        patchData,
        deleteData,
    } as const;
}

function buildAxiosClient(baseURL: string) {
    const axiosClient = axios.create({
        baseURL,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return axiosClient;
}

function buildQueryString(params: Record<string, unknown>): string {
    const parts: string[] = [];

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        const encodedKey = encodeURIComponent(key);

        if (Array.isArray(value)) {
            value.forEach((entry) => {
                if (entry === undefined || entry === null) return;
                parts.push(
                    `${encodedKey}=${encodeURIComponent(toText(entry))}`
                );
            });
        } else {
            parts.push(`${encodedKey}=${encodeURIComponent(toText(value))}`);
        }
    });

    return parts.join('&');
}

function toText(value: unknown): string {
    if (typeof value === 'string') return value;
    if (
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'bigint'
    ) {
        return String(value);
    }
    if (value instanceof Date) return value.toISOString();

    const serialized: unknown = JSON.stringify(value);
    return typeof serialized === 'string' ? serialized : '';
}
