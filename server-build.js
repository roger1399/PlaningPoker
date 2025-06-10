const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  outfile: 'dist/server.js',
}).catch(() => process.exit(1));
