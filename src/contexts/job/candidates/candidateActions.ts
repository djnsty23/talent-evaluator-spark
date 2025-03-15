import { Job } from '../types';
import { saveStorageItem } from '@/utils/storage';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for managing candidate star/unstar operations
 */
export function useStarCandidate(
  jobs: Job[],
  currentJob: Job | null,
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>,
  setCurrentJob: React.Dispatch<React.SetStateAction<Job | null>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  /**
   * Star/unstar a candidate
   */
  const starCandidate = async (jobId: string, candidateId: string, isStarred: boolean): Promise<void> => {
    try {
      // Find the job and candidate
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      const candidateIndex = job.candidates.findIndex(c => c.id === candidateId);
      if (candidateIndex === -1) throw new Error('Candidate not found');
      
      // Update the candidate
      const updatedCandidates = [...job.candidates];
      updatedCandidates[candidateIndex] = {
        ...updatedCandidates[candidateIndex],
        isStarred,
      };
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      };
      
      // Save to storage
      await saveStorageItem(updatedJob);
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? updatedJob : j)
      );
      
      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error starring candidate';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return { starCandidate };
}

/**
 * Hook for managing candidate deletion
 */
export function useDeleteCandidate(
  jobs: Job[],
  currentJob: Job | null,
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>,
  setCurrentJob: React.Dispatch<React.SetStateAction<Job | null>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  /**
   * Delete a candidate
   */
  const deleteCandidate = async (jobId: string, candidateId: string): Promise<void> => {
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Filter out the candidate
      const updatedCandidates = job.candidates.filter(c => c.id !== candidateId);
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      };
      
      // First, try to delete any reports that reference this candidate
      try {
        // Check if there are reports with this candidate
        const { data: reportLinks } = await supabase
          .from('report_candidates')
          .select('report_id')
          .eq('candidate_id', candidateId);
        
        // If there are report links, update those reports by removing this candidate ID
        if (reportLinks && reportLinks.length > 0) {
          for (const link of reportLinks) {
            await supabase
              .from('report_candidates')
              .delete()
              .eq('report_id', link.report_id)
              .eq('candidate_id', candidateId);
          }
        }
      } catch (error) {
        console.error('Error cleaning up candidate references in reports:', error);
        // Continue with deletion even if report cleanup fails
      }
      
      // Try to delete the candidate from Supabase (if it exists there)
      try {
        await supabase
          .from('candidates')
          .delete()
          .eq('id', candidateId);
      } catch (error) {
        console.error('Error deleting candidate from Supabase:', error);
        // Continue with local deletion even if Supabase deletion fails
      }
      
      // Save to storage
      await saveStorageItem(updatedJob);
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? updatedJob : j)
      );
      
      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error deleting candidate';
      setError(errorMessage);
      console.error('Error in deleteCandidate:', err);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return { deleteCandidate };
}
