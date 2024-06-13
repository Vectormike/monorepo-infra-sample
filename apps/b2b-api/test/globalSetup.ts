/* eslint-disable no-console */
import type { Config } from 'jest';
import find from 'find-process';
import { spawn } from 'child_process';
import waitOn from 'wait-on';

export default async (_globalConfig: Config, _projectConfig: Config) => {
  const isRunning = (await find('port', 3000).catch(() => {}) as any).length > 0;
  if (!isRunning) {
    console.log('\nStarting API');
    const apiProcess = spawn(/^win/.test(process.platform) ? 'pnpm.cmd' : 'pnpm', ['nx', 'run', 'api:dev'], { detached: true });
    // @ts-expect-error
    globalThis.startedAPI = true;
    // @ts-expect-error
    globalThis.apiPID = apiProcess.pid;
    await waitOn({
      resources: ['tcp:3000'],
    });
  }
  console.log('API already running');
};
