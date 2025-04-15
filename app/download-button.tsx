"use client";

import { useState } from "react";

interface DownloadButtonProps {
  action: () => Promise<Uint8Array | { [key: number]: number }>; // Accept plain object too
  downloadFilename: string;
  children: React.ReactNode;
  className?: string;
}

export function DownloadButton({
  action,
  downloadFilename,
  children,
  className = "rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 disabled:opacity-50 disabled:cursor-not-allowed",
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // The server action returns the Uint8Array data potentially as a plain object/array
      const result = await action();
      // Convert the plain object/array back to Uint8Array if necessary
      const pdfBytes =
        result instanceof Uint8Array
          ? result
          : new Uint8Array(Object.values(result));

      // Create a Blob from the Uint8Array
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      // Create a URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFilename; // Use the prop for filename

      // Append the link to the body (required for Firefox)
      document.body.appendChild(link);

      // Programmatically click the link to trigger the download
      link.click();

      // Clean up by removing the link and revoking the URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        `Failed to generate or download ${downloadFilename}:`,
        error
      );
      alert(`Failed to generate ${downloadFilename}. Please try again.`); // Simple user feedback
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDownload} disabled={loading} className={className}>
      {loading ? "Generating..." : children}
    </button>
  );
}
