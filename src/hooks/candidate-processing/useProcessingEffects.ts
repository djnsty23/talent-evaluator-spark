
import { useEffect } from 'react';
import { Job } from '@/types/job.types';

export function useProcessingEffects(
  job: Job | null,
  setShowPostProcessCTA: React.Dispatch<React.SetStateAction<boolean>>
) {
  // Effect to check if all candidates are processed
  useEffect(() => {
    if (job) {
      const unprocessedCount = job.candidates.filter(c => c.scores.length === 0).length;
      const processedCount = job.candidates.filter(c => c.scores.length > 0).length;
      
      // Only show CTA if we have at least one processed candidate and no unprocessed ones
      if (unprocessedCount === 0 && processedCount > 0) {
        setShowPostProcessCTA(true);
      } else {
        setShowPostProcessCTA(false);
      }
      
      console.log(`Processing status: ${processedCount} processed, ${unprocessedCount} unprocessed candidates`);
    }
  }, [job, setShowPostProcessCTA]);
  
  return null;
}
