import { rm, mkdir, readdir, copyFile, readFile, writeFile, cp } from 'node:fs/promises';
import { extname, dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const out = join(root, 'www');
const runtimeExt = new Set(['.html', '.js', '.css', '.svg', '.webmanifest']);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const entries = await readdir(root, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isFile()) continue;
  if (!runtimeExt.has(extname(entry.name)) && entry.name !== 'sw.js') continue;
  await copyFile(join(root, entry.name), join(out, entry.name));
}

await cp(join(root, 'a13v3'), join(out, 'a13v3'), { recursive: true });

await build({
  entryPoints: [join(root, 'mobile', 'native-entry.js')],
  outfile: join(out, 'mobile-native.js'),
  bundle: true,
  minify: true,
  platform: 'browser',
  format: 'iife',
  target: ['es2020']
});

const nativeTag = '<script src="./mobile-native.js"></script>';

async function injectNativeScript(path) {
  let source = await readFile(path, 'utf8');
  if (!source.includes('</body>') || source.includes('mobile-native.js')) return;
  source = source.replace('</body>', `${nativeTag}</body>`);
  await writeFile(path, source);
}

for (const entry of await readdir(out, { withFileTypes: true })) {
  if (entry.isFile() && extname(entry.name) === '.html') {
    await injectNativeScript(join(out, entry.name));
  }
}

for (const entry of await readdir(join(out, 'a13v3'), { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.txt')) {
    await injectNativeScript(join(out, 'a13v3', entry.name));
  }
}

console.log('Sala 13 mobile preparada em www/ com assets locais e bridge nativa.');
