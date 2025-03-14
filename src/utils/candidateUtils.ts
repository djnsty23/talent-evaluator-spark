
import { Candidate } from '@/types/job.types';

// Improved function to extract candidate name from resume
export const extractCandidateName = (fileName: string): string => {
  // Remove file extension
  let candidateName = fileName.split('.').slice(0, -1).join('.');
  
  // Replace underscores, hyphens, and numbers with spaces
  candidateName = candidateName
    .replace(/[_-]/g, ' ')
    .replace(/\d+/g, ' ')
    .replace(/\s+/g, ' ');
  
  // Remove common prefixes like "CV", "Resume", etc.
  candidateName = candidateName
    .replace(/^(cv|resume|résumé|curriculu?m\s*vitae)[\s_-]*/i, '')
    .trim();
  
  // Process name to ensure proper capitalization
  candidateName = candidateName
    .split(' ')
    .map(part => {
      // Skip empty parts
      if (!part) return '';
      // Capitalize first letter of each word
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .filter(Boolean) // Remove empty parts
    .join(' ');
  
  return candidateName || 'Unnamed Candidate';
};

// Helper function to generate evaluation comments
export const generateComment = (requirementDescription: string): string => {
  const positiveComments = [
    `Candidate demonstrates strong skills in ${requirementDescription.toLowerCase()}.`,
    `Excellent background in ${requirementDescription.toLowerCase()}.`,
    `Candidate's experience closely aligns with ${requirementDescription.toLowerCase()}.`
  ];
  
  const negativeComments = [
    `Candidate shows limited experience with ${requirementDescription.toLowerCase()}.`,
    `Could benefit from more training in ${requirementDescription.toLowerCase()}.`,
    `Resume lacks clear evidence of ${requirementDescription.toLowerCase()}.`
  ];
  
  const neutralComments = [
    `Candidate has some experience with ${requirementDescription.toLowerCase()}.`,
    `Moderate skills demonstrated in ${requirementDescription.toLowerCase()}.`,
    `Some background in ${requirementDescription.toLowerCase()}, but could be strengthened.`
  ];
  
  // Randomly select comment type
  const commentType = Math.floor(Math.random() * 3);
  if (commentType === 0) {
    return positiveComments[Math.floor(Math.random() * positiveComments.length)];
  } else if (commentType === 1) {
    return negativeComments[Math.floor(Math.random() * negativeComments.length)];
  } else {
    return neutralComments[Math.floor(Math.random() * neutralComments.length)];
  }
};

// Get random items from arrays
export const getRandomItems = (arr: string[], count: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to generate mock report content
export const generateMockReportContent = (job: any, candidateIds: string[], additionalPrompt?: string): string => {
  const candidates = job.candidates.filter((c: Candidate) => candidateIds.includes(c.id));
  const sortedCandidates = [...candidates].sort((a, b) => b.overallScore - a.overallScore);
  
  let content = `# Candidate Ranking Report for ${job.title}\n\n`;
  content += `## Job Overview\n\n`;
  content += `**Title:** ${job.title}\n`;
  content += `**Company:** ${job.company}\n`;
  content += `**Department:** ${job.department}\n`;
  content += `**Location:** ${job.location}\n\n`;
  
  content += `## Job Requirements\n\n`;
  job.requirements.forEach((req: any) => {
    content += `- ${req.description} (Weight: ${req.weight}/10, ${req.isRequired ? 'Required' : 'Optional'})\n`;
  });
  
  content += `\n## Candidate Rankings\n\n`;
  sortedCandidates.forEach((candidate: Candidate, index: number) => {
    content += `### ${index + 1}. ${candidate.name} (${candidate.overallScore.toFixed(1)}/10)\n\n`;
    
    content += `**Strengths:**\n`;
    candidate.strengths.forEach(strength => {
      content += `- ${strength}\n`;
    });
    
    content += `\n**Areas for Development:**\n`;
    candidate.weaknesses.forEach(weakness => {
      content += `- ${weakness}\n`;
    });
    
    content += `\n**Skill Assessment:**\n`;
    candidate.scores.forEach(score => {
      const requirement = job.requirements.find((r: any) => r.id === score.requirementId);
      if (requirement) {
        content += `- ${requirement.description}: ${score.score}/10\n`;
      }
    });
    
    content += `\n`;
  });
  
  if (additionalPrompt) {
    content += `## Additional Analysis\n\n`;
    content += `Custom analysis based on: "${additionalPrompt}"\n\n`;
    content += `This section would contain AI-generated analysis based on the custom prompt.\n\n`;
  }
  
  content += `## Recommendations\n\n`;
  content += `Based on the analysis, we recommend proceeding with interviews for the top 3 candidates.\n`;
  
  return content;
};
