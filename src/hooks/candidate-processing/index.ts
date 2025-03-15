
import { useProcessingState } from './useProcessingState';
import { useProcessSingleCandidate } from './useProcessSingleCandidate';
import { useProcessAllCandidates } from './useProcessAllCandidates';
import { useProcessingEffects } from './useProcessingEffects';
import { Job } from '@/types/job.types';

export function useCandidateProcessing(jobId: string | undefined, job: Job | null) {
  // Set up processing state
  const {
    isProcessingAll,
    setIsProcessingAll,
    processingCandidateIds,
    setProcessingCandidateIds,
    showPostProcessCTA,
    setShowPostProcessCTA,
    processingProgress,
    setProcessingProgress,
    currentProcessing,
    setCurrentProcessing,
    processedCountTracking,
    setProcessedCountTracking,
    totalToProcess,
    setTotalToProcess,
    errorCount,
    setErrorCount
  } = useProcessingState();

  // Single candidate processing
  const { handleProcessCandidate } = useProcessSingleCandidate(
    jobId,
    job,
    processingCandidateIds,
    setProcessingCandidateIds,
    setShowPostProcessCTA
  );

  // Process all candidates
  const { 
    handleProcessAllCandidatesClick,
    cancelProcessing,
    isProcessing 
  } = useProcessAllCandidates(
    jobId,
    job,
    setIsProcessingAll,
    setTotalToProcess,
    setProcessedCountTracking,
    setErrorCount,
    setProcessingProgress,
    setShowPostProcessCTA,
    setCurrentProcessing
  );

  // Side effects for processing
  useProcessingEffects(
    job,
    setProcessingCandidateIds,
    setShowPostProcessCTA
  );

  // Calculate remaining unprocessed candidates
  const unprocessedCount = job?.candidates?.filter(c => c.scores.length === 0)?.length || 0;

  return {
    // Processing state
    isProcessingAll,
    processingCandidateIds,
    showPostProcessCTA,
    processingProgress,
    currentProcessing,
    processedCountTracking,
    totalToProcess,
    errorCount,
    unprocessedCount,
    
    // Process management
    handleProcessCandidate,
    handleProcessAllCandidatesClick,
    cancelProcessing,
    isProcessing,
    
    // Actions
    setShowPostProcessCTA
  };
}

export {
  useProcessingState,
  useProcessSingleCandidate,
  useProcessAllCandidates,
  useProcessingEffects
};
