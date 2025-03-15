import { useEffect } from 'react';
import { Job } from '@/types/job.types';

/**
 * Hook to handle processing-related side effects
 */
export function useProcessingEffects(
  job: Job | null,
  setShowPostProcessCTA: React.Dispatch<React.SetStateAction<boolean>>
) {
  // Effect to determine if we should show the post-processing CTA
  useEffect(() => {
    if (job) {
      const hasUnprocessedCandidates = job.candidates.some(c => c.scores.length === 0);
      const hasProcessedCandidates = job.candidates.some(c => c.scores.length > 0);
      
      // Show the CTA if we have both processed and unprocessed candidates
      setShowPostProcessCTA(hasProcessedCandidates && hasUnprocessedCandidates);
    }
  }, [job, setShowPostProcessCTA]);

  // Listen for job data refresh events
  useEffect(() => {
    const handleJobDataRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent<{ jobId: string; refreshedJob: Job }>;
      console.log('Job data refreshed event received:', customEvent.detail);
      
      // The actual state update will be handled in the JobContext
      // This is just to log that we received the event
    };

    window.addEventListener('job-data-refreshed', handleJobDataRefreshed);
    
    return () => {
      window.removeEventListener('job-data-refreshed', handleJobDataRefreshed);
    };
  }, []);
}
