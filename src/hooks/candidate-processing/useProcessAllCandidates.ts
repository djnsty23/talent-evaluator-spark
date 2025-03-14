
import { toast } from 'sonner';
import { useJob } from '@/contexts/job/JobContext';
import { Job } from '@/types/job.types';

export function useProcessAllCandidates(
  jobId: string | undefined,
  job: Job | null,
  setIsProcessingAll: React.Dispatch<React.SetStateAction<boolean>>,
  setTotalToProcess: React.Dispatch<React.SetStateAction<number>>,
  setProcessedCountTracking: React.Dispatch<React.SetStateAction<number>>,
  setErrorCount: React.Dispatch<React.SetStateAction<number>>,
  setProcessingProgress: React.Dispatch<React.SetStateAction<number>>,
  setShowPostProcessCTA: React.Dispatch<React.SetStateAction<boolean>>,
  setCurrentProcessing: React.Dispatch<React.SetStateAction<string | null>>
) {
  const { handleProcessAllCandidates } = useJob();

  const handleProcessAllCandidatesClick = async () => {
    if (!jobId || !job) return;
    
    const unprocessedCandidates = job.candidates.filter(c => c.scores.length === 0);
    if (unprocessedCandidates.length === 0) {
      toast.info('No candidates to process');
      return;
    }
    
    setIsProcessingAll(true);
    setTotalToProcess(unprocessedCandidates.length);
    setProcessedCountTracking(0);
    setErrorCount(0);
    setProcessingProgress(0);
    
    try {
      // Process first candidate
      if (unprocessedCandidates.length > 0) {
        setCurrentProcessing(unprocessedCandidates[0].name);
      }
      
      // Call the context function to process all candidates
      await handleProcessAllCandidates(jobId);
      
      // Show success CTA if all went well
      setShowPostProcessCTA(true);
    } catch (error) {
      console.error('Process all error:', error);
      toast.error('Error processing candidates');
    } finally {
      setIsProcessingAll(false);
      setCurrentProcessing(null);
    }
  };

  return { handleProcessAllCandidatesClick };
}
