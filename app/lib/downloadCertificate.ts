/**
 * Downloads the certificate element as JPG or PDF.
 * Generates a fresh QR code directly via the qrcode library for reliability.
 */
export async function downloadCertificate(
  element: HTMLElement,
  filename: string,
  format: "jpg" | "pdf",
  verificationUrl?: string,
  onImageHash?: (hash: string) => void | Promise<any>
): Promise<string> {
  // Find the certificate image
  const certImg = element.querySelector<HTMLImageElement>("img");

  let finalCanvas: HTMLCanvasElement;

  if (certImg && certImg.complete && certImg.naturalWidth > 0) {
    finalCanvas = await composeCertificateCanvas(certImg, verificationUrl);
  } else {
    // Fallback: html2canvas for the digital template view
    finalCanvas = await captureWithHtml2Canvas(element);
  }

  // Generate blob to compute exact byte SHA-256 hash
  const blob = await new Promise<Blob | null>((resolve) =>
    finalCanvas.toBlob(resolve, "image/jpeg", 0.95)
  );

  let imageHash = "";
  if (blob) {
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    imageHash = "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    if (onImageHash) {
      await onImageHash(imageHash);
    }
  }

  const dataUrl = finalCanvas.toDataURL("image/jpeg", 0.95);

  if (format === "jpg") {
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      triggerDownload(blobUrl, `${filename}.jpg`);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } else {
      triggerDownload(dataUrl, `${filename}.jpg`);
    }
    return imageHash;
  }

  // PDF
  const jspdfModule = await import("jspdf");
  const JsPDF =
    (jspdfModule as any).jsPDF ??
    (jspdfModule as any).default?.jsPDF ??
    (jspdfModule as any).default;

  const pxToMm = (px: number) => (px * 25.4) / 96;
  const w = pxToMm(finalCanvas.width);
  const h = pxToMm(finalCanvas.height);
  const pdf = new JsPDF({
    orientation: w > h ? "landscape" : "portrait",
    unit: "mm",
    format: [w, h],
  });
  pdf.addImage(dataUrl, "JPEG", 0, 0, w, h);
  pdf.save(`${filename}.pdf`);
  return imageHash;
}

/**
 * Compose: certificate image background + freshly-rendered QR overlay
 */
async function composeCertificateCanvas(
  certImg: HTMLImageElement,
  verificationUrl?: string
): Promise<HTMLCanvasElement> {
  const imgBitmap = await loadImageBitmap(certImg.src);

  const W = imgBitmap.width;
  const H = imgBitmap.height;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Draw certificate photo
  ctx.drawImage(imgBitmap, 0, 0, W, H);

  if (!verificationUrl) return canvas;

  // --- Generate fresh QR code ---
  const QRCode = (await import("qrcode")).default;
  const QR_SIZE = Math.round(W * 0.15);   // 15% of width
  const MARGIN = Math.round(W * 0.03);
  const LABEL_H = Math.round(W * 0.04);   // space for labels below QR
  const PAD = Math.round(W * 0.012);

  // Position: bottom-right corner
  const boxW = QR_SIZE + PAD * 2;
  const boxH = QR_SIZE + PAD * 2 + LABEL_H;
  const boxX = W - boxW - MARGIN;
  const boxY = H - boxH - MARGIN;
  const qrX = boxX + PAD;
  const qrY = boxY + PAD;

  // Draw white rounded background box
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  const r = 8;
  const bx = boxX, by = boxY, bw = boxW, bh = boxH;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.lineTo(bx + bw - r, by);
  ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
  ctx.lineTo(bx + bw, by + bh - r);
  ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
  ctx.lineTo(bx + r, by + bh);
  ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
  ctx.lineTo(bx, by + r);
  ctx.quadraticCurveTo(bx, by, bx + r, by);
  ctx.closePath();
  ctx.fill();

  // Generate QR onto an offscreen canvas
  const qrOffscreen = document.createElement("canvas");
  await QRCode.toCanvas(qrOffscreen, verificationUrl, {
    width: QR_SIZE,
    margin: 1,
    color: { dark: "#0F172A", light: "#FFFFFF" },
    errorCorrectionLevel: "H",  // highest — survives partial damage/overlay
  });

  // Draw QR onto the certificate canvas
  ctx.drawImage(qrOffscreen, qrX, qrY, QR_SIZE, QR_SIZE);

  // Draw labels BELOW the QR code (inside the white box, never on QR modules)
  const labelY = qrY + QR_SIZE + PAD;
  const fontSize1 = Math.max(10, Math.round(W * 0.014));
  const fontSize2 = Math.max(9, Math.round(W * 0.012));
  const centerX = boxX + boxW / 2;

  ctx.fillStyle = "#0F172A";
  ctx.textAlign = "center";
  ctx.font = `bold ${fontSize1}px sans-serif`;
  ctx.fillText("SCAN TO VERIFY", centerX, labelY + fontSize1);
  ctx.font = `bold ${fontSize2}px sans-serif`;
  ctx.fillText("AUTHENTICATION", centerX, labelY + fontSize1 + fontSize2 + 2);

  return canvas;
}

/** Load an image as ImageBitmap, fetching as blob to bypass CORS taint */
async function loadImageBitmap(src: string): Promise<ImageBitmap> {
  try {
    const res = await fetch(src, { mode: "cors", cache: "no-store" });
    const blob = await res.blob();
    return createImageBitmap(blob);
  } catch {
    // Fallback: create img element with crossOrigin
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => res(); // don't block on error
      img.src = src + (src.includes("?") ? "&" : "?") + "_nc=" + Date.now();
    });
    return createImageBitmap(img);
  }
}

/** Fallback using html2canvas for the digital template */
async function captureWithHtml2Canvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  const h2cModule = await import("html2canvas");
  const html2canvas: (el: HTMLElement, opts?: any) => Promise<HTMLCanvasElement> =
    (h2cModule as any).default ?? (h2cModule as any);

  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
    imageTimeout: 8000,
    onclone: (_doc: Document, clone: HTMLElement) => {
      clone.querySelectorAll("[data-html2canvas-ignore]").forEach((el) => el.remove());
    },
  });
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
