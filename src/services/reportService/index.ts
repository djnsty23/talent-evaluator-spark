
import { generateReport } from './generateReport';
import { linkCandidatesToReport, getCandidateIdsForReport } from './reportLinking';
import { generateReportContent } from './generateReportContent';
import { getReportById, getReportsForJob } from './reportRetrieval';
import { formatCandidateScores, formatCandidatesForAI, formatJobForAI } from './formatters';
import { 
  generateJobOverviewContent,
  generateCandidateRankingsContent,
  generateComparisonSummaryContent,
  generateRecommendationsContent
} from './contentGenerators';

// Export the helper functions for reuse elsewhere
export {
  generateReport,
  linkCandidatesToReport,
  getCandidateIdsForReport,
  generateReportContent,
  getReportById,
  getReportsForJob,
  formatCandidateScores,
  formatCandidatesForAI,
  formatJobForAI,
  generateJobOverviewContent,
  generateCandidateRankingsContent,
  generateComparisonSummaryContent,
  generateRecommendationsContent
};
