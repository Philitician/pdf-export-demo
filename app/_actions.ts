"use server";

import { PDFDocument, rgb, PageSizes, type RGB, type PDFPage } from "pdf-lib";
import { parseSync, type INode as SvgsonNode } from "svgson";
import { drawingNodes, type DrawingNode } from "../drawing-nodes2"; // Removed .ts extension

const HEADER_HEIGHT = 50;
const FOOTER_HEIGHT = 40;
const SIDEBAR_WIDTH = 150;

// Define SVG data strings for each node
const svgDataNode1 =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 40 40">  <path stroke="currentColor" d="M18.714 20.449 25.868 9l6.36 3.974M22 26a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" fill="none"/>  <path fill="currentColor" d="M28.38 23.697A1.96 1.96 0 0 0 27.475 20a1.961 1.961 0 0 0-.925 3.687l-.385 1.422H22v1h3.894l-.286 1.054H22v1h3.338l-.973 3.595h6.15l-2.134-8.061Z" stroke="none"/></svg>';
const svgDataNode2 =
  '<svg width="40" height="40" fill="none" viewBox="0 0 40 40">  <path fill="#fff" d="M9 9h22v22H9V9Z" stroke="none" />  <path fill="#428154" fill-rule="evenodd" d="M31.125 9v22H9V9h22.125Zm-6.687 20.254c-.286.265-1.391 1.497-1.391 1.497h2.4l1.303-1.32v-9.18h-2.843l-.115-.136c-.383-.452-1.524-1.8-1.593-1.729-.069.07-1.199 2.497-1.199 2.574 0 .032.846 1.75 1.88 3.816 1.034 2.067 1.85 3.785 1.814 3.822-.092.093-.926.082-1.458-.018-.245-.045-.56-.21-.7-.363-.14-.154-.949-1.671-1.799-3.372-.85-1.703-1.587-3.095-1.64-3.095-.13 0-.153.727-.18 1.567-.034 1.03-.072 2.232-.32 2.479-.179.18-.623.205-3.588.205-2.514 0-3.305.012-3.397-.236-.046-.124.082-.313.257-.6.403-.662.626-.72 3.006-.789l2.188-.064.276-3.874 1.411-3h-1.687a8.795 8.795 0 0 0-.273.486c-.472.876-1.223 2.27-1.963 1.785-.491-.323-.412-.744.398-2.12.437-.74.67-1.161 1.026-1.4.489-.328 1.207-.312 2.999-.312 2.227 0 2.606.028 2.893.218.677.447 1.241 1.19 1.773 1.892.203.267.4.527.598.763h2.236V10.5H13.375v13.469c-.497.079-.985.16-1.386.497-.394.33-1.148 1.751-1.032 1.94.032.053.588.094 1.238.094h1.18v2.949l-.039.038c-.423.415-.846.83-1.25 1.264h8.705l1.563-1.5 2.084.003Zm-2.555-13.77a1.555 1.555 0 1 0 0-3.11 1.555 1.555 0 0 0 0 3.11Z" clip-rule="evenodd" stroke="none" /></svg>';
const svgDataNode3 =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 40 40">  <path stroke="currentColor" d="M18.714 20.449 25.868 9l6.36 3.974M22 26a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" fill="none"/></svg>';
const svgDataNode4 =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 40 40">  <path fill="#0A0A0A" d="M28.8 28.416h-3.76v-.632c2-1.536 2.92-2.336 2.92-3.176 0-.624-.52-.896-1.04-.896-.632 0-1.12.264-1.448.656l-.472-.52c.44-.552 1.168-.848 1.912-.848.96 0 1.864.544 1.864 1.608 0 1.04-1 1.976-2.464 3.104H28.8v.704Z"/>  <path stroke="currentColor" d="m18.714 20.449 5.035-8.057m0 0L25.869 9l6.36 3.974m-8.48-.582 6.36 3.975M19 26h5.5M13.2 5.987 6.576 9.508l6.338 11.92M22 26a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" fill="none"/></svg>';

// Color mapping from node color names to RGB
const COLOR_MAP: Record<string, RGB> = {
  Svart: rgb(0, 0, 0),
  Rød: rgb(1, 0, 0),
  Blå: rgb(0, 0, 1),
  Grønn: rgb(0, 1, 0),
  Orange: rgb(1, 0.5, 0),
};

