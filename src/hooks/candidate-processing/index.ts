
import { useState, useEffect } from 'react';
import { Job } from '@/types/job.types';
import { useJob } from '@/contexts/job/JobContext';

export function useCandidateProcessing(jobId: string | undefined, job: Job | null) {
  // State for tracking processing status
  const [processingCandidateIds, setProcessingCandidateIds] = useState<string[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [processedCountTracking, setProcessedCountTracking] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState<string | null>(null);
  const [showPostProcessCTA, setShowPostProcessCTA] = useState(false);

  const { processCandidate, handleProcessAllCandidates } = useJob();

  // Check if all candidates are processed when job changes
  useEffect(() => {
    if (job) {
      const unprocessedCount = job.candidates.filter(c => c.scores.length === 0).length;
      const hasProcessed = job.candidates.some(c => c.scores.length > 0);
      
      // Show CTA if we have processed all candidates and there's at least one
      if (unprocessedCount === 0 && job.candidates.length > 0 && hasProcessed) {
        setShowPostProcessCTA(true);
      } else {
        setShowPostProcessCTA(false);
      }
    }
  }, [job]);

  // Process a single candidate
  const handleProcessCandidate = async (candidateId: string) => {
    if (!jobId) return;
    
    // Prevent duplicate processing
    if (processingCandidateIds.includes(candidateId)) return;
    
    setProcessingCandidateIds(prev => [...prev, candidateId]);
    
    try {
      await processCandidate(jobId, candidateId);
      console.log('Successfully processed candidate:', candidateId);
      
      // Check if all candidates are now processed
      if (job) {
        const remainingUnprocessed = job.candidates.filter(
          c => c.id !== candidateId && c.scores.length === 0
        ).length;
        
        if (remainingUnprocessed === 0 && job.candidates.length > 0) {
          setShowPostProcessCTA(true);
        }
      }
    } catch (error) {
      console.error('Process error:', error);
    } finally {
      setProcessingCandidateIds(prev => prev.filter(id => id !== candidateId));
    }
  };

  // Process all candidates
  const handleProcessAllCandidatesClick = async () => {
    if (!jobId || !job) return;
    
    const unprocessedCandidates = job.candidates.filter(c => c.scores.length === 0);
    if (unprocessedCandidates.length === 0) {
      return;
    }
    
    setIsProcessingAll(true);
    setTotalToProcess(unprocessedCandidates.length);
    setProcessedCountTracking(0);
    setErrorCount(0);
    setProcessingProgress(0);
    
    try {
      // Set the first candidate as current
      if (unprocessedCandidates.length > 0) {
        setCurrentProcessing(unprocessedCandidates[0].name);
      }
      
      // Call the context function to process all candidates
      await handleProcessAllCandidates(jobId);
      
      // Show success CTA
      setShowPostProcessCTA(true);
    } catch (error) {
      console.error('Process all error:', error);
    } finally {
      setIsProcessingAll(false);
      setCurrentProcessing(null);
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
