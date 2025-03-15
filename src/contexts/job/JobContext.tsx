import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { JobContextType } from './types';
import { useJobOperations } from './useJobOperations';
import { useCandidateOperations } from './useCandidateOperations';
import { useJobData } from './useJobData';
import { Job } from '@/types/job.types';

const JobContext = createContext<JobContextType | undefined>(undefined);

interface JobProviderProps {
  children: ReactNode;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  // Get job operations (create, update, delete, etc.)
  const {
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
    generateReport
  } = useJobOperations();

  // Use job data loading effect
  useJobData(jobs, reports, setJobs, setReports, setIsLoading, setError);

  // Get candidate operations
  const {
    uploadCandidateFiles,
    processCandidate,
    handleProcessAllCandidates,
    starCandidate,
    deleteCandidate
  } = useCandidateOperations(
    jobs,
    setJobs,
    currentJob,
    setCurrentJob,
    setIsLoading,
    setError
  );

  // Listen for job data refresh events
  useEffect(() => {
    const handleJobDataRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent<{ jobId: string; refreshedJob: Job }>;
      const { jobId, refreshedJob } = customEvent.detail;
      
      console.log('JobContext: Received job data refresh event for job:', jobId);
      
      // Update the jobs array with the refreshed job
      setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? refreshedJob : j));
      
      // Update currentJob if it's the one that was refreshed
      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(refreshedJob);
      }
      
      toast.success('Candidate data refreshed from database');
    };

    window.addEventListener('job-data-refreshed', handleJobDataRefreshed);
    
    return () => {
      window.removeEventListener('job-data-refreshed', handleJobDataRefreshed);
    };
  }, [currentJob, setJobs, setCurrentJob]);

  const value: JobContextType = {
    jobs,
    reports,
    currentJob,
    isLoading,
    error,
    createJob,
    updateJob,
    deleteJob,
    uploadCandidateFiles,
    processCandidate,
    handleProcessAllCandidates,
    starCandidate,
    deleteCandidate,
    generateReport,
    setCurrentJob,
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};

export const useJob = (): JobContextType => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
};