// Helper function to parse basic SVG color strings (hex, common names) into RGB
const parseSvgColor = (colorString: string): RGB | undefined => {
  if (!colorString || colorString.toLowerCase() === "none") {
    return undefined;
  }

  const cleanedColor = colorString.trim().toLowerCase();

  // Basic names
  if (cleanedColor === "black") return rgb(0, 0, 0);
  if (cleanedColor === "white") return rgb(1, 1, 1);
  if (cleanedColor === "red") return rgb(1, 0, 0); // Example, add more if needed
  if (cleanedColor === "green") return rgb(0, 1, 0);
  if (cleanedColor === "blue") return rgb(0, 0, 1);

  // Hex patterns
  if (cleanedColor.startsWith("#")) {
    const hex = cleanedColor.substring(1);
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return rgb(r, g, b);
    } else if (hex.length === 3) {
      const r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16) / 255;
      const g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16) / 255;
      const b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16) / 255;
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return rgb(r, g, b);
    }
  }

  // TODO: Add support for rgb(), rgba(), hsl() if needed

  console.warn(`Unsupported color format: "${colorString}". Skipping color.`);
  return undefined;
};

// Define source URL and header height
const sourcePdfUrl =
  // "https://ygmypmwwkcejtqle.public.blob.vercel-storage.com/001a%20Guldmandsveien%2010%201%20og%202etg%20-%20Originaltegning-SM1mhxEf0HDVKQF3AlDeNi5fzhyWpN.pdf";
  // "https://cdn.prod.website-files.com/5d9c723257629dd37e842f2e/5e41158c97f1efedaf23524a_Om-EFOklasser.pdf";
  // "https://ygmypmwwkcejtqle.public.blob.vercel-storage.com/002a%20A22-104%201%20etasje%20%28Planlagt%20status%29-n92loVMORDoH4kMshVi7GcbtjuNyow.pdf";
  // "https://ygmypmwwkcejtqle.public.blob.vercel-storage.com/A20-01%20Plan%201%20Etasje-eGLQIjA4naEUmMZie7UlAiOVlIz7ws.pdf";
  "https://ygmypmwwkcejtqle.public.blob.vercel-storage.com/MultiPage%20PDF%20File-kXvo5bEjE6ciB9GZeskR6Fb9T7q2O7.pdf";

