
import { Job } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserId } from '@/utils/authUtils';

/**
 * Job Service for CRUD operations on jobs
 */
export class JobService {
  /**
   * Create a new job in Supabase
   */
  static async createJob(job: Job): Promise<Job> {
    try {
      console.log('Creating job in Supabase:', job);
      
      // Get current user ID for Supabase RLS
      const userId = await getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('jobs')
        .insert({
          id: job.id,
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location || '',
          department: job.department || '',
          user_id: userId // Add the user_id field required by Supabase
        });
      
      if (error) {
        console.error('Error creating job in Supabase:', error);
        toast.error('Failed to create job');
        throw error;
      }
      
      toast.success('Job created successfully');
      return job;
    } catch (error) {
      console.error('Exception creating job:', error);
      throw error;
    }
  }

  /**
   * Update an existing job in Supabase
   */
  static async updateJob(job: Job): Promise<Job> {
    try {
      console.log('Updating job in Supabase:', job);
      
      // Get current user ID for Supabase RLS
      const userId = await getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('jobs')
        .update({
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location || '',
          department: job.department || '',
          // Don't update user_id on update operations
        })
        .eq('id', job.id);
      
      if (error) {
        console.error('Error updating job in Supabase:', error);
        toast.error('Failed to update job');
        throw error;
      }
      
      return job;
    } catch (error) {
      console.error('Exception updating job:', error);
      throw error;
    }
  }

  /**
   * Delete a job from Supabase
   */
  static async deleteJob(jobId: string): Promise<void> {
    try {
      console.log('Deleting job from Supabase:', jobId);
      
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);
      
      if (error) {
        console.error('Error deleting job from Supabase:', error);
        toast.error('Failed to delete job');
        throw error;
      }
      
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Exception deleting job:', error);
      throw error;
    }
  }
}
