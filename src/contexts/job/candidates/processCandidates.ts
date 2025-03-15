import { Job, Candidate } from '../types';
import { processCandidate } from '@/services/candidateService';
import { saveCandidates } from '@/utils/storage/supabase/candidateOperations';
import { saveJobData, getJobById } from '@/utils/storage/supabase/jobOperations';
import { toast } from 'sonner';

/**
 * Hook for processing individual candidates
 */
export function useProcessCandidate(
  jobs: Job[],
  currentJob: Job | null,
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>,
  setCurrentJob: React.Dispatch<React.SetStateAction<Job | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  /**
   * Process a single candidate
   */
  const processCandidateAction = async (jobId: string, candidateId: string): Promise<void> => {
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
      
      // Save to Supabase
      await saveCandidates(jobId, updatedCandidates);
      await saveJobData(updatedJob);
      
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
  };

  return { processCandidateAction };
}

/**
 * Hook for batch processing all candidates
 */
export function useProcessAllCandidates(
  jobs: Job[],
  processCandidateAction: (jobId: string, candidateId: string) => Promise<void>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  /**
   * Process all unprocessed candidates
   */
  const handleProcessAllCandidates = async (jobId: string): Promise<void> => {
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
      
      // Fetch the latest job data from Supabase to ensure UI is in sync
      try {
        const refreshedJob = await getJobById(jobId);
        if (refreshedJob) {
          console.log('Refreshed job data from Supabase after processing');
          
          // Update the jobs array with the refreshed job data
          const updatedJobs = jobs.map(j => j.id === jobId ? refreshedJob : j);
          
          // We need to access the setJobs function from the parent context
          // This is a workaround since we don't have direct access to setJobs here
          // In a real implementation, you might want to pass setJobs as a parameter
          // or use a more sophisticated state management approach
          
          // Dispatch a custom event to notify the app that job data has been refreshed
          const refreshEvent = new CustomEvent('job-data-refreshed', { 
            detail: { 
              jobId,
              refreshedJob
            } 
          });
          window.dispatchEvent(refreshEvent);
        }
      } catch (refreshError) {
        console.error('Error refreshing job data:', refreshError);
      }
      
      // Show summary toast
      if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} candidates`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to process ${errorCount} candidates`);
        console.error('Processing errors:', processingErrors);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing candidates';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return { handleProcessAllCandidates };
}
