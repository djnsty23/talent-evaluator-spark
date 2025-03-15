
import { v4 as uuidv4 } from 'uuid';
import { JobRequirement } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Save job requirements to Supabase
 */
export const saveJobRequirements = async (jobId: string, requirements: JobRequirement[]): Promise<void> => {
  for (const req of requirements) {
    // Ensure requirement ID is a valid UUID
    const requirementId = req.id && req.id.includes('-') ? req.id : uuidv4();
    
    const { error } = await supabase
      .from('job_requirements')
      .upsert({ 
        id: requirementId,
        job_id: jobId,
        title: req.category || 'Requirement',
        description: req.description,
        weight: req.weight || 1
      });
    
    if (error) {
      console.error('Error saving job requirement to Supabase:', error);
      throw error;
    }
  }
};

/**
 * Save requirements to Supabase
 */
export const saveRequirementsData = async (requirements: JobRequirement[], jobId: string): Promise<void> => {
  for (const req of requirements) {
    // Ensure requirement ID is a valid UUID
    const requirementId = req.id && req.id.includes('-') ? req.id : uuidv4();
    
    const { error } = await supabase
      .from('job_requirements')
      .upsert({ 
        id: requirementId,
        job_id: jobId,
        title: req.category || 'Requirement',
        description: req.description,
        weight: req.weight || 1
      });
    
    if (error) {
      console.error('Error saving job requirement to Supabase:', error);
    }
  }
};
