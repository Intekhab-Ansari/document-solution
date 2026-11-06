/**
 * IntekEdit AI Copilot & Customer Query Engine
 * 100% Client-Side Natural Language Understanding & Direct Tool Field Launcher.
 * Zero cloud transmission — fully air-gapped and runs in real-time browser memory.
 */

export interface AssistantAction {
  label: string;
  href: string;
  toolId: string;
  toolName: string;
  categoryLabel: string;
  badge?: string;
  accentClass: string;
  prefilledFields?: Record<string, string | number>;
  isExternal?: boolean;
}

export interface AssistantResponse {
  intent: string;
  title: string;
  message: string;
  steps: string[];
  tips?: string[];
  action?: AssistantAction;
  secondaryActions?: AssistantAction[];
  quickFollowUps?: string[];
}

/**
 * Extracts numeric target size in KB from natural language.
 * Examples: "200kb", "150 kb", "500 k", "under 1mb", "less than 200kb", "to 50kb"
 */
function extractTargetSizeKb(query: string): number | null {
  const q = query.toLowerCase();

  // Check for MB first: e.g. "1mb", "2 mb", "0.5mb"
  const mbMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:mb|megabytes?)\b/);
  if (mbMatch && mbMatch[1]) {
    const mbVal = parseFloat(mbMatch[1]);
    if (!isNaN(mbVal) && mbVal > 0) {
      return Math.round(mbVal * 1024);
    }
  }

  // Check for KB: e.g. "200kb", "150 kb", "50 k", "below 100kb"
  const kbMatch = q.match(/(\d+)\s*(?:kb|kilobytes?|k)\b/);
  if (kbMatch && kbMatch[1]) {
    const kbVal = parseInt(kbMatch[1], 10);
    if (!isNaN(kbVal) && kbVal > 0) {
      return kbVal;
    }
  }

  // Check for common government portal references
  if (q.includes("upsc") || q.includes("ssc") || q.includes("passport") || q.includes("visa")) {
    if (q.includes("photo") || q.includes("signature") || q.includes("sign")) {
      return 50;
    }
    return 200;
  }

  return null;
}

/**
 * Extracts source and target formats from convert queries.
 * Examples: "heic to jpg", "convert png to webp", "word to pdf"
 */
function extractConversionFormats(query: string): { from?: string; to?: string } {
  const q = query.toLowerCase();
  const formatRegex = /\b(pdf|docx?|word|xlsx?|excel|csv|html|txt|markdown|md|jpg|jpeg|png|webp|avif|heic|heif|gif)\s*(?:to|into|->|in)\s*(pdf|docx?|word|xlsx?|excel|csv|html|txt|markdown|md|jpg|jpeg|png|webp|avif|heic|heif|gif)\b/;
  const match = q.match(formatRegex);

  if (match) {
    let from = match[1];
    let to = match[2];
    if (from === "word") from = "docx";
    if (to === "word") to = "docx";
    if (from === "excel") from = "xlsx";
    if (to === "excel") to = "xlsx";
    if (from === "jpeg") from = "jpg";
    if (to === "jpeg") to = "jpg";
    return { from, to };
  }

  // Fallbacks: e.g. "convert heic" or "make it webp"
  if (/\bheic\b/i.test(q) || q.includes("iphone photo")) return { from: "heic", to: "jpg" };
  if (/\bwebp\b/i.test(q)) return { to: "webp" };
  if (/\bpng\b/i.test(q)) return { to: "png" };
  if (/\b(jpg|jpeg)\b/i.test(q)) return { to: "jpg" };
  if (/\b(word|docx)\b/i.test(q)) return { to: "docx" };

  return {};
}

/**
 * Main AI Query Parser & Direct Field Launcher
 */
