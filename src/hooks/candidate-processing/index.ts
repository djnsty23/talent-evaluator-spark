
import { Job } from '@/contexts/JobContext';
import { useProcessingState } from './useProcessingState';
import { useProcessSingleCandidate } from './useProcessSingleCandidate';
import { useProcessAllCandidates } from './useProcessAllCandidates';
import { useProcessingEffects } from './useProcessingEffects';

export function useCandidateProcessing(jobId: string | undefined, job: Job | null) {
  const {
    processingCandidateIds,
    setProcessingCandidateIds,
    isProcessingAll,
    setIsProcessingAll,
    processingProgress,
    setProcessingProgress,
    totalToProcess,
    setTotalToProcess,
    processedCountTracking,
    setProcessedCountTracking,
    errorCount,
    setErrorCount,
    currentProcessing,
    setCurrentProcessing,
    showPostProcessCTA,
    setShowPostProcessCTA
  } = useProcessingState();

  // Process a single candidate 
  const { handleProcessCandidate } = useProcessSingleCandidate(
    jobId,
    job,
    processingCandidateIds,
    setProcessingCandidateIds,
    setShowPostProcessCTA
  );

  // Process all candidates
  const { handleProcessAllCandidatesClick } = useProcessAllCandidates(
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

  // Side effects for processing state
  useProcessingEffects(job, setShowPostProcessCTA);

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

export * from './useProcessingState';
export * from './useProcessSingleCandidate';
export * from './useProcessAllCandidates';
export * from './useProcessingEffects';
