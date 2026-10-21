const { loadEnvironment } = await import('../src/config/env.ts');
try {
  loadEnvironment();
} catch {}

const { Worker } = await import('@newfoundcodes/helvetium-apiary');
const { apiary, daemon, workerDefinitions } = await import('../background/index.ts');

const rawArguments = process.argv.slice(2);
const json = rawArguments.includes('--json');
const argumentsList = rawArguments.filter((argument) => argument !== '--json');
const command = argumentsList.shift() ?? 'list';

function output(value, fallback = '') {
  if (json) {
    console.log(JSON.stringify(value, null, 2));
    return;
  }

  console.log(typeof value === 'string' ? value : fallback || JSON.stringify(value, null, 2));
}

function payload(value) {
  if (value === undefined) {
    return {};
  }

  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`Payload must be valid JSON: ${value}`);
  }
}

function option(name) {
  const prefix = `--${name}=`;
  const value = rawArguments.find((argument) => argument.startsWith(prefix));
  return value?.slice(prefix.length);
}

function apiaryUrl() {
  const configured = process.env.HELVETIUM_APIARY_URL;
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const host = process.env.HOST === '0.0.0.0' ? '127.0.0.1' : (process.env.HOST ?? '127.0.0.1');
  return `http://${host}:${process.env.PORT ?? '3000'}/internal/apiary`;
}

function headers() {
  return process.env.APIARY_ADMIN_TOKEN
    ? { authorization: `Bearer ${process.env.APIARY_ADMIN_TOKEN}` }
    : {};
}

async function remoteRequest(path, init = {}) {
  try {
    const response = await fetch(`${apiaryUrl()}${path}`, {
      ...init,
      headers: { ...headers(), ...(init.headers ?? {}) },
    });

    if (response.status === 401) {
      throw new Error('The running project rejected the APIARY_ADMIN_TOKEN.');
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('APIARY_ADMIN_TOKEN')) {
      throw error;
    }

    return undefined;
  }
}

async function remoteJson(path, init) {
  const response = await remoteRequest(path, init);
  if (!response || response.status === 404) {
    return undefined;
  }

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error ?? `Apiary request failed with status ${response.status}`);
  }

  return body;
}

async function enqueueLocal(name, value) {
  const queue = option('queue');
  return apiary.add(name, payload(value), queue ? { queue } : undefined);
}

async function waitForCompletion(id, timeout = 30_000) {
  const end = Date.now() + timeout;
  for (;;) {
    const job = await apiary.require(id);
    if (['completed', 'failed', 'dead', 'cancelled'].includes(job.state)) {
      return job;
    }

    if (Date.now() >= end) {
      throw new Error(`Timed out waiting for job ${id}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

async function main() {
  if (command === 'list') {
    const remote = await remoteJson('/health');
    const definitions = remote?.definitions ?? workerDefinitions.map((worker) => worker.name);
    output({ workers: definitions }, definitions.join('\n') || 'No registered workers.');
    return;
  }

  if (command === 'jobs') {
    const remote = await remoteJson(
      `/jobs${option('queue') ? `?queue=${encodeURIComponent(option('queue'))}` : ''}`,
    );
    const jobs = remote ?? (await apiary.list({ queue: option('queue') }));
    output(jobs, jobs.map((job) => `${job.id} ${job.name} ${job.state}`).join('\n'));
    return;
  }

  const name = argumentsList[0];
  if (command === 'trigger') {
    if (!name) {
      throw new Error('worker trigger requires a worker name');
    }

    const body = {
      name,
      payload: payload(argumentsList[1]),
      options: option('queue') ? { queue: option('queue') } : undefined,
    };
    const remote = await remoteJson('/jobs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const job = remote ?? (await enqueueLocal(name, argumentsList[1]));
    output(job, `Queued ${job.name} (${job.id}) in ${job.queue}.`);
    return;
  }

  if (command === 'run') {
    if (!name) {
      throw new Error('worker run requires a worker name');
    }

    const job = await enqueueLocal(name, argumentsList[1]);
    const worker = new Worker(apiary, { id: `helvet-${process.pid}`, queues: [job.queue] });
    await worker.runOnce();
    const completed = await waitForCompletion(job.id);
    await worker.stop();
    output(completed, `${completed.name} ${completed.state} (${completed.id}).`);
    if (['failed', 'dead', 'cancelled'].includes(completed.state)) {
      process.exitCode = 1;
    }
    return;
  }

  if (command === 'work') {
    await daemon.start();
    console.log('Apiary workers are running. Press Ctrl+C to stop.');
    return;
  }

  if (command === 'cancel' || command === 'retry') {
    if (!name) {
      throw new Error(`worker ${command} requires a job id`);
    }

    const remote = await remoteJson(`/jobs/${encodeURIComponent(name)}/${command}`, {
      method: 'POST',
    });
    const result =
      remote ?? (command === 'cancel' ? await apiary.cancel(name) : await apiary.retry(name));
    output(result, `${command} completed for ${name}.`);
    return;
  }

  throw new Error(`Unknown worker action: ${command}`);
}

await main();
