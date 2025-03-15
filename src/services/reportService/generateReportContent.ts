
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
  // Input validation
  if (!job || !job.candidates || !Array.isArray(job.candidates) || !candidateIds || !Array.isArray(candidateIds)) {
    console.error('Invalid inputs for report generation');
    return 'Error: Invalid data for report generation';
  }
  
  try {
    // Get selected candidates
    const selectedCandidates = job.candidates.filter(c => candidateIds.includes(c.id));
    
    if (!selectedCandidates || selectedCandidates.length === 0) {
      return 'No valid candidates selected for this report.';
    }
    
    // Sort candidates by overall score (descending)
    const rankedCandidates = [...selectedCandidates].sort((a, b) => 
      (b.overallScore || 0) - (a.overallScore || 0)
    );
    
    // Generate report content
    let content = `# Candidate Ranking Report for ${job.title || 'Position'} at ${job.company || 'Company'}\n\n`;
    
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
  } catch (error) {
    console.error('Error generating report content:', error);
    return `Error generating report content: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};
