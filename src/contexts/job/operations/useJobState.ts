
import { useState } from 'react';
import { Job, Report } from '../types';

/**
 * Hook to manage the global job and report state
 */
export function useJobState() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    // State values
    jobs,
    reports,
    currentJob,
    isLoading,
    error,
    
    // State setters
    setJobs,
    setReports,
    setCurrentJob,
    setIsLoading,
    setError,
  };
}
