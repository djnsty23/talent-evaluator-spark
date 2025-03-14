
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useJob } from '@/contexts/JobContext';
import { Job } from '@/contexts/JobContext';

export function useCandidateProcessing(jobId: string | undefined, job: Job | null) {
  const { processCandidate, handleProcessAllCandidates, jobs } = useJob();
  const [processingCandidateIds, setProcessingCandidateIds] = useState<string[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [processedCountTracking, setProcessedCountTracking] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState('');
  const [showPostProcessCTA, setShowPostProcessCTA] = useState(false);

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
  }, [job]);

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

  return {
    processingCandidateIds,
    isProcessingAll,
    processingProgress,
    totalToProcess,
    processedCountTracking,
    errorCount,
    currentProcessing,
    showPostProcessCTA,
    setShowPostProcessCTA,
    handleProcessCandidate,
    handleProcessAllCandidatesClick
  };
}
