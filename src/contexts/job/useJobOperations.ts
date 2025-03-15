
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Job, Candidate, Report } from './types';
import { JobService, ReportService } from '@/services/api';

export function useJobOperations() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new job
  const createJob = async (jobData: Partial<Job>): Promise<Job> => {
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
  };

  // Update an existing job
  const updateJob = async (jobData: Job): Promise<Job> => {
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
  };

  // Delete a job
  const deleteJob = async (jobId: string): Promise<void> => {
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
  };

  // Upload candidate files for a job
  const uploadCandidateFiles = async (jobId: string, files: File[]): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Upload files and create candidates
      const newCandidates = await JobService.uploadCandidateFiles(jobId, files);

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
  };

  // Star a candidate
  const starCandidate = async (jobId: string, candidateId: string, isStarred: boolean): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Update candidate's isStarred status
      await JobService.starCandidate(jobId, candidateId, isStarred);

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
  };

  // Delete a candidate
  const deleteCandidate = async (jobId: string, candidateId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Delete candidate
      await JobService.deleteCandidate(jobId, candidateId);

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
  };

  // Generate a report for candidates in a job
  const generateReport = async (
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

      // Get the selected candidates
      const selectedCandidates = jobData.candidates.filter(c => 
        validCandidateIds.includes(c.id)
      );

      // Generate the report
      const report = await ReportService.generateReport(
        jobData,
        selectedCandidates,
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
  };

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
    uploadCandidateFiles,
    starCandidate,
    deleteCandidate,
    generateReport,
  };
}
