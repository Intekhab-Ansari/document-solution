# IntekEdit ⚖️ Dependency & Licensing Compliance Registry

> **Clean-Room & Commercial Safety Guarantee:**
> All dependencies used in IntekEdit are strictly evaluated against commercial closed-source and open-source compatibility. No copyleft viral licenses (AGPL, GPL, or SSPL) are permitted in client packages or unisolated backend components.

---

## 1. Client-Side Dependencies (`apps/web`, `packages/*`)

All client-side code runs in the end-user's browser. To protect both self-hosted deployments and commercial closed-source distributions, all client dependencies are strictly permissive (MIT, Apache-2.0, BSD-2/3-Clause).

| Dependency | Category | License | Commercial Closed-Source Compatible? | Notes / Permissive Rationale |
| :--- | :--- | :--- | :---: | :--- |
| **`next`** | Framework | **MIT** | ✅ Yes | Next.js App Router core |
| **`react` / `react-dom`** | UI Runtime | **MIT** | ✅ Yes | Modern React runtime |
| **`pdf-lib`** | PDF Manipulation | **MIT** | ✅ Yes | Clean-room PDF page manipulation, annotations, encryption, form fields |
| **`pdfjs-dist`** | PDF Rendering | **Apache-2.0** | ✅ Yes | Client-side page rendering into Canvas |
| **`tesseract.js`** | Client-Side OCR | **Apache-2.0** | ✅ Yes | Runs in Web Workers; permissible alternative to AGPL OCR tools |
| **`onnxruntime-web`** | AI Runtime | **MIT** | ✅ Yes | WebGPU/WASM runtime for in-browser matting/background removal |
| **`@xenova/transformers`** | Neural Pipeline | **Apache-2.0** | ✅ Yes | In-browser model pipeline |
| **`heic2any`** | Image Decoding | **MIT** | ✅ Yes | Client-side Apple HEIC conversion to JPEG/PNG |
| **`jszip`** | Archiving | **MIT** | ✅ Yes | Client-side ZIP creation for batch page exports |
| **`lucide-react`** | UI Icons | **ISC** | ✅ Yes | Clean, original SVG icon suite |
| **`zustand`** | State Management | **MIT** | ✅ Yes | Micro-store for tool state and undo/redo |
| **`tailwindcss`** | Styling | **MIT** | ✅ Yes | Modern utility styling |
| **`clsx` / `tailwind-merge`** | Class Helpers | **MIT** | ✅ Yes | Style composition utilities |
| **`vitest`** | Unit Testing | **MIT** | ✅ Yes | Fast dev test runner |
| **`@playwright/test`** | E2E Testing | **Apache-2.0** | ✅ Yes | Browser automation & zero-egress network assertion |

---

## 2. Server-Side Sandbox Dependencies (`apps/api`)

The backend microservice is exclusively invoked for operations that cannot execute reliably in-browser (e.g. headless Office document conversion, heavy multi-language OCR my PDF, and specialized repair).

| Dependency / Binary | License | Permissive Status | Sandbox & Isolation Strategy |
| :--- | :--- | :---: | :--- |
| **`fastapi` / `uvicorn`** | **MIT / BSD-3-Clause** | ✅ Fully Permissive | Python async microservice |
| **`pydantic`** | **MIT** | ✅ Fully Permissive | Request validation |
| **`qpdf`** | **Apache-2.0** | ✅ Fully Permissive | Linearization, low-level repair, and stream encryption |
| **`LibreOffice Headless`** | **MPL-2.0** | ⚠️ Weak Copyleft (Permissive Service) | Network-isolated container. Used as an external CLI binary only; not linked into proprietary code. MPL-2.0 permits SaaS and binary usage without open-sourcing caller code. |
| **`OCRmyPDF`** | **MPL-2.0** | ⚠️ Weak Copyleft (Permissive Service) | Network-isolated container. Invoked strictly as an isolated subprocess on volatile tmpfs. |
| **`Tesseract Engine`** | **Apache-2.0** | ✅ Fully Permissive | Backend engine backing OCRmyPDF |
| **`redis` / `celery`** | **BSD-3-Clause** | ✅ Fully Permissive | Asynchronous queue management |

---

## 3. Flagged Copyleft Libraries & Permissive Alternatives

The following libraries are **STRICTLY FLAGGED** and excluded from the core codebase to maintain commercial cleanliness:

| Flagged Copyleft Library | License | Reason for Rejection | Clean Permissive Alternative Implemented |
| :--- | :--- | :--- | :--- |
| **Ghostscript** | **AGPL-3.0** | Viral copyleft risks for SaaS / closed-source use | **`pdf-lib`** + **`qpdf`** (Apache-2.0 / MIT) + **`pdfjs-dist`** |
| **MuPDF** | **AGPL-3.0** | Viral copyleft restrictions | **`pdfjs-dist`** (Apache-2.0) + **`PDFium WASM`** (Apache-2.0/BSD) |
| **iText (v7+)** | **AGPL-3.0** | Commercial licensing trap | **`pdf-lib`** (MIT) |
| **Poppler CLI (pdftoppm)** | **GPL-2.0+** | Strong copyleft CLI | **`pdfjs-dist` Canvas pipeline** / **`PDFium`** (Apache-2.0) |

---

## 4. AI Model Weights & Licenses

| Model | Task | License | Commercial Permissibility |
| :--- | :--- | :--- | :--- |
| **`BiRefNet-general` / `RMBG-1.4`** | Background Removal | **MIT / Apache-2.0** | Approved for commercial applications. Runs on client device via ONNX Runtime Web / Transformers.js. |
| **`Tesseract Fast Tsv`** | Client OCR Weights | **Apache-2.0** | Permissive multi-language text recognition (including Hindi, Marathi, Spanish, etc.) |

---

## 5. Clean-Room Certification
IntekEdit code is written from the ground up:
- No reverse-engineering or copying of Stirling-PDF, iLovePDF, or Smallpdf codebase or CSS.
- Independent visual design system with sleek dark mode, emerald/cyan accents, and glassmorphic micro-interactions.
- Independent test suite ensuring zero network egress on client-side tools and cryptographic shredding on server jobs.
