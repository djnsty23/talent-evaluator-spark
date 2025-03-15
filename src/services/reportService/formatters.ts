
import { Job, Candidate } from '@/types/job.types';

/**
 * Format candidate scores for the report
 */
export const formatCandidateScores = (candidate: Candidate, job: Job) => {
  if (!job.requirements || !Array.isArray(job.requirements) || !candidate.scores || !Array.isArray(candidate.scores)) {
    console.warn('Missing or invalid requirements or scores data');
    return [];
  }
  
  return job.requirements.map(req => {
    const score = candidate.scores.find(s => s.requirementId === req.id);
    return {
      requirement: req.description || 'Unknown requirement',
      score: score && score.score > 0 ? score.score : 0,
      weight: req.weight || 1,
      comments: score && score.comment ? score.comment : 'N/A'
    };
  });
};

/**
 * Format candidate data for AI processing
 */
export const formatCandidatesForAI = (candidates: Candidate[]) => {
  if (!candidates || !Array.isArray(candidates)) {
    console.warn('Invalid candidates data for AI formatting');
    return [];
  }
  
  console.log('Formatting candidates for AI:', candidates);
  
  return candidates.map(candidate => {
    // Ensure all fields have valid values, with N/A when needed
    return {
      id: candidate.id,
      name: candidate.name || 'Unnamed Candidate',
      overallScore: candidate.overallScore || 0,
      strengths: candidate.strengths && candidate.strengths[0] !== 'N/A' ? candidate.strengths : [],
      weaknesses: candidate.weaknesses && candidate.weaknesses[0] !== 'N/A' ? candidate.weaknesses : [],
      education: candidate.education && candidate.education !== 'N/A' ? candidate.education : '',
      yearsOfExperience: candidate.yearsOfExperience || 0,
      location: candidate.location && candidate.location !== 'N/A' ? candidate.location : '',
      scores: candidate.scores || [],
      cultureFit: candidate.cultureFit || 0,
      leadershipPotential: candidate.leadershipPotential || 0,
      skillKeywords: candidate.skillKeywords && candidate.skillKeywords[0] !== 'N/A' ? candidate.skillKeywords : [],
      personalityTraits: candidate.personalityTraits && candidate.personalityTraits[0] !== 'N/A' ? candidate.personalityTraits : [],
      communicationStyle: candidate.communicationStyle && candidate.communicationStyle !== 'N/A' ? candidate.communicationStyle : ''
    };
  });
};

/**
 * Format job data for AI processing
 */
export const formatJobForAI = (job: Job) => {
  if (!job) {
    console.warn('Invalid job data for AI formatting');
    return null;
  }
  
  console.log('Formatting job for AI:', job);
  
  return {
    id: job.id,
    title: job.title || 'Untitled Position',
    company: job.company || 'Company',
    description: job.description || '',
    requirements: job.requirements || [],
    department: job.department || '',
    location: job.location || '',
  };
};
