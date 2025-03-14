
import { toast } from 'sonner';
import { useJob } from '@/contexts/JobContext';
import { Job } from '@/types/job.types';

export function useProcessSingleCandidate(
  jobId: string | undefined, 
  job: Job | null,
  processingCandidateIds: string[],
  setProcessingCandidateIds: React.Dispatch<React.SetStateAction<string[]>>,
  setShowPostProcessCTA: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { processCandidate, jobs } = useJob();

  const handleProcessCandidate = async (candidateId: string) => {
    if (!jobId) return;
    
    setProcessingCandidateIds(prev => [...prev, candidateId]);
    
    try {
      await processCandidate(jobId, candidateId);
      toast.success('Candidate processed successfully');
      
      // Check if all candidates are now processed
      const currentJob = jobs.find(j => j.id === jobId);
      if (currentJob) {
        const remainingUnprocessed = currentJob.candidates.filter(c => c.scores.length === 0).length;
        if (remainingUnprocessed === 0 && currentJob.candidates.length > 0) {
          setShowPostProcessCTA(true);
        }
      }
    } catch (error) {
      console.error('Process error:', error);
      toast.error('Failed to process candidate');
    } finally {
      setProcessingCandidateIds(prev => prev.filter(id => id !== candidateId));
    }
  };

  return { handleProcessCandidate };
}
