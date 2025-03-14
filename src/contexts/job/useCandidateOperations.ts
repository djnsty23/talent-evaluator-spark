
import { useCallback } from 'react';
import { Job, Candidate } from './types';
import { mockSaveData } from '@/utils/storage';
import { createCandidateFromFile, processCandidate } from '@/services/candidateService';
import { toast } from 'sonner';

export function useCandidateOperations(
  jobs: Job[],
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>,
  currentJob: Job | null,
  setCurrentJob: React.Dispatch<React.SetStateAction<Job | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  // Handle candidate file uploads
  const uploadCandidateFiles = useCallback(async (jobId: string, files: File[]): Promise<void> => {
    if (!jobId || files.length === 0) return;
    
    setIsLoading(true);
    
    try {
      // Find the job to update
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Process each file and create a candidate entry
      const newCandidates: Candidate[] = files.map((file, index) => 
        createCandidateFromFile(file, jobId, index)
      );
      
      const updatedJob = {
        ...job,
        candidates: [...job.candidates, ...newCandidates],
        updatedAt: new Date().toISOString()
      };
      
      // Update backend (mocked)
      await mockSaveData(updatedJob);
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? updatedJob : j)
      );
      
      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error uploading candidates';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [jobs, currentJob, setJobs, setCurrentJob, setIsLoading, setError]);

  // Process a single candidate
  const processCandidateAction = useCallback(async (jobId: string, candidateId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Find the job and candidate
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      const candidateIndex = job.candidates.findIndex(c => c.id === candidateId);
      if (candidateIndex === -1) throw new Error('Candidate not found');
      
      // Get the candidate and process it
      const processedCandidate = processCandidate(job.candidates[candidateIndex], job.requirements);
      
      // Create updated job with processed candidate
      const updatedCandidates = [...job.candidates];
      updatedCandidates[candidateIndex] = processedCandidate;
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await mockSaveData(updatedJob);
      
      // Update local state immediately
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? updatedJob : j)
      );
      
      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
      console.log(`Successfully processed candidate: ${processedCandidate.name}`);
      return Promise.resolve();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing candidate';
      setError(errorMessage);
      console.error(`Error processing candidate: ${errorMessage}`);
      return Promise.reject(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [jobs, currentJob, setJobs, setCurrentJob, setIsLoading, setError]);

  // Process all unprocessed candidates
  const handleProcessAllCandidates = useCallback(async (jobId: string): Promise<void> => {
    try {
      console.log('Processing all candidates for job:', jobId);
      
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        console.error('Job not found:', jobId);
        throw new Error('Job not found');
      }
      
      // Get all unprocessed candidates
      const unprocessedCandidates = job.candidates.filter(c => c.scores.length === 0);
      console.log(`Found ${unprocessedCandidates.length} unprocessed candidates`);
      
      if (unprocessedCandidates.length === 0) {
        toast.info('No unprocessed candidates found');
        return Promise.resolve();
      }
      
      // Track processed candidates and errors
      let successCount = 0;
      let errorCount = 0;
      const processingErrors: string[] = [];
      
      // Process each candidate sequentially to avoid race conditions
      for (const candidate of unprocessedCandidates) {
        try {
          console.log(`Processing candidate: ${candidate.name} (${candidate.id})`);
          await processCandidateAction(jobId, candidate.id);
          successCount++;
        } catch (error) {
          errorCount++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          processingErrors.push(`Failed to process ${candidate.name}: ${errorMessage}`);
          console.error(`Error processing candidate ${candidate.name}:`, error);
        }
      }
      
      // Fetch the updated job to ensure we have the latest state
      const updatedJob = jobs.find(j => j.id === jobId);
      
      // Log processing results
      console.log(`Processing completed. Success: ${successCount}, Errors: ${errorCount}`);
      
      // Show appropriate toast message
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully processed ${successCount} candidates`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Processed ${successCount} candidates with ${errorCount} errors`);
      } else if (successCount === 0 && errorCount > 0) {
        toast.error(`Failed to process any candidates. Check console for details.`);
      }
      
      // If we had any errors, log them to console
      if (processingErrors.length > 0) {
        console.error('Processing errors:', processingErrors);
      }
      
      return Promise.resolve();
      
    } catch (err) {
      console.error('Error in handleProcessAllCandidates:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing candidates';
      setError(errorMessage);
      toast.error('Failed to process candidates');
      return Promise.reject(errorMessage);
    }
  }, [jobs, processCandidateAction, setError]);

  // Star/unstar a candidate
  const starCandidate = useCallback(async (jobId: string, candidateId: string, isStarred: boolean): Promise<void> => {
    try {
      // Find the job and candidate
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      const candidateIndex = job.candidates.findIndex(c => c.id === candidateId);
      if (candidateIndex === -1) throw new Error('Candidate not found');
      
      // Update the candidate
      const updatedCandidates = [...job.candidates];
      updatedCandidates[candidateIndex] = {
        ...updatedCandidates[candidateIndex],
        isStarred,
      };
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      };
      
      // Mock API call
      await mockSaveData(updatedJob);
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? updatedJob : j)
      );
      
      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error starring candidate';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [jobs, currentJob, setJobs, setCurrentJob, setError]);

  // Delete a candidate
  const deleteCandidate = useCallback(async (jobId: string, candidateId: string): Promise<void> => {
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Filter out the candidate
      const updatedCandidates = job.candidates.filter(c => c.id !== candidateId);
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      };
      
      // Mock API call
      await mockSaveData(updatedJob);
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? updatedJob : j)
      );
      
      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error deleting candidate';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [jobs, currentJob, setJobs, setCurrentJob, setError]);

  return {
    uploadCandidateFiles,
    processCandidate: processCandidateAction,
    handleProcessAllCandidates,
    starCandidate,
    deleteCandidate
  };
}
