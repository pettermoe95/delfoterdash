import { atom, useAtomValue, useSetAtom } from 'jotai';

type BreadcrumbMap = Record<string, string>;

const breadcrumbsMapAtom = atom<BreadcrumbMap>({});

export const useBreadcrumbsMap = () => useAtomValue(breadcrumbsMapAtom);

type SetBreadcrumbMappingPayload = {
    key: (string | number)[];
    value: string;
};
const setBreadcrumbMappingAtom = atom(
    null,
    (_get, set, payload: SetBreadcrumbMappingPayload) => {
        const pathKey = queryKeyToPath(payload.key);
        return set(breadcrumbsMapAtom, (state) => ({
            ...state,
            [pathKey]: payload.value,
        }));
    }
);

export function queryKeyToPath(key: (string | number)[]) {
    return '/' + key.map((value) => value.toString()).join('/');
}

export const useSetBreadcrumbMapping = () =>
    useSetAtom(setBreadcrumbMappingAtom);
