import { defineConfig } from 'astro/config';
import { readdir, readFile, rm } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 建置完成後刪除「沒有被任何頁面使用」的圖片。
 * Astro 會把 src/assets 的原始大圖也輸出到 _astro/，但網頁只用縮圖和 1600px 版本，
 * 原圖留著等於把高解析度照片公開，所以這裡把它們移除（只動 dist/，不影響原始檔）。
 */
function pruneUnusedImages() {
  return {
    name: 'prune-unused-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const assets = join(root, '_astro');
        const texts = [];
        const walk = async (d) => {
          for (const e of await readdir(d, { withFileTypes: true })) {
            const p = join(d, e.name);
            if (e.isDirectory()) await walk(p);
            else if (['.html', '.js', '.css', '.json', '.xml'].includes(extname(e.name))) texts.push(await readFile(p, 'utf8'));
          }
        };
        await walk(root);
        const all = texts.join('\n');
        let removed = 0;
        for (const f of await readdir(assets)) {
          if (!/\.(webp|jpe?g|png|avif)$/i.test(f) || all.includes(f)) continue;
          await rm(join(assets, f));
          removed++;
        }
        logger.info(`移除 ${removed} 張未使用的原始圖片`);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  output: 'static',
  build: {
    format: 'directory'
  },
  integrations: [pruneUnusedImages()],
});
