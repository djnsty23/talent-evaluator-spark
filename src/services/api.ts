
// Re-export all services for backward compatibility
import { JobService } from './jobService';
import { AIService, extractTextFromFile } from './aiService';
import * as CandidateService from './candidateService';
import { generateReport } from './reportService/generateReport';

// Re-export the services for backward compatibility
export { JobService, AIService, extractTextFromFile };

// Create a ReportService class for the old API format
export class ReportService {
  static generateReport = generateReport;
}

// Re-export individual functions from candidate service
export const uploadCandidateFiles = CandidateService.uploadCandidateFiles;
export const starCandidate = CandidateService.starCandidate;
export const deleteCandidate = CandidateService.deleteCandidate;
