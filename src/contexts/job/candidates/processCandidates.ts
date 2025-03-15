
import { Job, Candidate } from '@/types/job.types';
import { processCandidate } from '@/services/candidateService';
import { mockSaveData } from '@/utils/storage';
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
      console.log(`Processing candidate ${candidateId} for job ${jobId}`);
      
      // Find the job and candidate
      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        console.error('Job not found:', jobId);
        throw new Error('Job not found');
      }
      
      const candidateIndex = job.candidates.findIndex(c => c.id === candidateId);
      if (candidateIndex === -1) {
        console.error('Candidate not found:', candidateId);
        throw new Error('Candidate not found');
      }
      
      // Get the candidate and process it
      const candidate = job.candidates[candidateIndex];
      console.log('Processing candidate:', candidate.name);
      
      // Call processCandidate function and await its result
      const processedCandidate = await processCandidate(candidate, job.requirements);
      
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
      
      console.log('Updated job after processing:', updatedJob.id);
      
      // Update local state immediately
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? updatedJob : j)
      );
      
      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
      console.log(`Successfully processed candidate: ${processedCandidate.name}`);
      toast.success(`Successfully processed ${processedCandidate.name}`);
      
      return Promise.resolve();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing candidate';
      setError(errorMessage);
      console.error(`Error processing candidate: ${errorMessage}`);
      toast.error('Failed to process candidate');
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
      
      // Process each candidate sequentially to avoid race conditions
      for (const candidate of unprocessedCandidates) {
        try {
          console.log(`Processing candidate: ${candidate.name} (${candidate.id})`);
          await processCandidateAction(jobId, candidate.id);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error processing candidate ${candidate.name}:`, error);
        }
      }
      
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
      
      return Promise.resolve();
      
    } catch (err) {
      console.error('Error in handleProcessAllCandidates:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing candidates';
      setError(errorMessage);
      toast.error('Failed to process candidates');
      return Promise.reject(errorMessage);
    }
  };

  return { handleProcessAllCandidates };
}
