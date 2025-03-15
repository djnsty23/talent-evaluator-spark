
import { useCallback } from 'react';
import { Job } from './types';
import { toast } from 'sonner';
import { useUploadCandidates } from './candidates/uploadCandidates';
import { useProcessCandidate, useProcessAllCandidates } from './candidates/processCandidates';
import { useStarCandidate, useDeleteCandidate } from './candidates/candidateActions';

// Delay between API calls to avoid rate limiting
const PROCESSING_DELAY_MS = 1500;

// Helper function to introduce a delay between processing requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  
  // Process a single candidate with improved error handling
  const processCandidate = useCallback(async (jobId: string, candidateId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      return await processCandidateAction(jobId, candidateId);
    } catch (error) {
      console.error('Error in processCandidate:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [processCandidateAction, setIsLoading]);
  
  // Improved batch processing functionality with rate limiting
  const handleProcessAllCandidates = useCallback(async (jobId: string): Promise<void> => {
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        throw new Error('Job not found');
      }
      
      // Get all unprocessed candidates
      const unprocessedCandidates = job.candidates.filter(c => c.scores.length === 0);
      
      if (unprocessedCandidates.length === 0) {
        toast.info('No unprocessed candidates found');
        return;
      }
      
      // Track processed candidates and errors
      let successCount = 0;
      let errorCount = 0;
      
      // Process each candidate sequentially with delay to avoid rate limiting
      for (const candidate of unprocessedCandidates) {
        try {
          console.log(`Processing candidate: ${candidate.name} (${candidate.id})`);
          await processCandidateAction(jobId, candidate.id);
          successCount++;
          
          // Add delay to avoid rate limiting
          if (successCount < unprocessedCandidates.length) {
            await delay(PROCESSING_DELAY_MS);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error processing candidate ${candidate.name}:`, error);
          // Continue with next candidate even if this one failed
          await delay(PROCESSING_DELAY_MS);
        }
      }
      
      // Show appropriate toast message
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully processed ${successCount} candidates`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Processed ${successCount} candidates with ${errorCount} errors`);
      } else if (successCount === 0 && errorCount > 0) {
        toast.error(`Failed to process any candidates. Check console for details.`);
      }
      
    } catch (error) {
      console.error('Error in handleProcessAllCandidates:', error);
      setError(error instanceof Error ? error.message : 'Unknown error processing candidates');
      throw error;
    }
  }, [jobs, processCandidateAction, setError]);
  
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
    processCandidate,
    handleProcessAllCandidates,
    starCandidate,
    deleteCandidate
  };
}