export function queryAssistant(rawQuery: string): AssistantResponse {
  const query = (rawQuery || "").trim().toLowerCase();

  if (!query) {
    return {
      intent: "empty",
      title: "IntekEdit AI Assistant Ready",
      message: "I am your 100% private, on-device document & image copilot. Ask me how to accomplish any task or type your exact goal (e.g. 'Compress PDF to 150KB', 'Edit text in PDF', 'Convert HEIC to PNG').",
      steps: [
        "Type what you want to achieve or select a quick recommendation below.",
        "I will guide you step-by-step and provide a direct 1-click launcher with your parameters pre-filled.",
      ],
      quickFollowUps: [
        "Compress PDF to 200 KB",
        "Edit text in PDF",
        "Convert HEIC to JPG",
        "Strip EXIF & GPS from photos",
        "Merge multiple PDFs",
        "How private is IntekEdit?",
      ],
    };
  }

  const targetKb = extractTargetSizeKb(query);
  const { from: fromFmt, to: toFmt } = extractConversionFormats(query);

  const isImageTarget =
    query.includes("photo") ||
    query.includes("image") ||
    query.includes("picture") ||
    query.includes("pic") ||
    query.includes("passport") ||
    query.includes("signature");

  // 1. IMAGE COMPRESSION (Checked first if image context detected)
  if (
    isImageTarget &&
    (query.includes("compress") ||
      query.includes("shrink") ||
      query.includes("reduce") ||
      query.includes("target") ||
      targetKb !== null)
  ) {
    const size = targetKb || 50;
    return {
      intent: "image_compress",
      title: `Compress Image to Exact Target (${size} KB)`,
      message: `I've set up the IntekEdit Image Optimizer with target size pre-filled at ${size} KB. The local HTML5 Canvas and WASM compression iteratively tunes JPEG/WebP quantization to hit your exact size budget.`,
      steps: [
        `Launch the image compressor with ${size} KB pre-selected.`,
        "Drop your photo, passport scan, or signature.",
        "Compare quality using the interactive Before/After visual slider.",
        "Download your compressed image instantly.",
      ],
      tips: [
        "Government portals often require 20 KB to 50 KB for signatures and passport photos.",
        "All calculations happen in your device GPU/CPU memory.",
      ],
      action: {
        label: `⚡ Open Image Compressor (${size} KB Pre-set)`,
        href: `/image/compress?targetKb=${size}`,
        toolId: "image-compress",
        toolName: "Compress Image (Target KB)",
        categoryLabel: "Image Tools",
        badge: "TARGET KB",
        accentClass: "from-emerald-500 to-teal-500",
        prefilledFields: { targetKb: size, mode: "target" },
      },
      secondaryActions: [
        {
          label: "Crop to Passport Aspect Ratio",
          href: "/image/crop",
          toolId: "image-crop",
          toolName: "Crop Image",
          categoryLabel: "Image Tools",
          accentClass: "from-blue-500 to-cyan-500",
        },
      ],
    };
  }

  // 2. PDF COMPRESSION / TARGET SIZE
  if (
    query.includes("compress") ||
    query.includes("shrink") ||
    query.includes("reduce size") ||
    query.includes("reduce pdf") ||
    query.includes("smaller pdf") ||
    query.includes("target kb") ||
    targetKb !== null
  ) {
    const size = targetKb || 200;
    return {
      intent: "pdf_compress",
      title: `Compress PDF to Exact Target Size (${size} KB)`,
      message: `I've prepared the Target-Size PDF Compression engine configured for ${size} KB. Our client-side WebAssembly binary-search engine will automatically balance image DPI and stream compression so your document stays strictly below your limit.`,
      steps: [
        `Click the direct launcher below to open the workspace with target set to ${size} KB.`,
        "Drop or select your PDF document.",
        "Review the estimated compression ratio and click 'Compress PDF'.",
        "Download your optimized document with 100% client-side privacy.",
      ],
      tips: [
        "You can toggle 'Convert to Grayscale' inside the workspace for documents with heavy color graphics to shave off an extra 40% size.",
        "Ideal for UPSC, SSC, state civil service, visa, and university portal submissions.",
      ],
      action: {
        label: `⚡ Open PDF Compressor (${size} KB Pre-set)`,
        href: `/pdf/compress?targetKb=${size}`,
        toolId: "pdf-compress",
        toolName: "Compress PDF (Target Size)",
        categoryLabel: "PDF Tools",
        badge: "TARGET KB",
        accentClass: "from-emerald-500 to-teal-500",
        prefilledFields: { targetKb: size, mode: "target" },
      },
      secondaryActions: [
        {
          label: "Convert to Grayscale (B&W)",
          href: "/pdf/grayscale",
          toolId: "pdf-grayscale",
          toolName: "Grayscale PDF",
          categoryLabel: "Optimize",
          accentClass: "from-amber-500 to-orange-500",
        },
      ],
      quickFollowUps: [
        "Can I compress to 100 KB?",
        "Will the text stay readable?",
        "How do I edit text in this PDF?",
      ],
    };
  }

  // 2. IMAGE COMPRESSION / PHOTO SIZE
  if (
    query.includes("compress image") ||
    query.includes("compress photo") ||
    query.includes("shrink photo") ||
    query.includes("reduce image size") ||
    (targetKb && (query.includes("photo") || query.includes("image") || query.includes("pic")))
  ) {
    const size = targetKb || 50;
    return {
      intent: "image_compress",
      title: `Compress Image to Exact Target (${size} KB)`,
      message: `I've set up the IntekEdit Image Optimizer with target size pre-filled at ${size} KB. The local HTML5 Canvas and WASM compression iteratively tunes JPEG/WebP quantization to hit your exact size budget.`,
      steps: [
        `Launch the image compressor with ${size} KB pre-selected.`,
        "Drop your photo, passport scan, or signature.",
        "Compare quality using the interactive Before/After visual slider.",
        "Download your compressed image instantly.",
      ],
      tips: [
        "Government portals often require 20 KB to 50 KB for signatures and passport photos.",
        "All calculations happen in your device GPU/CPU memory.",
      ],
      action: {
        label: `⚡ Open Image Compressor (${size} KB Pre-set)`,
        href: `/image/compress?targetKb=${size}`,
        toolId: "image-compress",
        toolName: "Compress Image (Target KB)",
        categoryLabel: "Image Tools",
        badge: "TARGET KB",
        accentClass: "from-emerald-500 to-teal-500",
        prefilledFields: { targetKb: size, mode: "target" },
      },
      secondaryActions: [
        {
          label: "Crop to Passport Aspect Ratio",
          href: "/image/crop",
          toolId: "image-crop",
          toolName: "Crop Image",
          categoryLabel: "Image Tools",
          accentClass: "from-blue-500 to-cyan-500",
        },
      ],
    };
  }

  // 3. EDIT PDF (TEXT, ANNOTATIONS, WHITEOUT)
  if (
    query.includes("edit") ||
    query.includes("change text") ||
    query.includes("modify text") ||
    query.includes("type on pdf") ||
    query.includes("whiteout") ||
    query.includes("erase") ||
    query.includes("highlight") ||
    query.includes("draw on pdf") ||
    query.includes("annotate") ||
    query.includes("invoice edit")
  ) {
    return {
      intent: "pdf_edit",
      title: "IntekEdit PDF Studio (Vector Text & Annotation Editor)",
      message: "You can edit text, customize colors and fonts, whiteout existing text, highlight lines, and stamp annotations directly in your PDF without Adobe Acrobat or paid software.",
      steps: [
        "Click the launcher below to open IntekEdit PDF Studio.",
        "Upload your PDF document.",
        "Click any text box on the canvas to directly edit its wording, font, size, or color.",
        "Use the 'Whiteout' tool to erase unwanted areas or the 'Draw' pen for freehand markups.",
        "Click 'Download Updated PDF' to export with all vector fonts embedded.",
      ],
      tips: [
        "IntekEdit renders vector text directly onto your PDF coordinates with zero DPI degradation.",
        "Never sends your private invoices or contracts to any external server.",
      ],
      action: {
        label: "⚡ Launch PDF Studio (Vector Edit)",
        href: "/pdf/edit",
        toolId: "pdf-edit",
        toolName: "Edit PDF (Text & Annotations)",
        categoryLabel: "PDF Tools",
        badge: "FULL STUDIO",
        accentClass: "from-emerald-500 via-teal-500 to-cyan-500",
      },
      secondaryActions: [
        {
          label: "Sign PDF Document",
          href: "/security/sign",
          toolId: "security-sign",
          toolName: "Digital Signatures",
          categoryLabel: "Security",
          accentClass: "from-cyan-500 to-blue-500",
        },
      ],
      quickFollowUps: [
        "Can I change the text color?",
        "How do I erase text with whiteout?",
        "Can I add page numbers?",
      ],
    };
  }

  // 4. MERGE PDFS
  if (
    query.includes("merge") ||
    query.includes("combine") ||
    query.includes("join pdf") ||
    query.includes("concatenate") ||
    query.includes("bundle")
  ) {
    return {
      intent: "pdf_merge",
      title: "Merge Multiple PDF Documents",
      message: "Combine multiple PDF files into one clean, continuous document in seconds with drag-and-drop page sequencing.",
      steps: [
        "Click below to launch the PDF Merger.",
        "Select or drag multiple PDF files into the dropzone.",
        "Drag the document cards to arrange them into your preferred reading order.",
        "Click 'Merge Documents' to download one consolidated PDF file.",
      ],
      action: {
        label: "⚡ Open PDF Merger",
        href: "/pdf/merge",
        toolId: "pdf-merge",
        toolName: "Merge PDF",
        categoryLabel: "PDF Tools",
        badge: "POPULAR",
        accentClass: "from-cyan-500 to-blue-500",
      },
      quickFollowUps: [
        "Can I reorder individual pages?",
        "Can I compress after merging?",
      ],
    };
  }

  // 5. SPLIT & EXTRACT PAGES
  if (
    query.includes("split") ||
    query.includes("extract page") ||
    query.includes("cut pdf") ||
    query.includes("separate page") ||
    query.includes("delete page") ||
    query.includes("remove page")
  ) {
    return {
      intent: "pdf_split",
      title: "Split PDF & Extract Specific Pages",
      message: "Separate pages by custom range (e.g. 1-3, 5, 8-10) or visual thumbnail selection into new standalone documents or a ZIP archive.",
      steps: [
        "Launch the PDF Splitter.",
        "Upload your multi-page document.",
        "Select the page range to extract or click page thumbnails directly.",
        "Export the extracted pages as a new PDF or download each page separately.",
      ],
      action: {
        label: "⚡ Open PDF Splitter & Page Extractor",
        href: "/pdf/split",
        toolId: "pdf-split",
        toolName: "Split & Extract Pages",
        categoryLabel: "PDF Tools",
        accentClass: "from-blue-500 to-indigo-500",
      },
      secondaryActions: [
        {
          label: "Visual Reorder & Delete Pages",
          href: "/pdf/reorder",
          toolId: "pdf-reorder",
          toolName: "Reorder Pages",
          categoryLabel: "PDF Tools",
          accentClass: "from-purple-500 to-indigo-500",
        },
      ],
    };
  }

  // 6. CONVERT FORMATS (HEIC, Word, Excel, PDF, PNG, JPG, WebP)
  if (
    query.includes("convert") ||
    query.includes("heic") ||
    query.includes("word to pdf") ||
    query.includes("pdf to word") ||
    query.includes("excel to pdf") ||
    query.includes("photos to pdf") ||
    query.includes("image to pdf") ||
    query.includes("pdf to image") ||
    query.includes("docx") ||
    query.includes("xlsx") ||
    toFmt ||
    fromFmt
  ) {
    // If it's HEIC or photo format conversion
    if (query.includes("heic") || (fromFmt === "heic" || toFmt === "jpg" || toFmt === "png" || toFmt === "webp")) {
      const target = toFmt || "jpg";
      return {
        intent: "image_convert",
        title: `Universal Image Converter (${fromFmt ? fromFmt.toUpperCase() : "Image"} → ${target.toUpperCase()})`,
        message: `Convert Apple iPhone HEIC/HEIF photos, PNG, JPG, WebP, and AVIF right inside your browser memory with zero compression artifacts.`,
        steps: [
          `Open the Image Converter pre-configured for ${target.toUpperCase()}.`,
          "Drop your image files or HEIC camera uploads.",
          "Select output quality and background fill (transparent or white).",
          "Download your converted images instantly.",
        ],
        action: {
          label: `⚡ Open Image Converter (${target.toUpperCase()} Pre-set)`,
          href: `/image/convert?to=${target}`,
          toolId: "image-convert",
          toolName: "Universal Image Convert",
          categoryLabel: "Image Tools",
          accentClass: "from-amber-500 to-emerald-500",
          prefilledFields: { to: target },
        },
        secondaryActions: [
          {
            label: "Bundle Images into PDF Document",
            href: "/pdf/images-to-pdf",
            toolId: "images-to-pdf",
            toolName: "Images to PDF",
            categoryLabel: "Converters",
            accentClass: "from-indigo-500 to-purple-500",
          },
        ],
      };
    }

    // If it's Images to PDF
    if (query.includes("image to pdf") || query.includes("photos to pdf") || query.includes("jpg to pdf")) {
      return {
        intent: "images_to_pdf",
        title: "Turn Photos & Scans into PDF",
        message: "Compile multiple photos, receipts, or certificates into a beautifully scaled, searchable PDF document with standard A4 margins.",
        steps: [
          "Open the Images to PDF workspace.",
          "Upload your JPG, PNG, or HEIC pictures.",
          "Select page size (A4, Letter, or Fit to Image).",
          "Click 'Generate PDF' and download.",
        ],
        action: {
          label: "⚡ Open Images to PDF",
          href: "/pdf/images-to-pdf",
          toolId: "images-to-pdf",
          toolName: "Images to PDF",
          categoryLabel: "Converters",
          accentClass: "from-indigo-500 to-purple-500",
        },
      };
    }

    // Default Universal Any-File Converter (DOCX, XLSX, PDF, HTML, etc.)
    return {
      intent: "convert_universal",
      title: "Universal Any-File Converter",
      message: "Convert Microsoft Word (DOCX), Excel (XLSX), PDF, Images, Text, and HTML client-side with native fidelity.",
      steps: [
        "Open the Universal Converter Studio.",
        "Drop any document, spreadsheet, or image.",
        "IntekEdit automatically identifies compatible target formats.",
        "Click Convert to execute with zero cloud transit.",
      ],
      action: {
        label: "⚡ Open Universal File Converter",
        href: "/convert",
        toolId: "convert-universal",
        toolName: "Universal Any-File Converter",
        categoryLabel: "Converters",
        badge: "POPULAR",
        accentClass: "from-emerald-500 to-cyan-500",
      },
    };
  }

  // 7. STRIP EXIF & GPS PRIVACY
  if (
    query.includes("exif") ||
    query.includes("gps") ||
    query.includes("metadata") ||
    query.includes("location") ||
    query.includes("camera serial") ||
    query.includes("clean photo") ||
    query.includes("strip")
  ) {
    return {
      intent: "strip_metadata",
      title: "Strip EXIF & GPS Location Metadata",
      message: "Modern smartphone photos embed GPS coordinates, home location, device serial numbers, and camera settings. IntekEdit lets you inspect and permanently scrub this hidden data.",
      steps: [
        "Launch the EXIF & GPS Metadata Scrubber.",
        "Select your photo to inspect hidden camera tags and location maps.",
        "Click 'Strip All Metadata' to create a clean, anonymous image.",
        "Download your sanitized photo safe for public social media sharing.",
      ],
      action: {
        label: "⚡ Open EXIF & GPS Scrubber",
        href: "/image/metadata",
        toolId: "image-metadata",
        toolName: "Strip EXIF & GPS Metadata",
        categoryLabel: "Image Tools",
        badge: "PRIVACY",
        accentClass: "from-emerald-500 to-teal-500",
      },
    };
  }

  // 8. DIGITAL SIGNATURE / SIGN PDF
  if (
    query.includes("sign") ||
    query.includes("signature") ||
    query.includes("stamp") ||
    query.includes("contract")
  ) {
    return {
      intent: "pdf_sign",
      title: "Sign PDF with Secure Digital Signature",
      message: "Draw your signature on screen, type your name with handwriting typography, or upload a photo of your handwritten signature to stamp on contracts.",
      steps: [
        "Open the Digital Signature Studio.",
        "Upload the contract or agreement.",
        "Draw or type your signature and position it on the designated page.",
        "Apply the signature and download your finalized signed PDF.",
      ],
      action: {
        label: "⚡ Open Digital Signature Studio",
        href: "/security/sign",
        toolId: "security-sign",
        toolName: "Sign PDF (Digital Signature)",
        categoryLabel: "Security",
        badge: "POPULAR",
        accentClass: "from-cyan-500 to-blue-500",
      },
    };
  }

  // 9. PASSWORD PROTECT / ENCRYPT PDF
  if (
    query.includes("password") ||
    query.includes("protect") ||
    query.includes("encrypt") ||
    query.includes("lock")
  ) {
    return {
      intent: "pdf_protect",
      title: "Password Protect & Encrypt PDF (AES-256)",
      message: "Lock your PDF with industry-standard 256-bit AES encryption. Set owner and user passwords to prevent unauthorized viewing or printing.",
      steps: [
        "Launch the Password Protect tool.",
        "Drop your confidential PDF.",
        "Enter your strong password.",
        "Download your securely encrypted PDF file.",
      ],
      action: {
        label: "⚡ Open Password Protect Studio",
        href: "/security/protect",
        toolId: "security-protect",
        toolName: "Password Protect PDF",
        categoryLabel: "Security",
        badge: "PRIVACY",
        accentClass: "from-emerald-500 to-teal-500",
      },
      secondaryActions: [
        {
          label: "Unlock Existing PDF",
          href: "/security/unlock",
          toolId: "security-unlock",
          toolName: "Unlock PDF",
          categoryLabel: "Security",
          accentClass: "from-amber-500 to-orange-500",
        },
      ],
    };
  }

  // 10. UNLOCK / DECRYPT PDF
  if (
    query.includes("unlock") ||
    query.includes("decrypt") ||
    query.includes("remove password")
  ) {
    return {
      intent: "pdf_unlock",
      title: "Unlock PDF & Remove Password",
      message: "Permanently strip passwords from PDFs you hold the credentials for, enabling free editing, copying, and printing.",
      steps: [
        "Open the PDF Unlocker.",
        "Upload your locked PDF and enter the current password once.",
        "Click 'Unlock Document' to download a clean, unrestricted version.",
      ],
      action: {
        label: "⚡ Open PDF Unlocker",
        href: "/security/unlock",
        toolId: "security-unlock",
        toolName: "Unlock PDF",
        categoryLabel: "Security",
        accentClass: "from-amber-500 to-orange-500",
      },
    };
  }

  // 11. WATERMARK PDF
  if (
    query.includes("watermark") ||
    query.includes("confidential") ||
    query.includes("draft") ||
    query.includes("copyright")
  ) {
    return {
      intent: "pdf_watermark",
      title: "Add Custom Text Watermark",
      message: "Stamp diagonal or horizontal text watermarks (e.g. 'CONFIDENTIAL', 'DRAFT', or company name) across all pages with custom opacity and rotation angle.",
      steps: [
        "Open the Watermark tool.",
        "Upload your PDF.",
        "Type your watermark text, pick font size, color, and opacity.",
        "Download the stamped document.",
      ],
      action: {
        label: "⚡ Open Watermark Tool",
        href: "/pdf/watermark",
        toolId: "pdf-watermark",
        toolName: "Watermark PDF",
        categoryLabel: "PDF Tools",
        accentClass: "from-rose-500 to-pink-500",
      },
    };
  }

  // 12. ROTATE & FLIP
  if (
    query.includes("rotate") ||
    query.includes("upside down") ||
    query.includes("sideways") ||
    query.includes("orientation") ||
    query.includes("flip")
  ) {
    const isImage = query.includes("image") || query.includes("photo");
    const href = isImage ? "/image/rotate" : "/pdf/rotate";
    return {
      intent: "rotate",
      title: isImage ? "Rotate & Mirror Flip Image" : "Rotate PDF Pages",
      message: "Permanently fix orientation issues with 90° clockwise, counter-clockwise, or 180° rotation.",
      steps: [
        `Launch the ${isImage ? "Image" : "PDF"} Rotation workspace.`,
        "Select your file.",
        "Click the rotation arrows to achieve perfect orientation.",
        "Save and download.",
      ],
      action: {
        label: `⚡ Open ${isImage ? "Image" : "PDF"} Rotate Tool`,
        href,
        toolId: isImage ? "image-rotate" : "pdf-rotate",
        toolName: isImage ? "Rotate Image" : "Rotate PDF Pages",
        categoryLabel: isImage ? "Image Tools" : "PDF Tools",
        accentClass: "from-amber-500 to-purple-500",
      },
    };
  }

  // 13. CROP MARGINS / PASSPORT PHOTO
  if (
    query.includes("crop") ||
    query.includes("trim") ||
    query.includes("margins") ||
    query.includes("passport")
  ) {
    const isImage = query.includes("image") || query.includes("photo") || query.includes("passport");
    const href = isImage ? "/image/crop" : "/pdf/crop";
    return {
      intent: "crop",
      title: isImage ? "Crop Image & Passport Photo Presets" : "Crop PDF Margins",
      message: isImage
        ? "Trim photos to 1:1 Square, 16:9 Landscape, 9:16 Story, or official passport dimensions."
        : "Crop white document margins, headers, or scanner borders across all pages.",
      steps: [
        `Open the ${isImage ? "Image" : "PDF"} Cropper.`,
        "Drag the crop handles over your desired region.",
        "Apply crop and export.",
      ],
      action: {
        label: `⚡ Open ${isImage ? "Image" : "PDF"} Cropper`,
        href,
        toolId: isImage ? "image-crop" : "pdf-crop",
        toolName: isImage ? "Crop Image" : "Crop PDF Margins",
        categoryLabel: isImage ? "Image Tools" : "PDF Tools",
        accentClass: "from-blue-500 to-cyan-500",
      },
    };
  }

  // 14. EXTRACT TEXT / IMAGES
  if (
    query.includes("extract text") ||
    query.includes("extract image") ||
    query.includes("rip") ||
    query.includes("copy text") ||
    query.includes("ocr")
  ) {
    const isText = query.includes("text") || query.includes("ocr") || query.includes("copy");
    const href = isText ? "/extract/text" : "/extract/images";
    return {
      intent: "extract",
      title: isText ? "Extract Text from PDF" : "Extract Embedded Images to ZIP",
      message: isText
        ? "Extract raw text content into structured plain text or Markdown format."
        : "Extract every photo, diagram, and graphic embedded inside a PDF into a ZIP download.",
      steps: [
        `Open the ${isText ? "Text" : "Image"} Extractor.`,
        "Upload your PDF.",
        `Export all extracted ${isText ? "text" : "images"} in 1 click.`,
      ],
      action: {
        label: `⚡ Open ${isText ? "Text" : "Image"} Extractor`,
        href,
        toolId: isText ? "extract-text" : "extract-images",
        toolName: isText ? "Extract Text" : "Extract Images",
        categoryLabel: "Extractors",
        accentClass: "from-teal-500 to-blue-500",
      },
    };
  }

  // 15. PRIVACY & SECURITY QUESTIONS
  if (
    query.includes("privacy") ||
    query.includes("safe") ||
    query.includes("upload") ||
    query.includes("server") ||
    query.includes("security") ||
    query.includes("stored") ||
    query.includes("data")
  ) {
    return {
      intent: "privacy",
      title: "100% In-Browser Privacy Architecture",
      message: "IntekEdit is architected around an air-gapped security model. All PDF vector manipulation, JPEG/WebP quantization, and encryption run strictly inside your browser's WebAssembly and JavaScript memory. Zero bytes of your documents ever leave your computer.",
      steps: [
        "Network Egress: 0 Bytes transmitted for any document operation.",
        "WASM Sandbox: Cryptographic operations execute in browser RAM and vanish on tab close.",
        "No User Tracking: We do not log filenames, content, or metadata.",
      ],
      tips: [
        "You can disconnect your internet completely (Airplane Mode) and IntekEdit will continue to work flawlessly.",
        "Check our real-time Network Egress counter or review our open privacy specification.",
      ],
      action: {
        label: "🛡️ View Privacy Architecture & Audit",
        href: "/privacy",
        toolId: "privacy-policy",
        toolName: "Privacy Guarantee",
        categoryLabel: "Privacy",
        badge: "VERIFIED",
        accentClass: "from-emerald-500 to-teal-500",
      },
      quickFollowUps: [
        "Can I use it offline in airplane mode?",
        "How do you compress without a server?",
        "Show me all PDF tools",
      ],
    };
  }

  // 16. INTEKCHAT P2P SHARING
  if (
    query.includes("intekchat") ||
    query.includes("share") ||
    query.includes("p2p") ||
    query.includes("send to phone") ||
    query.includes("nearby")
  ) {
    return {
      intent: "intekchat",
      title: "IntekChat — Direct P2P Device-to-Device Sharing",
      message: "Transfer files directly between your phone, laptop, or nearby devices over encrypted WebRTC peer-to-peer connections with zero file size limits and zero cloud storage.",
      steps: [
        "Click below to open IntekChat (intekchat.vercel.app).",
        "Scan the QR code or accept the peer invitation on your other device.",
        "Transfer files at full local network Wi-Fi speed.",
      ],
      action: {
        label: "⚡ Open IntekChat P2P Sharing",
        href: "https://intekchat.vercel.app/",
        toolId: "intekchat",
        toolName: "IntekChat P2P",
        categoryLabel: "External App",
        badge: "P2P",
        accentClass: "from-cyan-500 via-sky-500 to-indigo-500",
        isExternal: true,
      },
    };
  }

  // 17. GENERAL SMART FALLBACK (Matches closest tools)
  return {
    intent: "general_guide",
    title: "IntekEdit Intelligent Assistant",
    message: `I analyzed your query: "${rawQuery}". Here are the most relevant tools and recommended actions to accomplish your goal on IntekEdit:`,
    steps: [
      "Select a tool below to open its dedicated browser workspace.",
      "All tools operate 100% client-side with zero cloud uploads.",
    ],
    action: {
      label: "⚡ Open PDF Studio (Edit & Annotate)",
      href: "/pdf/edit",
      toolId: "pdf-edit",
      toolName: "Edit PDF",
      categoryLabel: "PDF Tools",
      accentClass: "from-emerald-500 to-teal-500",
    },
    secondaryActions: [
      {
        label: "Compress PDF (Target Size)",
        href: "/pdf/compress",
        toolId: "pdf-compress",
        toolName: "Compress PDF",
        categoryLabel: "PDF Tools",
        accentClass: "from-teal-500 to-cyan-500",
      },
      {
        label: "Universal File Converter",
        href: "/convert",
        toolId: "convert-universal",
        toolName: "File Converter",
        categoryLabel: "Converters",
        accentClass: "from-blue-500 to-indigo-500",
      },
    ],
    quickFollowUps: [
      "Compress PDF to 200 KB",
      "Edit text in PDF",
      "Convert HEIC to JPG",
      "Strip photo EXIF metadata",
    ],
  };
}
