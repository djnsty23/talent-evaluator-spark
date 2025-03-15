
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
      toast.error('Failed to save job');
      throw error;
    }
  }
};
