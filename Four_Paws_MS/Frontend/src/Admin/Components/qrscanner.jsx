import React, { useRef, useState } from "react";
import { useZxing } from "react-zxing";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useNavigate } from "react-router-dom";

const QRScanner = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Live Camera Scan
  const { ref } = useZxing({
    onDecodeResult(result) {
      const scannedText = result.getText();
      console.log("Live scan:", scannedText);
      navigate(scannedText);
    },
  });

  // Image Upload + Scan
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageSrc = e.target.result;
      const img = new Image();
      img.src = imageSrc;

      img.onload = async () => {
        try {
          const codeReader = new BrowserMultiFormatReader();
          const result = await codeReader.decodeFromImageElement(img);
          console.log("Image scan:", result.getText());
          navigate(result.getText());
        } catch (err) {
          setError("No QR code detected in the image.");
          console.error(err);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <h2 className="text-xl font-semibold">Scan QR Code</h2>

      {/* Live Camera QR Scan */}
      <video ref={ref} className="w-full max-w-sm border rounded-lg shadow" />

      {/* OR Upload QR Image */}
      <div className="flex flex-col items-center gap-2">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="block"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default QRScanner;
