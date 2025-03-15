
import { Job, Candidate } from '@/types/job.types';

/**
 * Format candidate scores for the report
 */
export const formatCandidateScores = (candidate: Candidate, job: Job) => {
  return job.requirements.map(req => {
    const score = candidate.scores.find(s => s.requirementId === req.id);
    return {
      requirement: req.description,
      score: score ? score.score : 0,
      weight: req.weight,
      comments: score ? score.comment : 'No evaluation'
    };
  });
};
