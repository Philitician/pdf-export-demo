import { generatePDF, generateSvgOnlyPDF } from "./_actions";
import { DownloadButton } from "./download-button";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <DownloadButton
            action={generatePDF}
            downloadFilename="generated-document.pdf"
          >
            Download PDF (with Template)
          </DownloadButton>

          <DownloadButton
            action={generateSvgOnlyPDF}
            downloadFilename="generated-svg-only.pdf"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-green-600 text-white gap-2 hover:bg-green-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download PDF (SVG Only)
          </DownloadButton>
        </div>
      </main>
    </div>
  );
}
