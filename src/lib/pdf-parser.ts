import * as pdfjsLib from 'pdfjs-dist';

// In Vite, we can point to the worker using the ?url suffix
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface PDFExtractionResult {
  text: string;
  links: string[];
}

export async function extractTextFromPDF(file: File): Promise<PDFExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const links: string[] = [];
    
    // Iterate through each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const annotations = await page.getAnnotations();
      
      // Extract text items and join them
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
        
      fullText += pageText + '\n';
      
      // Extract URL links from annotations
      annotations.forEach((anno: any) => {
        if (anno.subtype === 'Link' && anno.url) {
          links.push(anno.url);
        }
      });
    }
    
    return { text: fullText, links };
  } catch (error) {
    console.error('Error extracting data from PDF:', error);
    throw new Error('Failed to parse PDF file. Please ensure it is a valid text-based PDF.');
  }
}
