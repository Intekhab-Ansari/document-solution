/**
 * Client-Side PDF Security & Cryptography Engine (Zero-Server, 100% In-Browser)
 * Powered by QPDF compiled to WebAssembly
 */

let cachedQpdfPromise: Promise<any> | null = null;

export async function getQpdfInstance() {
  if (!cachedQpdfPromise) {
    cachedQpdfPromise = (async () => {
      const qpdfModule = await import("@neslinesli93/qpdf-wasm");
      const factory = qpdfModule.default || (qpdfModule as any);
      
      const locateFile = () => {
        if (typeof window !== "undefined") {
          return "/qpdf.wasm";
        }
        // In Node / Vitest test environment
        try {
          // eslint-disable-next-line no-eval
          const nodeRequire = eval("require");
          return nodeRequire("path").resolve(process.cwd(), "public", "qpdf.wasm");
        } catch {
          return "public/qpdf.wasm";
        }
      };

      return await factory({ locateFile });
    })();
  }
  return await cachedQpdfPromise;
}

export interface ProtectPdfOptions {
  userPassword?: string;  // Password required to open and view the document
  ownerPassword?: string; // Password required to change permissions
  keyLength?: 128 | 256;  // AES-256 (recommended) or AES-128
  allowPrinting?: boolean;
  allowCopying?: boolean;
  allowModifying?: boolean;
}

/**
 * Encrypts a PDF with standard AES-256 or AES-128 encryption and permission flags
 */
export async function protectPdfWithPassword(
  pdfBytes: Uint8Array | ArrayBuffer,
  options: ProtectPdfOptions
): Promise<Uint8Array> {
  const mod = await getQpdfInstance();
  const fileId = Math.random().toString(36).substring(2, 9);
  const inPath = `/in_${fileId}.pdf`;
  const outPath = `/out_${fileId}.pdf`;

  try {
    const inData = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
    mod.FS.writeFile(inPath, inData);

    const userPw = options.userPassword || "";
    const ownerPw = options.ownerPassword || options.userPassword || "";
    const bits = String(options.keyLength || 256);

    const args = ["--encrypt", userPw, ownerPw, bits];

    if (options.allowPrinting === false) {
      args.push("--print=none");
    }
    if (options.allowCopying === false) {
      args.push("--extract=n");
    }
    if (options.allowModifying === false) {
      args.push("--modify=none");
    }

    args.push("--", inPath, outPath);

    const code = mod.callMain(args);
    if (code !== 0 && code !== 3) {
      throw new Error(`PDF encryption failed (exit code: ${code})`);
    }

    const result = mod.FS.readFile(outPath);
    return new Uint8Array(result);
  } finally {
    try {
      mod.FS.unlink(inPath);
    } catch {
      // Ignore
    }
    try {
      mod.FS.unlink(outPath);
    } catch {
      // Ignore
    }
  }
}

/**
 * Unlocks / decrypts a password-protected PDF or removes permission restrictions
 */
export async function unlockPdf(
  pdfBytes: Uint8Array | ArrayBuffer,
  password?: string
): Promise<Uint8Array> {
  const mod = await getQpdfInstance();
  const fileId = Math.random().toString(36).substring(2, 9);
  const inPath = `/in_${fileId}.pdf`;
  const outPath = `/out_${fileId}.pdf`;

  try {
    const inData = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
    mod.FS.writeFile(inPath, inData);

    const args = ["--decrypt"];
    if (password && password.trim().length > 0) {
      args.unshift(`--password=${password}`);
    }
    args.push(inPath, outPath);

    const code = mod.callMain(args);
    if (code === 2) {
      throw new Error("Incorrect password. Please verify the password and try again.");
    }
    if (code !== 0 && code !== 3) {
      throw new Error("Unable to decrypt PDF. Please ensure the password is correct.");
    }

    const result = mod.FS.readFile(outPath);
    return new Uint8Array(result);
  } finally {
    try {
      mod.FS.unlink(inPath);
    } catch {
      // Ignore
    }
    try {
      mod.FS.unlink(outPath);
    } catch {
      // Ignore
    }
  }
}

/**
 * Checks whether a PDF document is currently encrypted or requires a password
 */
export async function checkIfPdfIsEncrypted(
  pdfBytes: Uint8Array | ArrayBuffer
): Promise<boolean> {
  try {
    const { PDFDocument } = await import("pdf-lib");
    await PDFDocument.load(pdfBytes);
    return false;
  } catch (err: any) {
    const msg = String(err?.message || "").toLowerCase();
    if (msg.includes("encrypt") || msg.includes("password")) {
      return true;
    }
    // Also verify via pdfjs-dist
    try {
      const pdfjs = await import("pdfjs-dist");
      const loading = pdfjs.getDocument({
        data: new Uint8Array(pdfBytes).slice(),
      });
      await loading.promise;
      return false;
    } catch (pdfjsErr: any) {
      return pdfjsErr?.name === "PasswordException";
    }
  }
}
