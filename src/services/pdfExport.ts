
import { jsPDF } from 'jspdf';
import { Book, BookPage } from '@/types/book';

export const generatePdfFilename = (book: Book): string => {
  const sanitizedTitle = book.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `${sanitizedTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
};

export const exportBookToPdf = async (book: Book): Promise<Blob> => {
  // Create a new PDF document
  const pdf = new jsPDF({
    orientation: book.orientation,
    unit: 'in',
    format: [book.dimensions.width, book.dimensions.height]
  });

  // Set default font
  pdf.setFont('Helvetica');

  // Get page dimensions in points
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Margins in inches
  const margin = 0.5;

  // Process each page
  for (let i = 0; i < book.pages.length; i++) {
    // Add a new page for all pages except the first one
    if (i > 0) {
      pdf.addPage();
    }

    const page = book.pages[i];
    await addPageToPdf(pdf, page, pageWidth, pageHeight, margin);
  }

  // Return as blob
  return pdf.output('blob');
};

const addPageToPdf = async (
  pdf: jsPDF,
  pageData: BookPage,
  pageWidth: number,
  pageHeight: number,
  margin: number
): Promise<void> => {
  // Set background color if specified
  if (pageData.backgroundColor) {
    pdf.setFillColor(pageData.backgroundColor);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  // Handle different layouts
  switch (pageData.layout) {
    case 'text-left-image-right':
      await addTextLeftImageRight(pdf, pageData, pageWidth, pageHeight, margin);
      break;
    case 'image-left-text-right':
      await addImageLeftTextRight(pdf, pageData, pageWidth, pageHeight, margin);
      break;
    case 'text-top-image-bottom':
      await addTextTopImageBottom(pdf, pageData, pageWidth, pageHeight, margin);
      break;
    case 'image-top-text-bottom':
      await addImageTopTextBottom(pdf, pageData, pageWidth, pageHeight, margin);
      break;
    case 'full-page-text':
      addFullPageText(pdf, pageData, pageWidth, pageHeight, margin);
      break;
    case 'full-page-image':
      await addFullPageImage(pdf, pageData, pageWidth, pageHeight);
      break;
    default:
      // Default to text-left-image-right
      await addTextLeftImageRight(pdf, pageData, pageWidth, pageHeight, margin);
  }
};

const addTextLeftImageRight = async (
  pdf: jsPDF,
  pageData: BookPage,
  pageWidth: number,
  pageHeight: number,
  margin: number
): Promise<void> => {
  // Text area (left half)
  const textWidth = (pageWidth / 2) - (margin * 1.5);
  const textX = margin;
  const textY = margin;
  const textHeight = pageHeight - (margin * 2);

  // Add text
  addFormattedText(pdf, pageData.text, pageData.textFormatting, textX, textY, textWidth, textHeight);

  // Image area (right half)
  if (pageData.image) {
    const imageX = pageWidth / 2;
    const imageY = margin;
    const imageWidth = (pageWidth / 2) - (margin * 1.5);
    const imageHeight = pageHeight - (margin * 2);

    await addImage(pdf, pageData.image, imageX, imageY, imageWidth, imageHeight);
  }
};

const addImageLeftTextRight = async (
  pdf: jsPDF,
  pageData: BookPage,
  pageWidth: number,
  pageHeight: number,
  margin: number
): Promise<void> => {
  // Image area (left half)
  if (pageData.image) {
    const imageX = margin;
    const imageY = margin;
    const imageWidth = (pageWidth / 2) - (margin * 1.5);
    const imageHeight = pageHeight - (margin * 2);

    await addImage(pdf, pageData.image, imageX, imageY, imageWidth, imageHeight);
  }

  // Text area (right half)
  const textWidth = (pageWidth / 2) - (margin * 1.5);
  const textX = pageWidth / 2;
  const textY = margin;
  const textHeight = pageHeight - (margin * 2);

  // Add text
  addFormattedText(pdf, pageData.text, pageData.textFormatting, textX, textY, textWidth, textHeight);
};

const addTextTopImageBottom = async (
  pdf: jsPDF,
  pageData: BookPage,
  pageWidth: number,
  pageHeight: number,
  margin: number
): Promise<void> => {
  // Text area (top half)
  const textWidth = pageWidth - (margin * 2);
  const textX = margin;
  const textY = margin;
  const textHeight = (pageHeight / 2) - (margin * 1.5);

  // Add text
  addFormattedText(pdf, pageData.text, pageData.textFormatting, textX, textY, textWidth, textHeight);

  // Image area (bottom half)
  if (pageData.image) {
    const imageX = margin;
    const imageY = pageHeight / 2;
    const imageWidth = pageWidth - (margin * 2);
    const imageHeight = (pageHeight / 2) - (margin * 1.5);

    await addImage(pdf, pageData.image, imageX, imageY, imageWidth, imageHeight);
  }
};

const addImageTopTextBottom = async (
  pdf: jsPDF,
  pageData: BookPage,
  pageWidth: number,
  pageHeight: number,
  margin: number
): Promise<void> => {
  // Image area (top half)
  if (pageData.image) {
    const imageX = margin;
    const imageY = margin;
    const imageWidth = pageWidth - (margin * 2);
    const imageHeight = (pageHeight / 2) - (margin * 1.5);

    await addImage(pdf, pageData.image, imageX, imageY, imageWidth, imageHeight);
  }

  // Text area (bottom half)
  const textWidth = pageWidth - (margin * 2);
  const textX = margin;
  const textY = pageHeight / 2;
  const textHeight = (pageHeight / 2) - (margin * 1.5);

  // Add text
  addFormattedText(pdf, pageData.text, pageData.textFormatting, textX, textY, textWidth, textHeight);
};

const addFullPageText = (
  pdf: jsPDF,
  pageData: BookPage,
  pageWidth: number,
  pageHeight: number,
  margin: number
): void => {
  // Text area (full page with margins)
  const textWidth = pageWidth - (margin * 2);
  const textX = margin;
  const textY = margin;
  const textHeight = pageHeight - (margin * 2);

  // Add text
  addFormattedText(pdf, pageData.text, pageData.textFormatting, textX, textY, textWidth, textHeight);
};

const addFullPageImage = async (
  pdf: jsPDF,
  pageData: BookPage,
  pageWidth: number,
  pageHeight: number
): Promise<void> => {
  // Image area (full page)
  if (pageData.image) {
    await addImage(pdf, pageData.image, 0, 0, pageWidth, pageHeight);
  }
};

const addFormattedText = (
  pdf: jsPDF,
  text: string,
  formatting: any,
  x: number,
  y: number,
  width: number,
  height: number
): void => {
  // Set font style based on formatting
  if (formatting) {
    // Set font family
    const fontFamily = formatting.fontFamily || 'Helvetica';
    
    // Set font style (bold, italic, or both)
    let fontStyle = 'normal';
    if (formatting.isBold && formatting.isItalic) {
      fontStyle = 'bolditalic';
    } else if (formatting.isBold) {
      fontStyle = 'bold';
    } else if (formatting.isItalic) {
      fontStyle = 'italic';
    }
    
    // Set font color
    if (formatting.fontColor) {
      // Convert hex color to RGB
      const r = parseInt(formatting.fontColor.slice(1, 3), 16);
      const g = parseInt(formatting.fontColor.slice(3, 5), 16);
      const b = parseInt(formatting.fontColor.slice(5, 7), 16);
      pdf.setTextColor(r, g, b);
    } else {
      pdf.setTextColor(0);
    }
    
    // Set font size (convert from px to pt)
    const fontSize = formatting.fontSize ? formatting.fontSize / 1.33 : 12;
    
    pdf.setFont(fontFamily, fontStyle);
    pdf.setFontSize(fontSize);
  }

  // Add text with proper wrapping
  const splitText = pdf.splitTextToSize(text, width);
  pdf.text(splitText, x, y + 0.2); // Add a small offset for better positioning
};

const addImage = async (
  pdf: jsPDF,
  imageData: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> => {
  try {
    // Handle base64 data URLs
    if (imageData.startsWith('data:image')) {
      const format = imageData.split(';')[0].split('/')[1];
      pdf.addImage(imageData, format.toUpperCase(), x, y, width, height, undefined, 'FAST');
    } else {
      // For URL images, fetch and convert to base64 first
      const img = new Image();
      img.src = imageData;
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          
          const dataURL = canvas.toDataURL('image/jpeg');
          pdf.addImage(dataURL, 'JPEG', x, y, width, height, undefined, 'FAST');
          resolve();
        };
        img.onerror = () => {
          console.error('Failed to load image:', imageData);
          resolve(); // Still resolve so PDF generation continues
        };
      });
    }
  } catch (error) {
    console.error('Error adding image to PDF:', error);
    // Continue without the image
  }
};
