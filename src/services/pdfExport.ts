import PDFKit from 'pdfkit';
// Add a @ts-ignore to bypass the module error until we install the dependency
// @ts-ignore
import blobStream from 'blob-stream';
import { Book } from '@/types/book';

// Function to convert inches to points (1 inch = 72 points)
const inchesToPoints = (inches: number) => {
  return inches * 72;
};

// Function to add a page to the PDF document
const addPage = (doc: PDFKit.PDFDocument, book: Book) => {
  doc.addPage({
    size: [inchesToPoints(book.dimensions.width), inchesToPoints(book.dimensions.height)],
    margins: {
      top: inchesToPoints(0.5),
      bottom: inchesToPoints(0.5),
      left: inchesToPoints(0.5),
      right: inchesToPoints(0.5)
    }
  });
};

// Function to add text to the PDF document
const addText = (
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  options: PDFKit.Mixins.TextOptions
) => {
  doc.text(text, x, y, options);
};

// Function to add an image to the PDF document
const addImage = (
  doc: PDFKit.PDFDocument,
  image: string,
  x: number,
  y: number,
  options: { width?: number; height?: number }
) => {
  doc.image(image, x, y, options);
};

// Function to set the font and size for the PDF document
const setFont = (doc: PDFKit.PDFDocument, font: string, size: number) => {
  doc.font(font).fontSize(size);
};

// Function to draw a rectangle
const drawRectangle = (
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) => {
  doc.rect(x, y, width, height).fill(color);
};

// Function to calculate image position and size based on layout
const calculateImageLayout = (
  pageWidth: number,
  pageHeight: number,
  layout: string,
  imageWidthRatio: number,
  imageHeightRatio: number
) => {
  let imageX, imageY, imageWidth, imageHeight;
  
  switch (layout) {
    case 'text-left-image-right':
      imageWidth = pageWidth * imageWidthRatio;
      imageHeight = pageHeight * imageHeightRatio;
      imageX = pageWidth * (1 - imageWidthRatio);
      imageY = (pageHeight - imageHeight) / 2;
      break;
    case 'text-right-image-left':
      imageWidth = pageWidth * imageWidthRatio;
      imageHeight = pageHeight * imageHeightRatio;
      imageX = 0;
      imageY = (pageHeight - imageHeight) / 2;
      break;
    case 'text-top-image-bottom':
      imageWidth = pageWidth * imageWidthRatio;
      imageHeight = pageHeight * imageHeightRatio;
      imageX = (pageWidth - imageWidth) / 2;
      imageY = pageHeight * (1 - imageHeightRatio);
      break;
    case 'text-bottom-image-top':
      imageWidth = pageWidth * imageWidthRatio;
      imageHeight = pageHeight * imageHeightRatio;
      imageX = (pageWidth - imageWidth) / 2;
      imageY = 0;
      break;
    case 'full-image':
      imageWidth = pageWidth;
      imageHeight = pageHeight;
      imageX = 0;
      imageY = 0;
      break;
    default: // 'text-only'
      imageX = 0;
      imageY = 0;
      imageWidth = 0;
      imageHeight = 0;
      break;
  }
  
  return { imageX, imageY, imageWidth, imageHeight };
};

// Function to calculate text position and size based on layout
const calculateTextLayout = (
  pageWidth: number,
  pageHeight: number,
  layout: string,
  imageWidthRatio: number,
  imageHeightRatio: number
) => {
  let textX, textY, textWidth, textHeight;
  
  switch (layout) {
    case 'text-left-image-right':
      textWidth = pageWidth * (1 - imageWidthRatio);
      textHeight = pageHeight * 0.8;
      textX = 0;
      textY = (pageHeight - textHeight) / 2;
      break;
    case 'text-right-image-left':
      textWidth = pageWidth * (1 - imageWidthRatio);
      textHeight = pageHeight * 0.8;
      textX = pageWidth * imageWidthRatio;
      textY = (pageHeight - textHeight) / 2;
      break;
    case 'text-top-image-bottom':
      textWidth = pageWidth * 0.8;
      textHeight = pageHeight * (1 - imageHeightRatio);
      textX = (pageWidth - textWidth) / 2;
      textY = 0;
      break;
    case 'text-bottom-image-top':
      textWidth = pageWidth * 0.8;
      textHeight = pageHeight * (1 - imageHeightRatio);
      textX = (pageWidth - textWidth) / 2;
      textY = pageHeight * imageHeightRatio;
      break;
    case 'text-only':
      textWidth = pageWidth * 0.8;
      textHeight = pageHeight * 0.8;
      textX = (pageWidth - textWidth) / 2;
      textY = (pageHeight - textHeight) / 2;
      break;
    default: // 'full-image'
      textX = 0;
      textY = 0;
      textWidth = 0;
      textHeight = 0;
      break;
  }
  
  return { textX, textY, textWidth, textHeight };
};

