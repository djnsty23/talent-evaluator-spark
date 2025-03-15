
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { JobRequirement } from '@/types/job.types';
import { getUserId } from '@/utils/authUtils';

/**
 * Syncs requirements from the application to the database
 * ensuring they can be properly referenced when storing scores
 */
export async function syncRequirementsToDatabase(jobId: string, requirements: JobRequirement[]): Promise<Map<string, string>> {
  console.log(`Syncing ${requirements.length} requirements for job ${jobId}`);
  
  const requirementMapping = new Map<string, string>();
  
  try {
    // Check authentication
    const userId = await getUserId();
    if (!userId) {
      console.error('User not authenticated when syncing requirements');
      return requirementMapping;
    }
    
    // Verify job exists and belongs to current user
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single();
      
    if (jobError || !jobData) {
      console.error('Job not found or access denied when syncing requirements:', jobError);
      return requirementMapping;
    }
    
    // Check for existing mappings
    const { data: existingMappings, error: fetchError } = await supabase
      .from('job_requirements_mapping')
      .select('id, original_id, description')
      .eq('job_id', jobId);
    
    if (fetchError) {
      console.error('Error fetching existing requirements:', fetchError);
      return requirementMapping;
    }
    
    // Create a map of existing mappings
    const existingMap = new Map<string, any>();
    if (existingMappings) {
      existingMappings.forEach(mapping => {
        existingMap.set(mapping.original_id, mapping);
        requirementMapping.set(mapping.original_id, mapping.id);
      });
    }
    
    // Process each requirement
    for (const req of requirements) {
      // Skip if this requirement already has a mapping
      if (existingMap.has(req.id)) {
        continue;
      }
      
      // Create a new mapping
      const mappingId = uuidv4();
      const { error } = await supabase
        .from('job_requirements_mapping')
        .insert({
          id: mappingId,
          job_id: jobId,
          original_id: req.id,
          description: req.description || 'No description',
          weight: req.weight || 1
        });
      
      if (error) {
        console.error(`Error creating mapping for requirement ${req.id}:`, error);
      } else {
        requirementMapping.set(req.id, mappingId);
      }
    }
    
    return requirementMapping;
  } catch (error) {
    console.error('Error syncing requirements:', error);
    return requirementMapping;
  }
}

/**
 * Determines if the provided job has all of its requirements synced to the database
 */
export async function areRequirementsSynced(jobId: string, requirements: JobRequirement[]): Promise<boolean> {
  try {
    // Check authentication
    const userId = await getUserId();
    if (!userId) {
      console.error('User not authenticated when checking synced requirements');
      return false;
    }
    
    // Verify job exists and belongs to current user
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single();
      
    if (jobError || !jobData) {
      console.error('Job not found or access denied when checking synced requirements:', jobError);
      return false;
    }
    
    // Get count of mapped requirements
    const { data, error, count } = await supabase
      .from('job_requirements_mapping')
      .select('id', { count: 'exact' })
      .eq('job_id', jobId);
    
    if (error) {
      console.error('Error checking synced requirements:', error);
      return false;
    }
    
    return (count || 0) === requirements.length;
  } catch (error) {
    console.error('Error checking synced requirements:', error);
    return false;
  }
}

/**
 * Cleans up requirement mappings and related data when a job is deleted
 * Handles removal of all job-related data to prevent foreign key constraint errors
 */
export async function cleanupRequirementMappings(jobId: string): Promise<void> {
  try {
    console.log(`Starting cleanup for job ${jobId}`);
    
    // Check authentication
    const userId = await getUserId();
    if (!userId) {
      console.error('User not authenticated when cleaning up requirement mappings');
      return;
    }
    
    // Check if the job belongs to the current user before deleting mappings
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single();
      
    if (jobError) {
      console.error('Job not found or access denied when cleaning up requirement mappings:', jobError);
      return;
    }
    
    // Delete candidate scores that reference the requirements for this job
    console.log(`Deleting candidate scores for job ${jobId}`);
    const { error: scoreDeleteError } = await supabase
      .rpc('delete_candidate_scores_for_job', { job_id: jobId });
    
    if (scoreDeleteError) {
      console.error('Error deleting candidate scores:', scoreDeleteError);
      // Continue with other deletions even if this fails
    }
    
    // Delete requirement mappings for this job
    console.log(`Deleting requirement mappings for job ${jobId}`);
    const { error: mappingError } = await supabase
      .from('job_requirements_mapping')
      .delete()
      .eq('job_id', jobId);
    
    if (mappingError) {
      console.error('Error cleaning up requirement mappings:', mappingError);
      throw mappingError;
    }
    
    console.log(`Successfully cleaned up requirement mappings for job ${jobId}`);
  } catch (error) {
    console.error('Error cleaning up requirement mappings:', error);
    throw error;
  }
}
