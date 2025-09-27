import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ExtractedInfo {
  name?: string;
  email?: string;
  phone?: string;
  text: string;
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + ' ';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const extractTextFromDOCX = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
};

export const parseResumeInfo = (text: string): ExtractedInfo => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const phoneRegex = /(\+?\d{1,3}[\s-]?)?\d{10,12}/g;
  
  // Simple name extraction - look for capitalized words at the beginning
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const nameRegex = /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/;
  
  let name = '';
  for (const line of lines.slice(0, 10)) {
    if (nameRegex.test(line) && !line.includes('@') && !line.match(phoneRegex)) {
      name = line;
      break;
    }
  }

  const emailMatches = text.match(emailRegex);
  const phoneMatches = text.match(phoneRegex);

  return {
    name: name || undefined,
    email: emailMatches?.[0] || undefined,
    phone: phoneMatches?.[0] || undefined,
    text,
  };
};

export const extractResumeInfo = async (file: File): Promise<ExtractedInfo> => {
  let text = '';
  
  if (file.type === 'application/pdf') {
    text = await extractTextFromPDF(file);
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    text = await extractTextFromDOCX(file);
  } else {
    throw new Error('Unsupported file type. Please upload PDF or DOCX files only.');
  }

  return parseResumeInfo(text);
};