import { jsPDF } from 'jspdf';
import { Book, BookPage } from '@/types/book';
import { toast } from "@/components/ui/use-toast";

export const generatePdfFilename = (book: Book): string => {
  const sanitizedTitle = book.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `${sanitizedTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
};

export const exportBookToPdf = async (book: Book): Promise<Blob> => {
  try {
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

    const errors: string[] = [];

    // Process each page
    for (let i = 0; i < book.pages.length; i++) {
      // Add a new page for all pages except the first one
      if (i > 0) {
        pdf.addPage();
      }

      const page = book.pages[i];
      try {
        await addPageToPdf(pdf, page, pageWidth, pageHeight, margin);
      } catch (err) {
        console.error(`Error exporting page ${i + 1}:`, err);
        errors.push(`Page ${i + 1}`);
      }
    }

    if (errors.length > 0) {
      toast({
        title: 'PDF Export Completed with Errors',
        description: `Some pages failed to export: ${errors.join(', ')}`,
        variant: 'destructive',
      });
    }

    // Return as blob
    return pdf.output('blob');
  } catch (err) {
    console.error('Error exporting book to PDF:', err);
    toast({
      title: 'PDF Export Failed',
      description: 'An error occurred while exporting the book to PDF. Please try again.',
      variant: 'destructive',
    });
    throw err;
  }
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
    let imageSrc: string | null = null;
    let format: string = 'PNG'; // Default format

    // Determine image source and format
    if (imageData.startsWith('data:image')) {
      // Handle base64 data URLs directly
      imageSrc = imageData;
      const formatPart = imageData.split(';')[0].split('/')[1];
      if (formatPart) {
        format = formatPart.toUpperCase();
        if (format === 'JPEG') format = 'JPG'; // jsPDF uses JPG
      }
      console.log(`Using provided base64 image. Format: ${format}`);

    } else {
      // Handle URL images by fetching and converting to base64
      console.log(`Fetching image from URL: ${imageData}`);
      try {
        const response = await fetch(imageData);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();

        // Determine image format from blob type
        if (blob.type === 'image/jpeg' || blob.type === 'image/jpg') {
          format = 'JPG'; // jsPDF uses JPG
        } else if (blob.type === 'image/png') {
          format = 'PNG';
        } else {
           console.warn(`Unknown image blob type: ${blob.type}. Defaulting to PNG.`);
           format = 'PNG';
        }
        console.log(`Image format determined as: ${format}`);

        // Convert Blob to base64 Data URL
        imageSrc = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        console.log(`Adding fetched image (base64) to PDF. Format: ${format}`);

      } catch (fetchError) {
        console.error(`Error fetching or processing image URL ${imageData}:`, fetchError);
        // Skip adding the image on fetch error
        return;
      }
    }

    // If we have an image source (either original base64 or fetched), calculate aspect ratio and add
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;

            if (imgWidth === 0 || imgHeight === 0) {
              console.error('Image has zero dimensions:', imageSrc);
              resolve(); // Skip adding zero-dimension image
              return;
            }

            const imgRatio = imgWidth / imgHeight;
            const boxRatio = width / height;

            let drawWidth = width;
            let drawHeight = height;

            // Calculate dimensions to fit within the box while preserving aspect ratio ('contain' logic)
            if (imgRatio > boxRatio) { // Image is wider than the box
              drawHeight = width / imgRatio;
            } else { // Image is taller than or equal to the box
              drawWidth = height * imgRatio;
            }

            // Calculate centering offsets
            const offsetX = (width - drawWidth) / 2;
            const offsetY = (height - drawHeight) / 2;

            // Add the image with corrected dimensions and centering
            pdf.addImage(
              imageSrc!, // Use the determined image source (base64)
              format,
              x + offsetX, // Centered X
              y + offsetY, // Centered Y
              drawWidth,   // Aspect-corrected width
              drawHeight,  // Aspect-corrected height
              undefined,
              'FAST'
            );
            resolve();
          } catch (addImgError) {
             console.error('Error calculating image dimensions or adding image to PDF:', addImgError);
             reject(addImgError); // Reject the promise on error during calculation/adding
          }
        };
        img.onerror = (err) => {
          console.error('Failed to load image data for dimension calculation:', imageSrc, err);
          reject(new Error('Image loading failed')); // Reject the promise on image load error
        };
      });
    } else {
       console.warn('No valid image source to add to PDF.');
    }

  } catch (error) {
    console.error('Error adding image to PDF:', error);
    // Continue without the image if an error occurred in the outer try
  }
};

const renderHeader = (doc, book, pageNum, totalPages, width) => {
  // Remove unused height variable from function parameters
  const headerY = 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(book.title, 20, headerY);
  doc.text(`Page ${pageNum} of ${totalPages}`, width - 40, headerY, { align: 'right' });
};
