
import { useJobState } from './operations/useJobState';
import { useJobCrud } from './operations/useJobCrud';
import { useReportOperations } from './operations/useReportOperations';
import { useCandidateFileOperations } from './operations/useCandidateFileOperations';

/**
 * Main hook for job operations, now refactored to compose smaller hooks
 */
export function useJobOperations() {
  // Get the global state
  const {
    jobs,
    reports,
    currentJob,
    isLoading,
    error,
    setJobs,
    setReports,
    setCurrentJob,
    setIsLoading,
    setError
  } = useJobState();

  // Get job CRUD operations
  const { createJob, updateJob, deleteJob } = useJobCrud(
    jobs,
    setJobs,
    setIsLoading,
    setError
  );

  // Get candidate file operations
  const { 
    uploadCandidateFiles,
    starCandidate,
    deleteCandidate
  } = useCandidateFileOperations(
    jobs,
    setJobs,
    setIsLoading,
    setError
  );

  // Get report operations
  const { generateReport } = useReportOperations(
    jobs,
    reports,
    setReports,
    setIsLoading,
    setError
  );

  // Return all operations and state in one object
  return {
    // State
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
    
    // Job operations
    createJob,
    updateJob,
    deleteJob,
    
    // Candidate operations
    uploadCandidateFiles,
    starCandidate,
    deleteCandidate,
    
    // Report operations
    generateReport,
  };
}
