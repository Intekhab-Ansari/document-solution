import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const svgContent = `
<svg width="512" height="512" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="eaBgGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="50%" stop-color="#042f2e" />
      <stop offset="100%" stop-color="#0c1a2e" />
    </linearGradient>
    <linearGradient id="eaBorderGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#06b6d4" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0.6" />
    </linearGradient>
    <linearGradient id="eaBackPage" x1="10" y1="8" x2="28" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#0369a1" stop-opacity="0.3" />
    </linearGradient>
    <linearGradient id="eaMainPage" x1="12" y1="10" x2="28" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="60%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="eaFoldFlap" x1="22" y1="10" x2="27" y2="15" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#a7f3d0" />
      <stop offset="100%" stop-color="#6ee7b7" />
    </linearGradient>
    <filter id="eaSparkGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="1.2" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect x="1.25" y="1.25" width="37.5" height="37.5" rx="10" fill="url(#eaBgGrad)" stroke="url(#eaBorderGrad)" stroke-width="1.5" />
  <rect x="2.5" y="2.5" width="35" height="17" rx="8.5" fill="white" fill-opacity="0.08" />
  <path d="M10 14C10 11.7909 11.7909 10 14 10H22L27 15V26C27 28.2091 25.2091 30 23 30H14C11.7909 30 10 28.2091 10 26V14Z" fill="url(#eaBackPage)" />
  <path d="M13 13.5C13 11.567 14.567 10 16.5 10H23L28.5 15.5V26.5C28.5 28.433 26.933 30 25 30H16.5C14.567 30 13 28.433 13 26.5V13.5Z" fill="url(#eaMainPage)" />
  <path d="M23 10V14.5C23 15.0523 23.4477 15.5 24 15.5H28.5L23 10Z" fill="url(#eaFoldFlap)" />
  <rect x="16" y="18" width="5" height="1.8" rx="0.9" fill="#042f2e" fill-opacity="0.4" />
  <rect x="16" y="22" width="7.5" height="1.8" rx="0.9" fill="#042f2e" fill-opacity="0.4" />
  <path d="M21.5 15C21.8 17.5 23.5 19.2 26 19.5C23.5 19.8 21.8 21.5 21.5 24C21.2 21.5 19.5 19.8 17 19.5C19.5 19.2 21.2 17.5 21.5 15Z" fill="#ffffff" filter="url(#eaSparkGlow)" />
  <circle cx="21.5" cy="19.5" r="1.2" fill="#ecfdf5" />
</svg>
`;

// Helper to create an ICO buffer containing multiple PNG images
function createIco(pngBuffers) {
  const numImages = pngBuffers.length;
  const headerLen = 6;
  const dirEntryLen = 16;
  let offset = headerLen + dirEntryLen * numImages;

  const header = Buffer.alloc(headerLen);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Icon type = 1
  header.writeUInt16LE(numImages, 4);

  const entries = [];
  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(dirEntryLen);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // Image data size
    entry.writeUInt32LE(offset, 12); // Offset
    entries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.buffer)]);
}

async function run() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
    { size: 96, name: 'icon-96.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
    { size: 512, name: 'logo.png' },
  ];

  const publicDir = path.resolve('apps/web/public');
  const appDir = path.resolve('apps/web/src/app');

  const icoPngBuffers = [];

  for (const { size, name } of sizes) {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    });

    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${size}px; height: ${size}px; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    svg { width: ${size}px; height: ${size}px; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

    await page.setContent(html);
    const buffer = await page.screenshot({ omitBackground: true, type: 'png' });
    await page.close();

    const dest = path.join(publicDir, name);
    fs.writeFileSync(dest, buffer);
    console.log(`Generated: ${dest} (${size}x${size})`);

    if (size === 16 || size === 32 || size === 48) {
      icoPngBuffers.push({ width: size, height: size, buffer });
    }
  }

  // Create multi-size ICO
  const icoBuffer = createIco(icoPngBuffers);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico in public/ and src/app/');

  // Also save the canonical icon.svg and favicon.svg
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent.trim());
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent.trim());
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgContent.trim());
  console.log('Updated icon.svg and favicon.svg');

  await browser.close();
}

run().catch(console.error);
