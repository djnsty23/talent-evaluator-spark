
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
    return [];
  }
  
  return candidates.map(candidate => ({
    id: candidate.id,
    name: candidate.name,
    overallScore: candidate.overallScore || 0,
    strengths: candidate.strengths || [],
    weaknesses: candidate.weaknesses || [],
    education: candidate.education || '',
    yearsOfExperience: candidate.yearsOfExperience || 0,
    location: candidate.location || '',
    scores: candidate.scores || [],
  }));
};

/**
 * Format job data for AI processing
 */
export const formatJobForAI = (job: Job) => {
  if (!job) {
    return null;
  }
  
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
