import { graphqlFetcher } from './fetch/graphql';
import { jsonFetcher } from './fetch/json';
import { soapFetcher } from './fetch/soap';
import { loaders } from './load/definitions';
import { modelWorkers } from './model/definitions';
import { transformWorker } from './model/transform';
import { storeWorkers } from './store/definitions';
import type { WorkerDefinition } from './types';

export const workers: WorkerDefinition[] = [
    jsonFetcher,
    graphqlFetcher,
    soapFetcher,
    ...loaders,
    ...modelWorkers,
    transformWorker,
    ...storeWorkers,
];
export const workerByType = (type: string) =>
    workers.find((worker) => worker.type === type);
export const typeForWorker = (worker: string) =>
    workers.find((def) => def.worker === worker)?.type ?? worker;
