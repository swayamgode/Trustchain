/**
 * Downloads the certificate element as JPG or PDF.
 * Uses html2canvas to capture the DOM node, then optionally wraps in jsPDF.
 */
export async function downloadCertificate(
  element: HTMLElement,
  filename: string,
  format: "jpg" | "pdf"
): Promise<void> {
  const html2canvas = (await import("html2canvas")).default;

  const canvas = await html2canvas(element, {
    scale: 3,           // high-res
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  if (format === "jpg") {
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    triggerDownload(dataUrl, `${filename}.jpg`);
    return;
  }

  // PDF
  const { jsPDF } = await import("jspdf");
  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pxToMm = (px: number) => (px * 25.4) / (96 * 3); // dpi-aware
  const w = pxToMm(canvas.width);
  const h = pxToMm(canvas.height);
  const pdf = new jsPDF({ orientation: w > h ? "landscape" : "portrait", unit: "mm", format: [w, h] });
  pdf.addImage(imgData, "JPEG", 0, 0, w, h);
  pdf.save(`${filename}.pdf`);
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
