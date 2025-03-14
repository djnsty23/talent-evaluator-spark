
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
    }), 0); // Added 0 as a fallback in case candidates array is empty
  });
  
  return maxScores;
};

// Add a utility function to calculate average scores
export const calculateAverageScores = (
  candidates: Candidate[],
  requirements: JobRequirement[]
): { [reqId: string]: number } => {
  const avgScores: { [reqId: string]: number } = {};
  
  requirements.forEach(req => {
    const validScores = candidates
      .map(c => {
        const score = c.scores.find(s => s.requirementId === req.id);
        return score ? score.score : null;
      })
      .filter((score): score is number => score !== null);
    
    avgScores[req.id] = validScores.length > 0
      ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
      : 0;
  });
  
  return avgScores;
};
