
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Job } from '../types';
import { JobService } from '@/services/jobService';

/**
 * Hook for CRUD operations on jobs (Create, Read, Update, Delete)
 */
export function useJobCrud(
  jobs: Job[],
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  // Create a new job
  const createJob = useCallback(async (jobData: Partial<Job>): Promise<Job> => {
    setIsLoading(true);
    setError(null);

    try {
      const newJob: Job = {
        id: uuidv4(),
        title: jobData.title || 'Untitled Job',
        company: jobData.company || 'Unknown Company',
        description: jobData.description || '',
        requirements: [],
        candidates: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...jobData,
      };

      // Save to storage
      await JobService.createJob(newJob);
      setJobs(prev => [...prev, newJob]);
      setIsLoading(false);
      return newJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating job';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, [setJobs, setIsLoading, setError]);

  // Update an existing job
  const updateJob = useCallback(async (jobData: Job): Promise<Job> => {
    setIsLoading(true);
    setError(null);

    try {
      // Save to storage
      await JobService.updateJob(jobData);
      setJobs(prev =>
        prev.map(job => (job.id === jobData.id ? { ...job, ...jobData } : job))
      );
      setIsLoading(false);
      return jobData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error updating job';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, [setJobs, setIsLoading, setError]);

  // Delete a job
  const deleteJob = useCallback(async (jobId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Delete from storage
      await JobService.deleteJob(jobId);
      setJobs(prev => prev.filter(job => job.id !== jobId));
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error deleting job';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, [setJobs, setIsLoading, setError]);

  return {
    createJob,
    updateJob,
    deleteJob,
  };
}
