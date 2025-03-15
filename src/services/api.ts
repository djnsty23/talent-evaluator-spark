
// Re-export all services for backward compatibility
import { JobService } from './jobService';
import { AIService, extractTextFromFile } from './aiService';
import { uploadCandidateFiles, starCandidate, deleteCandidate } from './candidateService/uploadCandidates';
import { generateReport } from './reportService/generateReport';

// Re-export the services for backward compatibility
export { JobService, AIService, extractTextFromFile };

// Create a ReportService class for the old API format
export class ReportService {
  static generateReport = generateReport;
}

// Re-export individual functions from candidate service
export const uploadCandidateFiles = uploadCandidateFiles;
export const starCandidate = starCandidate;
export const deleteCandidate = deleteCandidate;
