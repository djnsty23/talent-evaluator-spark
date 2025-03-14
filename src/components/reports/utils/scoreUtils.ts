
import { Candidate, JobRequirement } from '@/types/job.types';

export const calculateMaxScores = (
  candidates: Candidate[], 
  requirements: JobRequirement[]
): { [reqId: string]: number } => {
  const maxScores: { [reqId: string]: number } = {};
  
  // Initialize all max scores to 0
  requirements.forEach(req => {
    maxScores[req.id] = 0;
  });
  
  // Calculate the max score for each requirement
  candidates.forEach(candidate => {
    candidate.scores.forEach(score => {
      if (score.score > (maxScores[score.requirementId] || 0)) {
        maxScores[score.requirementId] = score.score;
      }
    });
  });
  
  return maxScores;
};

// Add a utility function to calculate average scores
export const calculateAverageScores = (
  candidates: Candidate[],
  requirements: JobRequirement[]
): { [reqId: string]: number } => {
  const avgScores: { [reqId: string]: number } = {};
  const scoreCount: { [reqId: string]: number } = {};
  
  // Initialize average scores and counts
  requirements.forEach(req => {
    avgScores[req.id] = 0;
    scoreCount[req.id] = 0;
  });
  
  // Sum up all scores for each requirement
  candidates.forEach(candidate => {
    candidate.scores.forEach(score => {
      if (score.score > 0) {
        avgScores[score.requirementId] = (avgScores[score.requirementId] || 0) + score.score;
        scoreCount[score.requirementId] = (scoreCount[score.requirementId] || 0) + 1;
      }
    });
  });
  
  // Calculate the average
  requirements.forEach(req => {
    if (scoreCount[req.id] > 0) {
      avgScores[req.id] = avgScores[req.id] / scoreCount[req.id];
    } else {
      avgScores[req.id] = 0;
    }
  });
  
  return avgScores;
};
