import { Job, Candidate } from '@/types/job.types';
import { formatCandidateScores } from './formatters';

/**
 * Generate candidate rankings section for report
 */
export const generateCandidateRankingsContent = (job: Job, rankedCandidates: Candidate[]) => {
  let content = `\n## Candidate Rankings\n\n`;
  content += `The following candidates were evaluated against the job requirements. They are listed in order of their overall score.\n\n`;
  
  // Add candidate rankings
  rankedCandidates.forEach((candidate, index) => {
    content += `### ${index + 1}. ${candidate.name} - ${candidate.overallScore.toFixed(1)}/10\n\n`;
    
    if (candidate.strengths && candidate.strengths.length > 0) {
      content += `**Strengths:**\n`;
      candidate.strengths.forEach(strength => {
        content += `- ${strength}\n`;
      });
      content += `\n`;
    }
    
    if (candidate.weaknesses && candidate.weaknesses.length > 0) {
      content += `**Areas for Development:**\n`;
      candidate.weaknesses.forEach(weakness => {
        content += `- ${weakness}\n`;
      });
      content += `\n`;
    }
    
    // Add specific information about the candidate if available
    if (candidate.yearsOfExperience) {
      content += `**Experience:** ${candidate.yearsOfExperience} years\n`;
    }
    
    if (candidate.education) {
      content += `**Education:** ${candidate.education}\n`;
    }
    
    if (candidate.location) {
      content += `**Location:** ${candidate.location}\n`;
    }
    
    content += `\n**Detailed Score Analysis:**\n\n`;
    
    const formattedScores = formatCandidateScores(candidate, job);
    formattedScores.forEach(score => {
      content += `- **${score.requirement}**: ${score.score}/10\n  ${score.comments}\n\n`;
    });
    
    content += `\n`;
  });
  
  return content;
};

/**
 * Generate job overview section for report
 */
export const generateJobOverviewContent = (job: Job) => {
  let content = `## Job Overview\n\n`;
  content += `**Title:** ${job.title || 'Untitled Position'}\n`;
  content += `**Company:** ${job.company || 'Company'}\n`;
  
  if (job.department) {
    content += `**Department:** ${job.department}\n`;
  }
  
  if (job.location) {
    content += `**Location:** ${job.location}\n`;
  }
  
  content += `\n`;
  
  if (job.description) {
    content += `**Description:**\n${job.description}\n\n`;
  }
  
  // Add requirements summary
  content += `## Job Requirements\n\n`;
  content += `The following requirements were used to evaluate candidates:\n\n`;
  
  if (job.requirements && job.requirements.length > 0) {
    job.requirements.forEach(req => {
      const category = req.category || 'General';
      content += `- **${req.description}** (Weight: ${req.weight}) - ${category}\n`;
    });
  } else {
    content += `No specific requirements defined for this position.\n`;
  }
  
  return content;
};

/**
 * Generate comparison summary section for report
 */
export const generateComparisonSummaryContent = (rankedCandidates: Candidate[]) => {
  let content = `## Comparison Summary\n\n`;
  
  if (rankedCandidates && rankedCandidates.length > 0) {
    const topCandidate = rankedCandidates[0];
    content += `**Top candidate:** ${topCandidate.name} with an overall score of ${topCandidate.overallScore.toFixed(1)}/10\n\n`;
    
    if (rankedCandidates.length > 1) {
      content += `**Comparative analysis:**\n\n`;
      
      // Compare top 3 candidates (or all if less than 3)
      const topCandidates = rankedCandidates.slice(0, Math.min(3, rankedCandidates.length));
      
      if (topCandidates.length > 1) {
        content += `The top ${topCandidates.length} candidates are:\n\n`;
        
        topCandidates.forEach((candidate, index) => {
          content += `${index + 1}. **${candidate.name}** (${candidate.overallScore.toFixed(1)}/10) - `;
          
          if (candidate.strengths && candidate.strengths.length > 0) {
            content += `Strongest in ${candidate.strengths[0].toLowerCase()}\n`;
          } else {
            content += `No specific strengths identified\n`;
          }
        });
        
        content += `\n`;
      }
    }
  } else {
    content += `No candidates available for comparison.\n\n`;
  }
  
  return content;
};

/**
 * Generate recommendations section for report
 */
export const generateRecommendationsContent = (rankedCandidates: Candidate[]) => {
  let content = `## Recommendations\n\n`;
  
  if (rankedCandidates && rankedCandidates.length > 0) {
    content += `Based on the analysis of the candidates' profiles and their match with the job requirements, the following recommendations are provided:\n\n`;
    
    // Recommend top candidate
    if (rankedCandidates[0].overallScore >= 7) {
      content += `- **${rankedCandidates[0].name}** is recommended for immediate consideration with a strong match to the job requirements.\n`;
    } else if (rankedCandidates[0].overallScore >= 5) {
      content += `- **${rankedCandidates[0].name}** shows potential but may require additional screening or training in specific areas.\n`;
    } else {
      content += `- None of the candidates fully meet the job requirements. Consider expanding the candidate pool or adjusting requirements.\n`;
    }
    
    // Additional recommendations
    if (rankedCandidates.length > 1 && rankedCandidates[1].overallScore >= 6) {
      content += `- **${rankedCandidates[1].name}** is also a strong candidate and should be considered as an alternative.\n`;
    }
  } else {
    content += `No candidates available for recommendations.\n\n`;
  }
  
  return content;
};
