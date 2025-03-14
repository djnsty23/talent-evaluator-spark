
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Job, Report } from './types';
import { mockSaveData } from '@/utils/storage';
import { generateReport } from '@/services/reportService';

export function useJobOperations() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new job
  const createJob = useCallback(async (jobData: Partial<Job>): Promise<Job> => {
    setIsLoading(true);
    try {
      const newJob: Job = {
        id: uuidv4(),
        title: jobData.title || 'Untitled Job',
        company: jobData.company || '',
        description: jobData.description || '',
        location: jobData.location || '',
        department: jobData.department || '',
        salary: jobData.salary,
        requirements: jobData.requirements || [],
        candidates: [],
        contextFiles: jobData.contextFiles || [],
        userId: 'user_1', // This will be replaced with the actual user ID if available
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Supabase
      await mockSaveData(newJob);

      // Update local state
      setJobs(prevJobs => [...prevJobs, newJob]);
      
      // Log the current jobs state after update
      console.log('Jobs after create:', [...jobs, newJob]);
      
      return newJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [jobs]);

  // Update an existing job
  const updateJob = useCallback(async (jobData: Job): Promise<Job> => {
    setIsLoading(true);
    try {
      const updatedJob = {
        ...jobData,
        updatedAt: new Date().toISOString(),
      };

      // Mock API call
      await mockSaveData(updatedJob);

      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobData.id ? updatedJob : j)
      );

      if (currentJob && currentJob.id === jobData.id) {
        setCurrentJob(updatedJob);
      }
      
      // Log the current jobs state after update
      console.log('Jobs after update:', jobs.map(j => j.id === jobData.id ? updatedJob : j));

      return updatedJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error updating job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentJob, jobs]);

  // Delete a job
  const deleteJob = useCallback(async (jobId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Mock API call
      await mockSaveData({ id: jobId, deleted: true });

      // Update local state
      setJobs(prevJobs => prevJobs.filter(j => j.id !== jobId));

      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(null);
      }
      
      // Log the current jobs state after delete
      console.log('Jobs after delete:', jobs.filter(j => j.id !== jobId));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error deleting job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentJob, jobs]);

  // Generate a report
  const generateReportAction = useCallback(async (
    jobId: string, 
    candidateIds: string[], 
    additionalPrompt?: string
  ): Promise<Report> => {
    setIsLoading(true);
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Create a report
      const report = await generateReport(job, candidateIds, additionalPrompt);
      
      // Update local state
      setReports(prevReports => [...prevReports, report]);
      
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error generating report';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [jobs]);

  return {
    jobs,
    setJobs,
    reports,
    setReports,
    currentJob,
    setCurrentJob,
    isLoading,
    setIsLoading,
    error,
    setError,
    createJob,
    updateJob,
    deleteJob,
    generateReport: generateReportAction,
  };
}