const renderPdf = async (book: Book) => {
  const doc = new PDFKit({
    size: [inchesToPoints(book.dimensions.width), inchesToPoints(book.dimensions.height)],
    margins: {
      top: inchesToPoints(0.5),
      bottom: inchesToPoints(0.5),
      left: inchesToPoints(0.5),
      right: inchesToPoints(0.5)
    }
  });
  
  const stream = blobStream();
  doc.pipe(stream);
  
  // Set document metadata
  doc.info['Title'] = book.title;
  doc.info['Author'] = book.author;
  doc.info['Subject'] = book.description;
  doc.info['CreationDate'] = new Date(book.createdAt);
  doc.info['ModDate'] = new Date(book.updatedAt);
  
  const pageWidth = inchesToPoints(book.dimensions.width);
  const pageHeight = inchesToPoints(book.dimensions.height);
  
  // Function to add a page number in the footer
  const addFooter = (pageNum: number, totalPages: number) => {
    const footerText = `Page ${pageNum} of ${totalPages}`;
    const footerOptions = {
      align: 'center' as 'center' | 'left' | 'right' | 'justify',
    };
    
    doc.fillColor('gray');
    setFont(doc, 'Helvetica', 10);
    addText(
      doc,
      footerText,
      0,
      pageHeight - inchesToPoints(0.5),
      {
        ...footerOptions,
        width: pageWidth,
      }
    );
    doc.fillColor('black'); // Reset fill color to black
  };
  
  // Loop through each page and add content
  for (let i = 0; i < book.pages.length; i++) {
    const page = book.pages[i];
    
    if (i > 0) {
      addPage(doc, book);
    }
    
    // Draw background color
    if (page.backgroundColor) {
      drawRectangle(
        doc,
        0,
        0,
        pageWidth,
        pageHeight,
        page.backgroundColor
      );
    }
    
    // Calculate image layout
    const imageWidthRatio = 0.4;
    const imageHeightRatio = 0.6;
    const {
      imageX,
      imageY,
      imageWidth,
      imageHeight
    } = calculateImageLayout(
      pageWidth,
      pageHeight,
      page.layout,
      imageWidthRatio,
      imageHeightRatio
    );
    
    // Add image if it exists
    if (page.image) {
      try {
        addImage(
          doc,
          page.image,
          imageX,
          imageY,
          {
            width: imageWidth,
            height: imageHeight
          }
        );
      } catch (error) {
        console.error('Error adding image:', error);
        // Fallback: Add a placeholder or skip the image
        doc.rect(imageX, imageY, imageWidth, imageHeight).stroke();
        doc.text('Image failed to load', imageX + 5, imageY + 5, {
          width: imageWidth - 10,
          height: imageHeight - 10,
          align: 'center',
          valign: 'center'
        });
      }
    }
    
    // Calculate text layout
    const {
      textX,
      textY,
      textWidth,
      textHeight
    } = calculateTextLayout(
      pageWidth,
      pageHeight,
      page.layout,
      imageWidthRatio,
      imageHeightRatio
    );
    
    // Add text if it exists
    if (page.text) {
      setFont(
        doc,
        page.textFormatting?.fontFamily || 'Helvetica',
        page.textFormatting?.fontSize || 12
      );
      
      doc.fillColor(page.textFormatting?.fontColor || 'black');
      
      const textOptions = {
        width: textWidth,
        height: textHeight,
        align: 'center' as 'center' | 'left' | 'right' | 'justify'
      };
      
      addText(
        doc,
        page.text,
        textX,
        textY,
        textOptions
      );
      
      doc.fillColor('black'); // Reset fill color to black
    }
    
    // Add footer with page number
    addFooter(i + 1, book.pages.length);
  }
  
  doc.end();
  
  return new Promise<Blob>((resolve, reject) => {
    stream.on('finish', () => {
      const blob = stream.toBlob('application/pdf');
      resolve(blob);
    });
    
    stream.on('error', (err: Error) => {
      reject(err);
    });
  });
};

export default renderPdf;
