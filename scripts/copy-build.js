import fs from 'node:fs';

try {
  if (fs.existsSync('apps/web/.next')) {
    fs.cpSync('apps/web/.next', '.next', { recursive: true });
    console.log('[NAMH ASTRO] Copied apps/web/.next to .next in root');
  }
  if (fs.existsSync('apps/web/.next/static')) {
    fs.cpSync('apps/web/.next/static', '_next/static', { recursive: true });
    console.log('[NAMH ASTRO] Copied apps/web/.next/static to _next/static in root');
  }
  if (fs.existsSync('apps/web/public')) {
    fs.cpSync('apps/web/public', 'public', { recursive: true });
    console.log('[NAMH ASTRO] Copied apps/web/public to public in root');
  }
  if (fs.existsSync('apps/web/public/images')) {
    fs.cpSync('apps/web/public/images', 'images', { recursive: true });
    console.log('[NAMH ASTRO] Copied apps/web/public/images to images in root');
  }
  if (fs.existsSync('.next/server/app/index.html')) {
    fs.copyFileSync('.next/server/app/index.html', 'index.html');
    console.log('[NAMH ASTRO] Created root index.html from pre-rendered static page');
  }
} catch (err) {
  console.warn('[NAMH ASTRO] Note on build copy:', err?.message || err);
}
