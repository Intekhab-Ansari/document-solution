// Polyfill Promise.try and Uint8Array.prototype.toHex for Node.js test environment running pdfjs-dist
if (!(Promise as any).try) {
  (Promise as any).try = (fn: (...args: any[]) => any, ...args: any[]) =>
    new Promise((resolve) => resolve(fn(...args)));
}

if (!(Uint8Array.prototype as any).toHex) {
  (Uint8Array.prototype as any).toHex = function () {
    return Buffer.from(this).toString("hex");
  };
}
