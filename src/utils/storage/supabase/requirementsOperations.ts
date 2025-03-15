
import { v4 as uuidv4 } from 'uuid';
import { JobRequirement } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Save job requirements to Supabase
 */
export const saveJobRequirements = async (jobId: string, requirements: JobRequirement[]): Promise<void> => {
  try {
    // Ensure job_requirements_mapping entries exist for each requirement
    for (const req of requirements) {
      // Ensure requirement ID is a valid UUID
      const requirementId = req.id && req.id.includes('-') && req.id.length >= 36 ? req.id : uuidv4();
      
      // Save to job_requirements_mapping for candidate_scores foreign key reference
      const { error: mappingError } = await supabase
        .from('job_requirements_mapping')
        .upsert({ 
          id: requirementId,
          job_id: jobId,
          description: req.description || 'Requirement',
          original_id: requirementId,
          weight: req.weight || 1
        });
      
      if (mappingError) {
        console.error('Error saving job requirement mapping to Supabase:', mappingError);
        toast.error('Failed to save requirement mapping data');
        continue;
      }
      
      // Save to job_requirements table
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
        toast.error('Failed to save requirement data');
      }
    }
  } catch (err) {
    console.error('Error in saveJobRequirements:', err);
    toast.error('Failed to save job requirements');
    throw err;
  }
};

/**
 * Save requirements to Supabase
 */
export const saveRequirementsData = async (requirements: JobRequirement[], jobId: string): Promise<void> => {
  try {
    // Ensure job_requirements_mapping entries exist for each requirement
    for (const req of requirements) {
      // Ensure requirement ID is a valid UUID
      const requirementId = req.id && req.id.includes('-') && req.id.length >= 36 ? req.id : uuidv4();
      
      // Save to job_requirements_mapping for candidate_scores foreign key reference
      const { error: mappingError } = await supabase
        .from('job_requirements_mapping')
        .upsert({ 
          id: requirementId,
          job_id: jobId,
          description: req.description || 'Requirement',
          original_id: requirementId,
          weight: req.weight || 1
        });
      
      if (mappingError) {
        console.error('Error saving job requirement mapping to Supabase:', mappingError);
        continue;
      }
      
      // Save to job_requirements table
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
  } catch (err) {
    console.error('Error in saveRequirementsData:', err);
  }
};
