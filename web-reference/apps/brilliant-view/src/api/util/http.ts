const BASE_URL = '/api';

export async function httpPost<T>(path: string, body?: unknown): Promise<T> {
    return await httpInternal<T>('POST', path, body)
        .then((response) => {
            return response;
        })
        .catch((err) => {
            throw err;
        });
}

export async function httpPut<T>(path: string, body?: unknown): Promise<T> {
    return await httpInternal<T>('PUT', path, body)
        .then((response) => {
            return response;
        })
        .catch((err) => {
            throw err;
        });
}

export async function httpDelete<T>(path: string): Promise<T> {
    return await httpInternal<T>('DELETE', path)
        .then((response) => {
            return response;
        })
        .catch((err) => {
            throw err;
        });
}

export async function httpGet<T>(path: string, params?: unknown): Promise<T> {
    // TODO better string handling of params
    const stringParams =
        params != undefined ? (params as Record<string, string>) : {};
    const urlParams = new URLSearchParams(stringParams ?? {});
    let query = urlParams.toString();
    if (query.length > 0) {
        query = `?${query}`;
    }
    return await httpInternal<T>('GET', `${path}${query}`)
        .then((response) => {
            return response;
        })
        .catch((err) => {
            throw err;
        });
}

/**
 * HTTP helper
 * Raw post function used internally
 * @param method HTTP method
 * @param path URL string
 * @param body Optional body object
 */
async function httpInternal<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown
): Promise<T> {
    const headers = getRequestHeaders();
    const url = `${BASE_URL}/${path}`;
    return await fetch(url, {
        method: method,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        headers,
    })
        .then(async (response) => {
            if (response.status >= 200 && response.status < 300) {
                return response.json() as T; // TODO validation
            }
            throw new HttpError(
                `API request failed with status code ${response.status}`,
                {
                    status: response.status,
                    url,
                    method,
                    body: await response.json(),
                }
            );
        })
        .catch((error) => {
            throw error;
        });
}

function getRequestHeaders() {
    return {
        'Content-Type': 'application/json',
    };
}

export class HttpError extends Error {
    status: number;
    url: string;
    method: string;
    body?: unknown;

    constructor(
        message: string,
        opts: {
            status: number;
            url: string;
            method: string;
            body?: unknown;
        }
    ) {
        super(message);
        this.name = 'HttpError';
        this.status = opts.status;
        this.url = opts.url;
        this.method = opts.method;
        this.body = opts.body;
    }
}
