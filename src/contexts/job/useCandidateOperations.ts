
import { useCallback } from 'react';
import { Job } from './types';
import { useUploadCandidates } from './candidates/uploadCandidates';
import { useProcessCandidate, useProcessAllCandidates } from './candidates/processCandidates';
import { useStarCandidate, useDeleteCandidate } from './candidates/candidateActions';

/**
 * Hook that combines all candidate operations
 */
export function useCandidateOperations(
  jobs: Job[],
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>,
  currentJob: Job | null,
  setCurrentJob: React.Dispatch<React.SetStateAction<Job | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  // Import candidate upload functionality
  const { uploadCandidateFiles } = useUploadCandidates(
    jobs, 
    currentJob, 
    setJobs, 
    setCurrentJob, 
    setIsLoading, 
    setError
  );
  
  // Import candidate processing functionality
  const { processCandidateAction } = useProcessCandidate(
    jobs, 
    currentJob, 
    setJobs, 
    setCurrentJob, 
    setIsLoading, 
    setError
  );
  
  // Import batch processing functionality (depends on processCandidateAction)
  const { handleProcessAllCandidates } = useProcessAllCandidates(
    jobs, 
    processCandidateAction, 
    setError
  );
  
  // Import candidate starring functionality
  const { starCandidate } = useStarCandidate(
    jobs, 
    currentJob, 
    setJobs, 
    setCurrentJob, 
    setError
  );
  
  // Import candidate deletion functionality
  const { deleteCandidate } = useDeleteCandidate(
    jobs, 
    currentJob, 
    setJobs, 
    setCurrentJob, 
    setError
  );

  // Export all functions with consistent API
  return {
    uploadCandidateFiles,
    processCandidate: processCandidateAction,
    handleProcessAllCandidates,
    starCandidate,
    deleteCandidate
  };
}
