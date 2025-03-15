
import { useState } from 'react';

export function useProcessingState() {
  const [processingCandidateIds, setProcessingCandidateIds] = useState<string[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [processedCountTracking, setProcessedCountTracking] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState('');
  const [showPostProcessCTA, setShowPostProcessCTA] = useState(false);

  return {
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
  };
}
