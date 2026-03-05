import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanFailure?: (error: any) => void;
}

const BarcodeScanner = ({ onScanSuccess, onScanFailure }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanFailureRef = useRef(onScanFailure);

  // Update refs when props change
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanFailureRef.current = onScanFailure;
  }, [onScanSuccess, onScanFailure]);

  useEffect(() => {
    // Create instance
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        },
        /* verbose= */ false
      );
      scannerRef.current = scanner;

      scanner.render(
        (decodedText, decodedResult) => {
          if (onScanSuccessRef.current) {
            onScanSuccessRef.current(decodedText, decodedResult);
          }
        },
        (error) => {
          if (onScanFailureRef.current) {
            onScanFailureRef.current(error);
          }
        }
      );
    }

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5-qrcode scanner. ", error);
        });
        scannerRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once

  return <div id="reader" className="w-full max-w-md mx-auto overflow-hidden rounded-lg shadow-lg bg-white"></div>;
};

export default BarcodeScanner;