export const generatePDF = async (): Promise<Uint8Array> => {
  // Fetch the source PDF
  const response = await fetch(sourcePdfUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  }
  const sourcePdfBytes = await response.arrayBuffer();

  // Load the source PDF
  const sourcePdfDoc = await PDFDocument.load(sourcePdfBytes);

  // Get all pages from the source PDF
  const sourcePages = sourcePdfDoc.getPages();
  const totalPages = sourcePages.length;

  if (totalPages === 0) {
    throw new Error("No source pages found");
  }

  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  // --- Helper function to recursively find and draw paths (needs targetPage) ---
  const drawPathsFromSvgNode = (
    targetPage: PDFPage, // Added targetPage parameter
    svgParsedRoot: SvgsonNode,
    nodeData: DrawingNode,
    baseX: number,
    baseY: number,
    overallScale: number
  ) => {
    // --- Extract viewBox and calculate SVG scale ---
    let viewBox = { x: 0, y: 0, width: 0, height: 0 };
    let svgScale = overallScale; // Default to overall scale if viewBox is missing

    if (svgParsedRoot.name === "svg" && svgParsedRoot.attributes.viewBox) {
      const vbParts = svgParsedRoot.attributes.viewBox
        .split(/\\s*,?\\s+/)
        .map(Number);
      if (vbParts.length === 4 && !vbParts.some(isNaN)) {
        viewBox = {
          x: vbParts[0],
          y: vbParts[1],
          width: vbParts[2],
          height: vbParts[3],
        };
        if (viewBox.width > 0 && viewBox.height > 0) {
          const nodeWidth = nodeData.measured?.width ?? 40;
          const nodeHeight = nodeData.measured?.height ?? 40;
          const targetNodeWidth = nodeWidth * overallScale;
          const targetNodeHeight = nodeHeight * overallScale;
          svgScale = Math.min(
            targetNodeWidth / viewBox.width,
            targetNodeHeight / viewBox.height
          );
        }
      }
    } else {
      console.warn(
        `SVG node ${nodeData.id} missing or invalid viewBox, using overall scale`
      );
    }

    // --- Get Node Color ---
    const nodeColorRgb = COLOR_MAP[nodeData.data.color] || COLOR_MAP["Svart"];

    // --- Recursive function to find and draw paths ---
    const findAndDraw = (currentElement: SvgsonNode) => {
      if (currentElement.name === "path" && currentElement.attributes.d) {
        const pathData = currentElement.attributes.d;
        const pathFill = currentElement.attributes.fill;
        const pathStroke = currentElement.attributes.stroke;

        let fillColor: RGB | undefined = undefined;
        let strokeColor: RGB | undefined = undefined;
        let useBorderWidth: number | undefined = undefined;

        if (pathFill === "currentColor") {
          fillColor = nodeColorRgb;
        } else if (pathFill && pathFill !== "none") {
          fillColor = parseSvgColor(pathFill);
        }

        if (pathStroke === "currentColor") {
          strokeColor = nodeColorRgb;
          useBorderWidth = 1;
        } else if (pathStroke && pathStroke !== "none") {
          strokeColor = parseSvgColor(pathStroke);
          if (strokeColor) {
            useBorderWidth = currentElement.attributes["stroke-width"]
              ? parseFloat(currentElement.attributes["stroke-width"])
              : 1;
            if (isNaN(useBorderWidth) || useBorderWidth <= 0)
              useBorderWidth = 1;
          }
        }

        // Draw the path on the provided targetPage
        targetPage.drawSvgPath(pathData, {
          x: baseX,
          y: baseY,
          scale: svgScale,
          color: fillColor,
          borderColor: strokeColor,
          borderWidth: useBorderWidth,
        });
      }

      if (currentElement.children && currentElement.children.length > 0) {
        currentElement.children.forEach((child: SvgsonNode) =>
          findAndDraw(child)
        );
      }
    };

    findAndDraw(svgParsedRoot);
  };

  let firstPageEmbedX = 0;
  let firstPageEmbedY = 0;
  let firstPageScale = 1;
  let firstSourcePageCropHeight = 0; // Use CropBox height for SVG Y calculation

  // --- Loop through each source page ---
  for (let i = 0; i < totalPages; i++) {
    const sourcePage = sourcePages[i];

    // Add a new page (A4 Landscape)
    const targetPage = pdfDoc.addPage([PageSizes.A4[1], PageSizes.A4[0]]);
    const { width: targetWidth, height: targetHeight } = targetPage.getSize();

    // --- Draw Header ---
    targetPage.drawRectangle({
      x: 0,
      y: targetHeight - HEADER_HEIGHT,
      width: targetWidth,
      height: HEADER_HEIGHT,
      color: rgb(0.9, 0.9, 0.9),
    });
    targetPage.drawText("Document Header", {
      x: 50,
      y: targetHeight - HEADER_HEIGHT + 20,
      size: 24,
      color: rgb(0.2, 0.2, 0.2),
    });

    // --- Draw Sidebar ---
    targetPage.drawRectangle({
      x: 0,
      y: FOOTER_HEIGHT,
      width: SIDEBAR_WIDTH,
      height: targetHeight - HEADER_HEIGHT - FOOTER_HEIGHT,
      color: rgb(0.92, 0.92, 0.92),
    });
    targetPage.drawText("Sidebar Info", {
      x: 20,
      y: targetHeight - HEADER_HEIGHT - 30,
      size: 14,
      color: rgb(0.3, 0.3, 0.3),
    });
    targetPage.drawText("Project ID: 123", {
      x: 20,
      y: targetHeight - HEADER_HEIGHT - 60,
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
    });

    // --- Draw Footer ---
    targetPage.drawRectangle({
      x: 0,
      y: 0,
      width: targetWidth,
      height: FOOTER_HEIGHT,
      color: rgb(0.9, 0.9, 0.9),
    });
    targetPage.drawText(`Page ${i + 1} of ${totalPages}`, {
      // Updated page number
      x: 50,
      y: FOOTER_HEIGHT / 2 - 6,
      size: 12,
      color: rgb(0.2, 0.2, 0.2),
    });
    targetPage.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
      x: targetWidth - 150,
      y: FOOTER_HEIGHT / 2 - 6,
      size: 12,
      color: rgb(0.2, 0.2, 0.2),
    });

    // --- Embed Current Source Page ---
    // Get the CropBox first
    const cropBox = sourcePage.getCropBox();

    // Convert CropBox {x, y, width, height} to PageBoundingBox {left, bottom, right, top}
    const boundingBox = {
      left: cropBox.x,
      bottom: cropBox.y,
      right: cropBox.x + cropBox.width,
      top: cropBox.y + cropBox.height,
    };

    // Embed using the converted boundingBox
    const embeddedPage = await pdfDoc.embedPage(sourcePage, boundingBox);

    // Get dimensions from the CropBox for scaling calculations
    const { width: sourceCropWidth, height: sourceCropHeight } = cropBox; // Use the already fetched cropBox

    const availableWidth = targetWidth - SIDEBAR_WIDTH;
    const availableHeight = targetHeight - HEADER_HEIGHT - FOOTER_HEIGHT;

    // Calculate scale based on CropBox dimensions
    const scale = Math.min(
      availableWidth / sourceCropWidth,
      availableHeight / sourceCropHeight
    );
    const embeddedWidth = sourceCropWidth * scale;
    const embeddedHeight = sourceCropHeight * scale;

    // Position the bottom-left corner of the scaled CropBox content
    const embedX = SIDEBAR_WIDTH; // Start after the sidebar
    // Position vertically centered within the available content area
    const embedY = FOOTER_HEIGHT + (availableHeight - embeddedHeight) / 2;

    // Draw the embedded page (representing the CropBox content) onto the target page
    targetPage.drawPage(embeddedPage, {
      x: embedX,
      y: embedY,
      width: embeddedWidth,
      height: embeddedHeight,
    });

    // Store parameters for the first page if it's the first iteration
    if (i === 0) {
      firstPageEmbedX = embedX;
      firstPageEmbedY = embedY;
      firstPageScale = scale;
      firstSourcePageCropHeight = sourceCropHeight; // Store CropBox height
    }
  }

  // --- Simulate and Draw SVG Overlays ON THE FIRST PAGE ONLY ---
  const firstTargetPage = pdfDoc.getPages()[0]; // Get the first page we created
  if (firstTargetPage && totalPages > 0) {
    drawingNodes.forEach((node: DrawingNode) => {
      // Calculate SVG position relative to the *first* embedded page's origin and scale
      // Use the stored CropBox-based values
      const targetX = firstPageEmbedX + node.position.x * firstPageScale;
      // Adjust Y based on the *first* source page's CropBox height and overall scale
      const targetY =
        firstPageEmbedY +
        (firstSourcePageCropHeight - node.position.y) * firstPageScale -
        firstPageScale;

      try {
        // Parse the SVG string from node.data.svgData
        const parsedSvg = parseSync(node.data.svgData);

        // Draw paths from this parsed SVG node onto the first target page
        drawPathsFromSvgNode(
          firstTargetPage, // Pass the first page
          parsedSvg,
          node,
          targetX,
          targetY,
          firstPageScale // Pass the scale used for the first page
        );
      } catch (error) {
        console.error("Error parsing or drawing SVG for node:", node.id, error);
      }
    });
  }

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
};

