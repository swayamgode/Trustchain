"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QRCodeCanvasProps {
  value: string;
  size?: number;
  className?: string;
  noFrame?: boolean;
  transparent?: boolean;
}

export default function QRCodeCanvas({
  value,
  size = 140,
  className = "",
  noFrame = false,
  transparent = false,
}: QRCodeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 0,
          color: {
            dark: "#0F172A",
            light: transparent ? "#00000000" : "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error("QR Code Error:", error);
          if (canvasRef.current) {
            setDataUrl(canvasRef.current.toDataURL("image/png"));
          }
        }
      );
    }
  }, [value, size, transparent]);

  if (noFrame) {
    return (
      <div className={`inline-flex flex-col items-center ${className}`}>
        <canvas ref={canvasRef} style={{ width: size, height: size }} />
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center bg-white p-2 rounded-[12px] border border-[#E8E9E5] shadow-xs ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}
