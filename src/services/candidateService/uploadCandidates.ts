
import { v4 as uuidv4 } from 'uuid';
import { Candidate } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { createCandidateFromFile } from './createCandidate';
import { toast } from 'sonner'; // Add import for toast

/**
 * Upload candidate files for a job
 */
export const uploadCandidateFiles = async (jobId: string, files: File[]): Promise<Candidate[]> => {
  try {
    console.log(`Uploading ${files.length} candidates for job ${jobId}`);
    
    // Create an array to store the new candidates
    const newCandidates: Candidate[] = [];
    
    // Process each file and create a candidate
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const candidate = await createCandidateFromFile(file, jobId, i);
      newCandidates.push(candidate);
    }
    
    return newCandidates;
  } catch (error) {
    console.error('Error uploading candidate files:', error);
    throw error;
  }
}

/**
 * Star a candidate
 */
export const starCandidate = async (jobId: string, candidateId: string, isStarred: boolean): Promise<void> => {
  try {
    console.log(`Starring candidate ${candidateId} for job ${jobId}: ${isStarred}`);
    
    const { error } = await supabase
      .from('candidates')
      .update({ is_starred: isStarred })
      .eq('id', candidateId)
      .eq('job_id', jobId);
    
    if (error) {
      console.error('Error starring candidate in Supabase:', error);
      toast.error('Failed to update candidate');
      throw error;
    }
  } catch (error) {
    console.error('Exception starring candidate:', error);
    throw error;
  }
}

/**
 * Delete a candidate
 */
export const deleteCandidate = async (jobId: string, candidateId: string): Promise<void> => {
  try {
    console.log(`Deleting candidate ${candidateId} from job ${jobId}`);
    
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', candidateId)
      .eq('job_id', jobId);
    
    if (error) {
      console.error('Error deleting candidate from Supabase:', error);
      toast.error('Failed to delete candidate');
      throw error;
    }
    
    toast.success('Candidate deleted successfully');
  } catch (error) {
    console.error('Exception deleting candidate:', error);
    throw error;
  }
}
