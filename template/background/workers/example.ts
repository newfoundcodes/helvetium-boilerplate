import { defineJob } from '@newfoundcodes/helvetium-apiary';

export const exampleWorker = defineJob<{ id: string }>('example', async (job) => {
  console.log(`Processing job ${job.id}`);
});
