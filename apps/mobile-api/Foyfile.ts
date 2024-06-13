/* eslint-disable @typescript-eslint/no-use-before-define */
import { task, fs, setGlobalOptions } from 'foy';
import { join } from 'path';
import { BuildOptions, context } from 'esbuild';
import { zip } from 'zip-a-folder';

const rootDir = '../..';
const distPath = join(rootDir, 'dist/apps/api');
const distFilesPath = join(distPath, 'files');
const prismaPath = join(rootDir, 'libs/database/prisma');

const sharedContext: BuildOptions = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outdir: distFilesPath,
  allowOverwrite: true,
  logLevel: 'info',
};

setGlobalOptions({ loading: false });
task('dev', async (ctx) => {
  await Promise.all([rmDist()]);

  const esbuild = await context({
    ...sharedContext,
    sourcemap: true,
    minify: false,
  });

  await fs.mkdirp(distFilesPath);
  await fs.copyFile(join(prismaPath, 'client/schema.prisma'), join(distFilesPath, 'schema.prisma'));
  await esbuild.rebuild(); // await first build

  ctx.spawn('pnpm', ['serverless', 'offline', '--reloadHandler', '--verbose']); // start server
  esbuild.watch(); // then start watching for file changes
});

task('prod', async (ctx) => {
  await Promise.all([
    rmDist(),
    // ctx.exec('pnpm tsc --noEmit'),
    // ctx.exec('pnpm p:gen'),
  ]);

  const esbuild = await context({
    ...sharedContext,
    sourcemap: false,
    minify: true,
  });

  await fs.mkdirp(distFilesPath);

  await Promise.all([
    fs.copyFile(
      join(prismaPath, 'client/schema.prisma'),
      join(distFilesPath, 'schema.prisma'),
    ),
    fs.copyFile(
      join(prismaPath, 'client/libquery_engine-rhel-openssl-1.0.x.so.node'),
      join(distFilesPath, 'libquery_engine-rhel-openssl-1.0.x.so.node'),
    ),
    esbuild.rebuild(),
  ]);
  esbuild.dispose();

  await zip(distFilesPath, join(distPath, 'api.zip'));
  await ctx.exec('pnpm serverless deploy --aws-profile edvise-backend');
});

async function rmDist() {
  try {
    await fs.rm(distPath, { recursive: true, force: true });
  } catch (e: any) {
    if (e.code === 'ENOENT') return;
    throw e;
  }
}
