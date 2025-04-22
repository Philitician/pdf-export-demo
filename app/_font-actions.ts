"use server";

import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";

export const generateCustomFontAction = async () => {
  // 1.  Create a new PDF
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit); // 👈 required once per doc  :contentReference[oaicite:2]{index=2}

  // 2.  Load (or re‑use) the font bytes
  const fontData = await fs.readFile(
    path.join(process.cwd(), "public", "fonts", "proxima_vara.woff2")
  );
  const proximaVara = await pdfDoc.embedFont(fontData);

  // 3.  Draw something
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  page.drawText("Hello custom font!", {
    font: proximaVara,
    size: 24,
    color: rgb(0, 0, 0),
    x: 50,
    y: 780,
  });

  return pdfDoc.save();
};

export const generateDefaultFontAction = async () => {
  // 1.  Create a new PDF
  const pdfDoc = await PDFDocument.create();

  // 3.  Draw something
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  page.drawText("Hello default font!", {
    size: 24,
    color: rgb(0, 0, 0),
    x: 50,
    y: 780,
  });

  return pdfDoc.save();
};

export const generateGeistFontAction = async () => {
  // 1.  Create a new PDF
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit); // 👈 required once per doc  :contentReference[oaicite:2]{index=2}

  // 2.  Load (or re‑use) the font bytes
  const fontData = await fs.readFile(
    path.join(process.cwd(), "public", "fonts", "Geist-Medium.ttf")
  );
  const geistSans = await pdfDoc.embedFont(fontData);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  page.drawText("Hello Geist font!", {
    font: geistSans,
    size: 24,
    color: rgb(0, 0, 0),
    x: 50,
    y: 780,
  });

  return pdfDoc.save();
};
