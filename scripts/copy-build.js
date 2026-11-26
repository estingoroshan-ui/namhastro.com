import fs from 'node:fs';
import path from 'node:path';

try {
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
    console.log('[NAMH ASTRO] Copied apps/web/public to public in root');
  }

  if (fs.existsSync('apps/web/public/images')) {
    fs.cpSync('apps/web/public/images', 'images', { recursive: true });
    console.log('[NAMH ASTRO] Copied apps/web/public/images to images in root');
  }

  // 4. Copy index.html and all pre-rendered pages to root for Apache / Hostinger
  const serverAppDir = path.resolve('apps/web/.next/server/app');
  if (fs.existsSync(serverAppDir)) {
    // Root index.html
    const rootIndex = path.join(serverAppDir, 'index.html');
    if (fs.existsSync(rootIndex)) {
      fs.copyFileSync(rootIndex, 'index.html');
      console.log('[NAMH ASTRO] Created root index.html from pre-rendered static page');
    }

    // Function to recursively find all .html files and copy as <route>/index.html
    function copyHtmlFiles(dir, relativeDir = '') {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          copyHtmlFiles(path.join(dir, item.name), path.join(relativeDir, item.name));
        } else if (item.isFile() && item.name.endsWith('.html')) {
          if (item.name === 'index.html' && relativeDir === '') {
            continue; // Handled as root index.html
          }
          if (item.name.startsWith('_')) {
            continue; // Skip Next.js internal pages like _not-found.html
          }

          const baseRouteName = item.name.replace(/\.html$/, '');
          const targetDir = path.join(relativeDir, baseRouteName);
          const targetFilePath = path.join(targetDir, 'index.html');

          fs.mkdirSync(targetDir, { recursive: true });
          fs.copyFileSync(path.join(dir, item.name), targetFilePath);
          console.log(`[NAMH ASTRO] Created ${targetDir}/index.html`);
        }
      }
    }

    copyHtmlFiles(serverAppDir);
  }
} catch (err) {
  console.warn('[NAMH ASTRO] Note on build copy:', err?.message || err);
}
