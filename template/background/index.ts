import { createApiary } from '@newfoundcodes/helvetium-apiary';
import { createApiaryDaemon } from '@newfoundcodes/helvetium-apiary/node';
import { FileQueueStore } from '@newfoundcodes/helvetium-apiary/stores';
import { exampleWorker } from './workers/example.js';

export const apiary = createApiary({
  store: new FileQueueStore('./var/apiary.json'),
});

export const workerDefinitions = [exampleWorker] as const;
for (const definition of workerDefinitions) {
  apiary.register(definition);
}

export const daemon = createApiaryDaemon(apiary, {
  workers: [{ count: 1 }],
});

export async function startWorkers(): Promise<void> {
  await daemon.start();
}

export async function stopWorkers(): Promise<void> {
  await daemon.stop();
}

export default apiary;
