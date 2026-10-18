import { createApiary, MemoryQueueStore } from '@newfoundcodes/helvetium-apiary';
import { exampleWorker } from './workers/example.js';

export const apiary = createApiary({
  store: new MemoryQueueStore(),
});

apiary.register(exampleWorker);

export default apiary;
