
import { useState } from 'react';
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

  const handleProcessCandidate = async (candidateId: string) => {
    if (!jobId) return;
    
    setProcessingCandidateIds(prev => [...prev, candidateId]);
    
    try {
      await processCandidate(jobId, candidateId);
      toast.success('Candidate processed successfully');
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
          const currentJob = jobs.find(j => j.id === jobId);
          if (currentJob) {
            const processedCandidates = currentJob.candidates.filter(c => c.scores.length > 0);
            const newProcessed = processedCandidates.length;
            
            setProcessedCountTracking(newProcessed);
            
            const actualProgress = Math.min(Math.floor((newProcessed / total) * 100), 95);
            
            setProcessingProgress(prev => Math.max(prev, actualProgress));
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
        setProcessedCountTracking(processedCandidates.length);
        
        if (job) {
          setErrorCount(total - (processedCandidates.length - (job.candidates.filter(c => c.scores.length > 0).length)));
        }
        
        setShowPostProcessCTA(true);
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
