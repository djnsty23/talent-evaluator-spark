
import { Candidate, JobRequirement } from '@/types/job.types';

export const calculateMaxScores = (
  candidates: Candidate[], 
  requirements: JobRequirement[]
): { [reqId: string]: number } => {
  const maxScores: { [reqId: string]: number } = {};
  
  requirements.forEach(req => {
    maxScores[req.id] = Math.max(...candidates.map(c => {
      const score = c.scores.find(s => s.requirementId === req.id);
      return score ? score.score : 0;
    }));
  });
  
  return maxScores;
};
