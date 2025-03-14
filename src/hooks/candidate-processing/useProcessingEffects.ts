
import { useEffect } from 'react';
import { Job } from '@/contexts/JobContext';

export function useProcessingEffects(
  job: Job | null,
  setShowPostProcessCTA: React.Dispatch<React.SetStateAction<boolean>>
) {
  // Check if all candidates are processed when the job changes
  useEffect(() => {
    if (job && job.candidates.length > 0) {
      const unprocessedCount = job.candidates.filter(c => c.scores.length === 0).length;
      const processedCount = job.candidates.filter(c => c.scores.length > 0).length;
      
      // If all candidates are processed, show the CTA
      if (processedCount > 0 && unprocessedCount === 0) {
        setShowPostProcessCTA(true);
      } else {
        setShowPostProcessCTA(false);
      }
    }
  }, [job, setShowPostProcessCTA]);
}
