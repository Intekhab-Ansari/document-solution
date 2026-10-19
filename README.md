# EditAnything 🛠️
> **Privacy-First, All-in-One Document and Image Engineering Platform**

[![Zero Uploads](https://img.shields.io/badge/Processing-100%25%20Client--Side-emerald.svg)](#privacy--security-guarantees)
[![Zero Watermarks](https://img.shields.io/badge/Watermarks-Zero%20Added-blue.svg)](#core-promise)
[![Commercial Safe](https://img.shields.io/badge/Licenses-MIT%2FApache%202.0-indigo.svg)](#legal--licensing-matrix)
[![Tests Passing](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](#testing--verification)

**EditAnything** is engineered as a privacy-by-default, zero-watermark, local-in-browser document and photo suite. Sensitive files (government IDs, contracts, statements) never touch remote servers.

---

## 🌟 Problems We Solve

1. **Upload Anxiety & Surveillance:** Competitors upload your tax returns and contracts to cloud servers. **EditAnything runs 100% in your browser** using Web Workers, WebAssembly, and local Canvas APIs.
2. **Strict Upload Caps (100KB / 200KB / 500KB):** Portals reject applications that exceed strict size limits. Our **iterative binary search algorithm** hits your exact target KB budget while preserving text and OCR layers.
3. **No Traps:** No watermarks, no forced signups, no daily document caps, and full-resolution exports.
4. **Metadata Leaks:** Automatic detection of embedded GPS coordinates and camera serial numbers, with a 1-click stripper before sharing.
5. **Format Confusion:** Universal auto-detecting converter supporting JPG, PNG, WebP, AVIF, and Apple HEIC photos.

---

## 🚀 Phase 1 Feature Suite (All Client-Side)

### 📄 PDF Engineering Suite
- **Compress PDF (Target Size & Presets):** Binary search over image quality and DPI to hit exact limits (100KB, 200KB, 500KB, 1MB, or custom KB).
- **Merge PDF:** Combine multiple PDF documents with drag-and-drop reordering.
- **Split & Extract Pages:** Select visual thumbnails, enter ranges (`1-3, 5, 8-10`), or burst all pages into a ZIP archive.
- **Reorder & Delete Pages:** Interactive thumbnail grid with arrow movement and page deletion.
- **Rotate PDF:** Rotate all or individual pages (90° clockwise, 180°, -90°).
- **PDF to Images:** High-resolution page extraction to PNG, JPG, or WebP up to 300 DPI, with individual or ZIP download.
- **Images to PDF:** Turn multiple photos (JPG, PNG, WebP, HEIC) into a formatted PDF with A4 / Letter fit.
- **Add Page Numbers:** Header and footer pagination with format presets and cover page exclusions.
- **Watermark PDF:** Stamp customizable text watermarks with opacity and rotation controls.
- **Crop PDF Margins:** Trim margins, headers, and footers across pages.

### 🖼️ Image Processing Suite
- **Compress Image (Exact Target KB):** Binary search compression with an interactive before/after split slider.
- **Resize Image:** Scale by exact pixels (with aspect ratio lock), percentage, or standard passport & social presets.
- **Crop Image:** Precision crop to 1:1 Square, 4:3, 16:9, or 9:16 Story.
- **Rotate & Mirror Flip:** 90° rotation and horizontal/vertical mirror reflection.
- **Universal Image Converter:** Convert between JPG, PNG, WebP, AVIF, and HEIC with transparency background fill.
- **EXIF & GPS Stripper:** Inspect embedded GPS geolocation and camera tags, then sanitize in 1 click.

---

## 🛡️ Privacy & Security Guarantees

- **Zero Network Egress:** Client-side tools execute locally with zero external network requests during processing.
- **Memory Hygiene:** Buffers are explicitly revoked (`URL.revokeObjectURL()`) and cleared upon tab close.
- **No Third-Party Analytics on Tool Pages:** No trackers, no ad pixels, no document logging.
- **Strict Content Security Policy (CSP):** `default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; frame-ancestors 'none';`

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js** >= 20 (v22 recommended)
- **npm** >= 10
- **Python** 3.12+ (for server fallback tests)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/editanything.git
   cd editanything
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Run Unit Tests:**
   ```bash
   npm test
   ```

---

## 🐳 Docker Compose (Hardened Sandbox)

For running the complete containerized stack with hardened sandbox isolation, read-only root filesystems, and tmpfs volatile memory:

```bash
# Launch Next.js web + Sandboxed API + Redis + MinIO
docker compose up --build
```

### Sandbox Security Parameters
- `read_only: true`: Prevents runtime filesystem tampering.
- `tmpfs: /tmpfs:size=512M,mode=1777`: File operations occur strictly in volatile RAM.
- `security_opt: [no-new-privileges:true]`: Disallows privilege escalation.
- `cap_drop: [ALL]`: Strips all Linux capabilities.

---

## 🧪 Verification & Security Audits

EditAnything includes automated verification suites:

### 1. CI Security Static Audit
Fails the build if any source file contains logging of file names, contents, or raw text buffers:
```bash
npm --prefix apps/web test tests/unit/security-audit.test.ts
```

### 2. Zero-Network Egress E2E Test
Intercepts network requests during PDF and image operations to prove zero bytes leave the browser:
```bash
npx --prefix apps/web playwright test
```

### 3. Server Ephemeral File Shredding Test
Verifies that any server-side temporary file is cryptographically shredded upon completion:
```bash
python apps/api/test_cleanup.py
```

---

## ⚖️ Legal & Licensing Matrix

| Component | Library / Model | License | SaaS Safety Analysis |
| :--- | :--- | :--- | :--- |
| PDF Manipulation | `pdf-lib` | **MIT** | 100% Permissive |
| PDF Rendering | `pdfjs-dist` | **Apache-2.0** | 100% Permissive |
| Advanced PDF Engine | `PDFium WASM` | **Apache-2.0 / BSD** | Permissive (Eliminates AGPL MuPDF risks) |
| AI Matting Model | `BiRefNet` | **MIT** | Fully approved for commercial use |
| Image Codecs | `mozjpeg`, `webp` | **BSD / MIT** | 100% Permissive |

---

## 📄 License

EditAnything is open-source software licensed under the **MIT License**.
