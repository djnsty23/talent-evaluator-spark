
import { v4 as uuidv4 } from 'uuid';
import { ContextFile } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Save context files to Supabase
 */
export const saveContextFiles = async (jobId: string, files: ContextFile[]): Promise<void> => {
  for (const file of files) {
    const fileId = file.id || uuidv4();
    
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
      throw error;
    }
  }
};
