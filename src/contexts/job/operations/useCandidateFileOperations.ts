
import { useCallback } from 'react';
import { Job } from '../types';
import { uploadCandidateFiles, starCandidate, deleteCandidate } from '@/services/candidateService';

/**
 * Hook for candidate file operations
 */
export function useCandidateFileOperations(
  jobs: Job[],
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  // Upload candidate files for a job
  const uploadCandidateFilesAction = useCallback(async (jobId: string, files: File[]): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Upload files and create candidates
      const newCandidates = await uploadCandidateFiles(jobId, files);

      setJobs(prev =>
        prev.map(job =>
          job.id === jobId
            ? {
                ...job,
                candidates: [...job.candidates, ...newCandidates],
                updatedAt: new Date().toISOString(),
              }
            : job
        )
      );
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error uploading candidates';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, [setJobs, setIsLoading, setError]);

  // Star a candidate
  const starCandidateAction = useCallback(async (jobId: string, candidateId: string, isStarred: boolean): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Update candidate's isStarred status
      await starCandidate(jobId, candidateId, isStarred);

      setJobs(prev =>
        prev.map(job =>
          job.id === jobId
            ? {
                ...job,
                candidates: job.candidates.map(candidate =>
                  candidate.id === candidateId ? { ...candidate, isStarred } : candidate
                ),
                updatedAt: new Date().toISOString(),
              }
            : job
        )
      );
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error starring candidate';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, [setJobs, setIsLoading, setError]);

  // Delete a candidate
  const deleteCandidateAction = useCallback(async (jobId: string, candidateId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Delete candidate
      await deleteCandidate(jobId, candidateId);

      setJobs(prev =>
        prev.map(job =>
          job.id === jobId
            ? {
                ...job,
                candidates: job.candidates.filter(candidate => candidate.id !== candidateId),
                updatedAt: new Date().toISOString(),
              }
            : job
        )
      );
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error deleting candidate';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, [setJobs, setIsLoading, setError]);

  return {
    uploadCandidateFiles: uploadCandidateFilesAction,
    starCandidate: starCandidateAction,
    deleteCandidate: deleteCandidateAction,
  };
}
