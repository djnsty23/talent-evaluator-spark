
import { v4 as uuidv4 } from 'uuid';
import { ContextFile } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Save context files to Supabase
 */
export const saveContextFiles = async (jobId: string, files: ContextFile[]): Promise<void> => {
  try {
    // Verify user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      console.error('User not authenticated, cannot save context files');
      toast.error('You must be logged in to save files');
      return;
    }

    // Verify job exists and belongs to current user
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('id, user_id')
      .eq('id', jobId)
      .eq('user_id', sessionData.session.user.id)
      .maybeSingle();

    if (jobError || !jobData) {
      console.error('Job not found or does not belong to current user:', jobError);
      toast.error('Cannot save files: Job not found or access denied');
      return;
    }

    for (const file of files) {
      try {
        // Generate a valid UUID for the file if not provided
        const fileId = file.id && file.id.includes('-') && file.id.length >= 36 ? file.id : uuidv4();
        
        const { error } = await supabase
          .from('job_context_files')
          .upsert({ 
            id: fileId,
            job_id: jobId,
            name: file.name,
            content: file.content
          });
        
        if (error) {
          console.error('Error saving context file to Supabase:', error);
          toast.error(`Failed to save file: ${file.name}`);
        }
      } catch (err) {
        console.error('Error processing file:', err);
        toast.error(`Error processing file: ${file.name}`);
      }
    }
  } catch (err) {
    console.error('Error in saveContextFiles:', err);
    toast.error('Failed to save context files');
  }
};
