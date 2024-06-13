/* eslint-disable no-console */
import type { Config } from 'jest';
import find from 'find-process';
import kill from 'tree-kill';

export default async (_globalConfig: Config, _projectConfig: Config) => {
  // @ts-expect-error
  if (globalThis.startedAPI) {
    console.log('Stopping API');
    // @ts-expect-error
    kill(globalThis.apiPID);
    await find('port', 3000, { logLevel: 'info' } as any).then((list) => {
      list.forEach((foundProcess) => {
        process.kill(foundProcess.pid);
      });
    });
  }
};
