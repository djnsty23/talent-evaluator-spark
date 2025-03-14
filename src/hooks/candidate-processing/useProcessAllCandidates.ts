
import { toast } from 'sonner';
import { useJob } from '@/contexts/JobContext';
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
  setCurrentProcessing: React.Dispatch<React.SetStateAction<string>>
) {
  const { processCandidate, jobs } = useJob();

  const handleProcessAllCandidatesClick = async () => {
    if (!jobId || !job) return;
    
    const unprocessedCandidates = job.candidates.filter(c => c.scores.length === 0);
    if (unprocessedCandidates.length === 0) {
      toast.info("No unprocessed candidates found");
      return;
    }
    
    setIsProcessingAll(true);
    setTotalToProcess(unprocessedCandidates.length);
    setProcessedCountTracking(0);
    setErrorCount(0);
    setProcessingProgress(0);
    setShowPostProcessCTA(false);
    
    // Process candidates sequentially to avoid race conditions
    let processed = 0;
    let errors = 0;
    
    try {
      for (const candidate of unprocessedCandidates) {
        setCurrentProcessing(candidate.name);
        try {
          await processCandidate(jobId, candidate.id);
          processed++;
          setProcessedCountTracking(processed);
          const progressPercent = Math.floor((processed / unprocessedCandidates.length) * 100);
          setProcessingProgress(progressPercent);
        } catch (error) {
          console.error(`Error processing candidate ${candidate.name}:`, error);
          errors++;
          setErrorCount(errors);
        }
      }
      
      setProcessingProgress(100);
      
      // Show success message based on results
      if (processed > 0 && errors === 0) {
        toast.success(`Successfully processed ${processed} candidates`);
      } else if (processed > 0 && errors > 0) {
        toast.warning(`Processed ${processed} candidates with ${errors} errors`);
      } else if (processed === 0 && errors > 0) {
        toast.error('Failed to process any candidates');
      }
      
      // Check if all candidates are now processed
      const updatedJob = jobs.find(j => j.id === jobId);
      if (updatedJob) {
        const remainingUnprocessed = updatedJob.candidates.filter(c => c.scores.length === 0).length;
        if (remainingUnprocessed === 0 && updatedJob.candidates.length > 0) {
          setShowPostProcessCTA(true);
        }
      }
    } catch (error) {
      console.error('Batch process error:', error);
      toast.error('An error occurred during batch processing');
    } finally {
      setIsProcessingAll(false);
      setCurrentProcessing('');
    }
  };

  return { handleProcessAllCandidatesClick };
}
