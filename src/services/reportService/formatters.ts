
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
      score: score ? score.score : 0,
      weight: req.weight || 1,
      comments: score && score.comment ? score.comment : 'No evaluation'
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
    // Ensure all fields have valid values, with defaults when needed
    return {
      id: candidate.id,
      name: candidate.name || 'Unnamed Candidate',
      overallScore: candidate.overallScore || 0,
      strengths: candidate.strengths || [],
      weaknesses: candidate.weaknesses || [],
      education: candidate.education || '',
      yearsOfExperience: candidate.yearsOfExperience || 0,
      location: candidate.location || '',
      scores: candidate.scores || [],
      cultureFit: candidate.cultureFit || 0,
      leadershipPotential: candidate.leadershipPotential || 0,
      skillKeywords: candidate.skillKeywords || [],
      personalityTraits: candidate.personalityTraits || [],
      communicationStyle: candidate.communicationStyle || ''
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
