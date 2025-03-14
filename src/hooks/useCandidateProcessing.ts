
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
    
    try {
      const currentJob = jobs.find(j => j.id === jobId);
      const candidatesToProcess = currentJob?.candidates.filter(c => c.scores.length === 0) || [];
      const total = candidatesToProcess.length;
      const initialProcessedCount = job.candidates.filter(c => c.scores.length > 0).length;
      
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev < 95) {
            return Math.min(prev + 5, 95);
          }
          return prev;
        });
      }, 1000);
      
      console.log(`Starting batch processing for ${total} candidates`);
      
      const jobElement = document.getElementById('job-candidates-container');
      
      if (jobElement) {
        const observer = new MutationObserver(() => {
          const updatedJob = jobs.find(j => j.id === jobId);
          if (updatedJob) {
            const processedCandidates = updatedJob.candidates.filter(c => c.scores.length > 0);
            const newProcessedCount = processedCandidates.length - initialProcessedCount;
            
            setProcessedCountTracking(newProcessedCount);
            
            const percentComplete = Math.min(Math.floor((newProcessedCount / total) * 100), 95);
            setProcessingProgress(prev => Math.max(prev, percentComplete));
          }
        });
        
        observer.observe(jobElement, { childList: true, subtree: true });
      }
      
      await handleProcessAllCandidates(jobId);
      
      clearInterval(progressInterval);
      
      setProcessingProgress(100);
      
      const updatedJob = jobs.find(j => j.id === jobId);
      if (updatedJob) {
        const processedCandidates = updatedJob.candidates.filter(c => c.scores.length > 0);
        const newProcessedCount = processedCandidates.length - initialProcessedCount;
        setProcessedCountTracking(newProcessedCount);
        
        setErrorCount(total - newProcessedCount);
        
        // Show post-processing CTA if all candidates are processed
        if (updatedJob.candidates.filter(c => c.scores.length === 0).length === 0) {
          setShowPostProcessCTA(true);
        }
      }
      
      setTimeout(() => {
        setIsProcessingAll(false);
        setCurrentProcessing('');
      }, 2000);
      
    } catch (error) {
      console.error('Batch process error:', error);
      toast.error('An error occurred during batch processing');
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
