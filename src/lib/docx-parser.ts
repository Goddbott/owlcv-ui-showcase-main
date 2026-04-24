import mammoth from 'mammoth';

export async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting data from DOCX:', error);
    throw new Error('Failed to parse DOCX file. Please ensure it is a valid Word document.');
  }
}
