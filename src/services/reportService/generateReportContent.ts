import { Job } from '@/types/job.types';
import { 
  generateJobOverviewContent,
  generateCandidateRankingsContent,
  generateComparisonSummaryContent,
  generateRecommendationsContent
} from './contentGenerators';

/**
 * Generate complete report content
 */
export const generateReportContent = (job: Job, candidateIds: string[], additionalPrompt?: string) => {
  // Get selected candidates
  const selectedCandidates = job.candidates.filter(c => candidateIds.includes(c.id));
  
  // Sort candidates by overall score (descending)
  const rankedCandidates = [...selectedCandidates].sort((a, b) => b.overallScore - a.overallScore);
  
  // Generate report content
  let content = `# Candidate Ranking Report for ${job.title} at ${job.company}\n\n`;
  
  // Add date
  content += `**Generated on:** ${new Date().toLocaleDateString()}\n\n`;
  
  // Add job details and requirements
  content += generateJobOverviewContent(job);
  
  // Add candidate rankings
  content += generateCandidateRankingsContent(job, rankedCandidates);
  
  // Add comparison summary
  content += generateComparisonSummaryContent(rankedCandidates);
  
  // Add recommendations
  content += generateRecommendationsContent(rankedCandidates);
  
  // Add additional analysis if user provided a prompt
  if (additionalPrompt) {
    content += `\n## Additional Analysis\n\n`;
    content += `Based on the additional prompt: "${additionalPrompt}"\n\n`;
    content += `The requested analysis would be generated here based on the specific prompt and candidate data.\n\n`;
  }
  
  return content;
};
