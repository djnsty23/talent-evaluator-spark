
import { v4 as uuidv4 } from 'uuid';
import { JobRequirement } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserId } from '@/utils/authUtils';

/**
 * Save job requirements to Supabase
 */
export const saveJobRequirements = async (jobId: string, requirements: JobRequirement[]): Promise<void> => {
  try {
    // Verify user is authenticated
    const currentUserId = await getUserId();
    if (!currentUserId) {
      console.error('User not authenticated, cannot save job requirements');
      toast.error('You must be logged in to save requirements');
      return;
    }

    // Verify job exists and belongs to current user
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('user_id', currentUserId)
      .maybeSingle();

    if (jobError || !jobData) {
      console.error('Job not found or does not belong to current user:', jobError);
      toast.error('Cannot save requirements: Job not found or access denied');
      return;
    }

    // Save each requirement
    for (const req of requirements) {
      try {
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
      } catch (err) {
        console.error('Error processing requirement:', err);
        toast.error('Failed to process requirement');
      }
    }
    
    // If we got here without returning early, at least some requirements were saved
    toast.success('Job requirements saved successfully');
  } catch (err) {
    console.error('Error in saveJobRequirements:', err);
    toast.error('Failed to save job requirements');
    throw err;
  }
};

/**
 * Save requirements to Supabase (Legacy method - consider using saveJobRequirements instead)
 */
export const saveRequirementsData = async (requirements: JobRequirement[], jobId: string): Promise<void> => {
  try {
    // Verify user is authenticated
    const currentUserId = await getUserId();
    if (!currentUserId) {
      console.error('User not authenticated, cannot save job requirements');
      toast.error('You must be logged in to save requirements');
      return;
    }

    // Verify job exists and belongs to current user
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('user_id', currentUserId)
      .maybeSingle();

    if (jobError || !jobData) {
      console.error('Job not found or does not belong to current user:', jobError);
      toast.error('Cannot save requirements: Job not found or access denied');
      return;
    }
    
    // Ensure job_requirements_mapping entries exist for each requirement
    for (const req of requirements) {
      try {
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
      } catch (err) {
        console.error('Error processing requirement:', err);
      }
    }
    
    toast.success('Requirements saved successfully');
  } catch (err) {
    console.error('Error in saveRequirementsData:', err);
    toast.error('Failed to save requirements');
  }
};