export const generateSvgOnlyPDF = async (): Promise<Uint8Array> => {
  // Fetch the source PDF
  const response = await fetch(sourcePdfUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch source PDF: ${response.statusText}`);
  }
  const sourcePdfBytes = await response.arrayBuffer();

  // Load the source PDF document to modify it directly
  const pdfDoc = await PDFDocument.load(sourcePdfBytes);

  // Get the first page of the source PDF
  const targetPage = pdfDoc.getPages()[0]; // Modify the first page directly
  if (!targetPage) {
    throw new Error("No source page found to draw on");
  }
  // const { width: sourceWidth, height: sourceHeight } = targetPage.getMediaBox();
  // Use CropBox instead of MediaBox for coordinate calculations
  const {
    x: cropX,
    y: cropY,
    width: cropWidth,
    height: cropHeight,
  } = targetPage.getCropBox();

  // --- Replicate Helper Function for SVG Drawing (as it needs the targetPage) ---
  const drawPathsFromSvgNode = (
    svgParsedRoot: SvgsonNode,
    nodeData: DrawingNode,
    baseX: number,
    baseY: number
    // Scale is determined inside based on viewBox and node size
  ) => {
    let viewBox = { x: 0, y: 0, width: 0, height: 0 };
    let svgScale = 1; // Default scale

    if (svgParsedRoot.name === "svg" && svgParsedRoot.attributes.viewBox) {
      const vbParts = svgParsedRoot.attributes.viewBox
        .split(/\s*,?\s+/)
        .map(Number);
      if (vbParts.length === 4 && !vbParts.some(isNaN)) {
        viewBox = {
          x: vbParts[0],
          y: vbParts[1],
          width: vbParts[2],
          height: vbParts[3],
        };
        if (viewBox.width > 0 && viewBox.height > 0) {
          const nodeWidth = nodeData.measured?.width ?? 40;
          const nodeHeight = nodeData.measured?.height ?? 40;
          // Scale needed to draw the SVG content at the node's measured size
          svgScale = Math.min(
            nodeWidth / viewBox.width,
            nodeHeight / viewBox.height
          );
        }
      } else {
        console.warn(
          `SVG node ${nodeData.id} has invalid viewBox: ${svgParsedRoot.attributes.viewBox}`
        );
      }
    } else {
      // Fallback if no viewBox: Try using width/height attributes if present
      console.warn(
        `SVG node ${nodeData.id} missing viewBox. Trying width/height attributes.`
      );
      const nodeWidth = nodeData.measured?.width ?? 40;
      const nodeHeight = nodeData.measured?.height ?? 40;
      const svgWidthAttr = svgParsedRoot.attributes.width
        ? parseFloat(svgParsedRoot.attributes.width)
        : 0;
      const svgHeightAttr = svgParsedRoot.attributes.height
        ? parseFloat(svgParsedRoot.attributes.height)
        : 0;

      if (
        svgWidthAttr > 0 &&
        svgHeightAttr > 0 &&
        viewBox.width === 0 &&
        viewBox.height === 0
      ) {
        // If viewBox wasn't set, but width/height exist, use them for scaling
        svgScale = Math.min(
          nodeWidth / svgWidthAttr,
          nodeHeight / svgHeightAttr
        );
        console.log(`Using width/height for scale: ${svgScale}`);
      } else if (viewBox.width === 0 || viewBox.height === 0) {
        // Ultimate fallback if no dimensions found
        svgScale = 1;
        console.warn(
          `Could not determine dimensions for SVG node ${nodeData.id}. Using scale 1.`
        );
      }
      // If viewBox was present but invalid, svgScale might remain 1, which could be okay.
    }

    const nodeColorRgb = COLOR_MAP[nodeData.data.color] || COLOR_MAP["Svart"];

    const findAndDraw = (currentElement: SvgsonNode) => {
      if (currentElement.name === "path" && currentElement.attributes.d) {
        const pathData = currentElement.attributes.d;
        const pathFill = currentElement.attributes.fill;
        const pathStroke = currentElement.attributes.stroke;

        let fillColor: RGB | undefined = undefined;
        let strokeColor: RGB | undefined = undefined;
        let useBorderWidth: number | undefined = undefined;

        if (pathFill === "currentColor") {
          fillColor = nodeColorRgb;
        } else if (pathFill && pathFill !== "none") {
          fillColor = parseSvgColor(pathFill);
        }

        if (pathStroke === "currentColor") {
          strokeColor = nodeColorRgb;
          useBorderWidth = 1;
        } else if (pathStroke && pathStroke !== "none") {
          strokeColor = parseSvgColor(pathStroke);
          if (strokeColor) {
            useBorderWidth = currentElement.attributes["stroke-width"]
              ? parseFloat(currentElement.attributes["stroke-width"])
              : 1;
            if (isNaN(useBorderWidth) || useBorderWidth <= 0)
              useBorderWidth = 1;
          }
        }

        targetPage.drawSvgPath(pathData, {
          x: baseX,
          y: baseY,
          scale: svgScale,
          color: fillColor,
          borderColor: strokeColor,
          borderWidth: useBorderWidth,
        });
      }

      if (currentElement.children && currentElement.children.length > 0) {
        currentElement.children.forEach((child: SvgsonNode) =>
          findAndDraw(child)
        );
      }
    };

    findAndDraw(svgParsedRoot);
  };

  // --- Draw SVG Nodes onto the source page ---
  drawingNodes.forEach((node: DrawingNode) => {
    // Position relative to the CropBox origin (bottom-left corner of the crop area)
    const targetX = cropX + node.position.x; // X relative to cropBox.x
    // Adjust Y for PDF origin (bottom-left) vs SVG node origin (top-left)
    // Y position is relative to the bottom of the cropBox + adjusted for PDF Y-up direction
    const targetY = cropY + cropHeight - node.position.y;

    try {
      const parsedSvg = parseSync(node.data.svgData);
      drawPathsFromSvgNode(parsedSvg, node, targetX, targetY);
    } catch (error) {
      console.error("Error parsing or drawing SVG for node:", node.id, error);
    }
  });

  // Serialize the modified PDFDocument to bytes
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
};
