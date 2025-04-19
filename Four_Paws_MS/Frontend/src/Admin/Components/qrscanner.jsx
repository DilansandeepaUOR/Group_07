import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const QRScanner = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScanSuccess(decodedText); // URL string from QR
      },
      (error) => {
        console.warn("QR scan failed", error);
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScanSuccess]);

  return <div id="reader" style={{ width: "300px" }} />;
};

export default QRScanner;