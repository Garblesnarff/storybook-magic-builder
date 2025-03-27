
import { jsPDF } from "jspdf";
import { Book, BookPage } from "@/types/book";

// Helper function to create a new PDF document
const createPdf = () => {
  return new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
};

// Calculate optimal image dimensions to fit in PDF
const calculateImageDimensions = (
  imageWidth: number, 
  imageHeight: number, 
  maxWidth: number, 
  maxHeight: number
) => {
  const ratio = Math.min(maxWidth / imageWidth, maxHeight / imageHeight);
  return {
    width: imageWidth * ratio,
    height: imageHeight * ratio
  };
};

// Add text to PDF with proper formatting
const addTextToPdf = (
  doc: jsPDF, 
  text: string, 
  x: number, 
  y: number, 
  maxWidth: number,
  textFormatting: any
) => {
  const fontSize = textFormatting?.fontSize || 12;
  const fontStyle = textFormatting?.bold ? "bold" : "normal";
  
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", fontStyle);
  
  const textLines = doc.splitTextToSize(text, maxWidth);
  doc.text(textLines, x, y);
  
  return textLines.length * (fontSize * 0.352778); // Approximate height of text block
};

// Process an image for the PDF (loading and adding)
const processImage = (doc: jsPDF, imageUrl: string, x: number, y: number, maxWidth: number, maxHeight: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      resolve(0); // No image, no height used
      return;
    }
    
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Handle CORS issues
    
    img.onload = () => {
      const dimensions = calculateImageDimensions(img.width, img.height, maxWidth, maxHeight);
      try {
        doc.addImage(img, "JPEG", x, y, dimensions.width, dimensions.height);
        resolve(dimensions.height);
      } catch (err) {
        console.error("Error adding image to PDF:", err);
        reject(err);
      }
    };
    
    img.onerror = (err) => {
      console.error("Error loading image:", err);
      resolve(0); // Continue without the image
    };
    
    img.src = imageUrl;
  });
};

// Export a book to PDF
export const exportBookToPdf = async (book: Book): Promise<Blob> => {
  const doc = createPdf();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15; // mm
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = pageHeight - (margin * 2);
  
  // Add title page
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(book.title, pageWidth / 2, pageHeight / 3, { align: "center" });
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(`by ${book.author}`, pageWidth / 2, pageHeight / 3 + 10, { align: "center" });
  
  // Sort pages by page number to ensure correct order
  const orderedPages = [...book.pages].sort((a, b) => a.pageNumber - b.pageNumber);
  
  // Process each page
  for (const page of orderedPages) {
    doc.addPage();
    await addPageContentToPdf(doc, page, margin, contentWidth, contentHeight);
  }
  
  return doc.output("blob");
};

// Add a single page content to the PDF
const addPageContentToPdf = async (
  doc: jsPDF, 
  page: BookPage, 
  margin: number, 
  contentWidth: number, 
  contentHeight: number
): Promise<void> => {
  const { layout, text, image, textFormatting } = page;
  
  switch (layout) {
    case "text-left-image-right": {
      const textWidth = contentWidth / 2 - 5;
      const textHeight = addTextToPdf(doc, text, margin, margin + 10, textWidth, textFormatting);
      await processImage(doc, image, margin + textWidth + 10, margin, textWidth, contentHeight);
      break;
    }
    case "image-left-text-right": {
      const textWidth = contentWidth / 2 - 5;
      await processImage(doc, image, margin, margin, textWidth, contentHeight);
      addTextToPdf(doc, text, margin + textWidth + 10, margin + 10, textWidth, textFormatting);
      break;
    }
    case "text-top-image-bottom": {
      const textHeight = addTextToPdf(doc, text, margin, margin + 10, contentWidth, textFormatting);
      await processImage(doc, image, margin, margin + textHeight + 15, contentWidth, contentHeight / 2);
      break;
    }
    case "image-top-text-bottom": {
      const imageHeight = await processImage(doc, image, margin, margin, contentWidth, contentHeight / 2);
      addTextToPdf(doc, text, margin, margin + imageHeight + 15, contentWidth, textFormatting);
      break;
    }
    case "full-page-image": {
      await processImage(doc, image, margin, margin, contentWidth, contentHeight);
      const textBackground = "rgba(0, 0, 0, 0.5)";
      // Text would be overlay on image, but jsPDF doesn't support this well
      // We'll add the text at the bottom with simpler formatting
      addTextToPdf(doc, text, margin, pageHeight - margin - 20, contentWidth, textFormatting);
      break;
    }
    case "full-page-text": {
      addTextToPdf(doc, text, margin, margin + 10, contentWidth, textFormatting);
      break;
    }
    default:
      // Default to text-left-image-right
      const textWidth = contentWidth / 2 - 5;
      const textHeight = addTextToPdf(doc, text, margin, margin + 10, textWidth, textFormatting);
      await processImage(doc, image, margin + textWidth + 10, margin, textWidth, contentHeight);
  }
};

// Generate a filename for the downloaded PDF
export const generatePdfFilename = (book: Book): string => {
  // Replace spaces and special characters with underscores
  const safeTitle = book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${safeTitle}_book.pdf`;
};
