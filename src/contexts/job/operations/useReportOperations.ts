
import { useCallback } from 'react';
import { Job, Report } from '../types';
import { ReportService } from '@/services/api';

/**
 * Hook for report-related operations
 */
export function useReportOperations(
  jobs: Job[],
  reports: Report[],
  setReports: React.Dispatch<React.SetStateAction<Report[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  // Generate a report for candidates in a job
  const generateReport = useCallback(async (
    job: Job | string,
    candidateIds: string[],
    additionalPrompt?: string
  ): Promise<Report> => {
    setIsLoading(true);

    try {
      // Handle if job is passed as an ID instead of a Job object
      let jobData: Job;
      if (typeof job === 'string') {
        const foundJob = jobs.find(j => j.id === job);
        if (!foundJob) {
          console.log(`Job with ID ${job} not found. Available jobs:`, jobs);
          throw new Error('Job not found');
        }
        jobData = foundJob;
      } else {
        jobData = job;
      }

      // Validate the job has the selected candidates
      const validCandidateIds = candidateIds.filter(id => 
        jobData.candidates.some(c => c.id === id)
      );

      if (validCandidateIds.length === 0) {
        throw new Error('No valid candidates selected');
      }

      // Generate the report
      const report = await ReportService.generateReport(
        jobData,
        validCandidateIds,
        additionalPrompt
      );

      // Add the report to the state
      setReports(prev => [...prev, report]);

      setIsLoading(false);
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error generating report';
      console.error('Error in generateReportAction:', err);
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, [jobs, setReports, setIsLoading, setError]);

  return {
    generateReport,
  };
}
