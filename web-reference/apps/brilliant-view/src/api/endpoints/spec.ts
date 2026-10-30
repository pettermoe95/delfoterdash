import { generatePath } from 'react-router-dom';
import { httpDelete, httpGet, httpPost, httpPut } from '../util/http';

// =================================== //
//     API Function Specifications     //
// =================================== //

export type ApiPostFunc<T, U> = (body: T) => Promise<U>;
export type ApiGetFunc<U> = () => Promise<U>;
export type ApiFuncWithId<U> = (id: number) => () => Promise<U>;
export type ApiPutFunc<T, U> = (id: number, body: T) => Promise<U>;

export function httpPostFunc<T, U>(path: string): ApiPostFunc<T, U> {
    return (body: T) => httpPost<U>(path, body);
}

export function httpDeleteFunc<U>(path: string): ApiFuncWithId<U> {
    return (id: number) => () => httpDelete<U>(generatePath(path, { id }));
}

export function httpPutFunc<T, U>(path: string): ApiPutFunc<T, U> {
    return (id: number, body: T) =>
        httpPut<U>(generatePath(path, { id }), body);
}
export function httpGetFunc<U>(path: string): ApiGetFunc<U> {
    return () => httpGet<U>(path, {});
}

export function httpGetFuncWithId<U>(path: string): ApiFuncWithId<U> {
    return (id: number) => () => httpGet<U>(generatePath(path, { id }));
}
