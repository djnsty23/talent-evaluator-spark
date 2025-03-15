/**
 * Utilities for handling files
 */

/**
 * Extract text content from a file
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Handle text files
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return await file.text();
  }

  // Handle PDF files - in a real app, you'd use a PDF parsing library
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    // This is a simplified example - in a real application, you'd use a PDF parsing library
    // like pdf.js to extract text more reliably
    return await file.text();
  }

  // Handle Word documents (.docx) - in a real app, you'd use a library to parse Office docs
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
    // This is a placeholder - in a real app, you'd use a library to parse Office docs
    return `Text extracted from Word document: ${file.name}`;
  }

  // For unrecognized formats, just return the file name as a fallback
  return `File content not extractable: ${file.name}`;
};

/**
 * Get a friendly file size string
 */
export const getFileSizeString = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

/**
 * Check if a file is too large
 */
export const isFileTooLarge = (file: File, maxSizeInMB: number = 5): boolean => {
  return file.size > maxSizeInMB * 1024 * 1024;
};

/**
 * Check if a file has an allowed extension
 */
export const hasAllowedExtension = (
  file: File, 
  allowedExtensions: string[] = ['.pdf', '.doc', '.docx', '.txt']
): boolean => {
  const fileName = file.name.toLowerCase();
  return allowedExtensions.some(ext => fileName.endsWith(ext));
}; 