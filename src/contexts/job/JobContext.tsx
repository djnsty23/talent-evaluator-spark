
import React, { createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { JobContextType } from './types';
import { useJobOperations } from './useJobOperations';
import { useCandidateOperations } from './useCandidateOperations';
import { useJobData } from './useJobData';

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
