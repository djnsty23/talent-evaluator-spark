
import { Job } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserId } from '@/utils/authUtils';

/**
 * Save jobs to Supabase
 */
export const saveJobs = async (jobs: Job[]): Promise<void> => {
  const currentUserId = await getUserId();
  if (!currentUserId) {
    console.error('No authenticated user found when saving jobs');
    toast.error('You must be logged in to save jobs');
    return;
  }

  for (const job of jobs) {
    // Always use the current user's ID from auth, not the one stored in the job
    // This ensures we comply with RLS policies
    
    const { error } = await supabase
      .from('jobs')
      .upsert({ 
        id: job.id,
        title: job.title || 'Untitled Job',
        company: job.company || '',
        description: job.description || '',
        location: job.location || '',
        department: job.department || '',
        salary: job.salary || null,
        user_id: currentUserId
      });
    
    if (error) {
      console.error('Error saving job to Supabase:', error);
      throw error;
    }
  }
};

/**
 * Save a single job to Supabase
 */
export const saveJobData = async (data: any): Promise<void> => {
  // Get the current authenticated user ID
  const currentUserId = await getUserId();
  
  if (!currentUserId) {
    console.error('No authenticated user found when saving job');
    throw new Error('You must be logged in to save jobs');
  }

  const { error } = await supabase
    .from('jobs')
    .upsert({ 
      id: data.id,
      title: data.title || 'Untitled Job',
      company: data.company || '',
      description: data.description || '',
      location: data.location || '',
      department: data.department || '',
      salary: data.salary || null,
      user_id: currentUserId // Use the current user ID from auth
    });
  
  if (error) {
    console.error('Error saving job to Supabase:', error);
    throw error;
  }
};

/**
 * Delete a job from Supabase
 */
export const deleteJob = async (jobId: string): Promise<void> => {
  const userId = await getUserId();
  
  if (!userId) {
    throw new Error('You must be logged in to delete a job');
  }
  
  try {
    // Use the secure function to delete the job and all related data
    const { error } = await supabase
      .rpc('delete_job_cascade', { 
        p_job_id: jobId,
        p_user_id: userId
      });
      
    if (error) {
      console.error('Error deleting job from Supabase:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error with delete_job_cascade function:', err);
    
    // Fallback: delete the job directly if the RPC function fails
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error with fallback job deletion:', error);
      throw error;
    }
  }
};
