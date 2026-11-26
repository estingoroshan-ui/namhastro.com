import fs from 'node:fs';
import path from 'node:path';

try {
  console.log('[NAMH ASTRO] Starting comprehensive build distribution...');

  // 1. Copy .next directory
  if (fs.existsSync('apps/web/.next')) {
    fs.cpSync('apps/web/.next', '.next', { recursive: true });
    console.log('[NAMH ASTRO] Copied apps/web/.next to .next in root');
  }

  // 2. Copy static assets to _next/static
  if (fs.existsSync('apps/web/.next/static')) {
    fs.cpSync('apps/web/.next/static', '_next/static', { recursive: true });
    console.log('[NAMH ASTRO] Copied apps/web/.next/static to _next/static in root');
  }

  // 3. Copy public assets
  if (fs.existsSync('apps/web/public')) {
    fs.cpSync('apps/web/public', 'public', { recursive: true });
  }

  if (fs.existsSync('apps/web/public/images')) {
    fs.cpSync('apps/web/public/images', 'images', { recursive: true });
    console.log('[NAMH ASTRO] Copied apps/web/public/images to images in root');
  }

  // 4. Distribute all pre-rendered HTML and RSC payloads from server/app
  const serverAppDir = path.resolve('apps/web/.next/server/app');
  if (fs.existsSync(serverAppDir)) {
    // Root index.html and index.rsc
    const rootIndex = path.join(serverAppDir, 'index.html');
    if (fs.existsSync(rootIndex)) {
      fs.copyFileSync(rootIndex, 'index.html');
      console.log('[NAMH ASTRO] Created root index.html');
    }
    const rootRsc = path.join(serverAppDir, 'index.rsc');
    if (fs.existsSync(rootRsc)) {
      fs.copyFileSync(rootRsc, 'index.rsc');
      console.log('[NAMH ASTRO] Created root index.rsc');
    }

    // Recursively copy all files (.html, .rsc, etc.)
    function distributeFiles(dir, relativeDir = '') {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullSource = path.join(dir, item.name);
        const relPath = path.join(relativeDir, item.name);

        if (item.isDirectory()) {
          distributeFiles(fullSource, relPath);
        } else if (item.isFile()) {
          // 1. Copy all .rsc files to their mirror paths and root
          if (item.name.endsWith('.rsc')) {
            const targetRscDir = relativeDir ? path.resolve(relativeDir) : path.resolve('.');
            fs.mkdirSync(targetRscDir, { recursive: true });
            fs.copyFileSync(fullSource, path.join(targetRscDir, item.name));

            // Also copy top-level route .rsc to root if in immediate subdir
            if (relativeDir && !relativeDir.includes(path.sep) && item.name === 'page.rsc') {
              fs.copyFileSync(fullSource, `${relativeDir}.rsc`);
            }
          }

          // 2. Copy all .html files
          if (item.name.endsWith('.html')) {
            if (item.name === 'index.html' && relativeDir === '') continue;
            if (item.name.startsWith('_')) {
              // Internal files like _not-found.html
              fs.copyFileSync(fullSource, item.name);
              continue;
            }

            const baseRouteName = item.name.replace(/\.html$/, '');

            // Create <route>/index.html
            const targetDir = path.join(relativeDir, baseRouteName);
            fs.mkdirSync(targetDir, { recursive: true });
            fs.copyFileSync(fullSource, path.join(targetDir, 'index.html'));

            // Also copy as <route>.html in root or parent
            if (relativeDir === '') {
              fs.copyFileSync(fullSource, `${baseRouteName}.html`);
            } else {
              const directPath = path.join(relativeDir, item.name);
              fs.copyFileSync(fullSource, directPath);
            }
          }
        }
      }
    }

    distributeFiles(serverAppDir);
    console.log('[NAMH ASTRO] Distributed all HTML routes and RSC payloads successfully');
  }
} catch (err) {
  console.error('[NAMH ASTRO] Error during build copy:', err);
}
