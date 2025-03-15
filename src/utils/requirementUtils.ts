
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { JobRequirement } from '@/types/job.types';

/**
 * Syncs requirements from the application to the database
 * ensuring they can be properly referenced when storing scores
 */
export async function syncRequirementsToDatabase(jobId: string, requirements: JobRequirement[]): Promise<Map<string, string>> {
  console.log(`Syncing ${requirements.length} requirements for job ${jobId}`);
  
  const requirementMapping = new Map<string, string>();
  
  try {
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
    // Get count of mapped requirements
    const { data, error } = await supabase
      .from('job_requirements_mapping')
      .select('id', { count: 'exact' })
      .eq('job_id', jobId);
    
    if (error) {
      console.error('Error checking synced requirements:', error);
      return false;
    }
    
    return data.length === requirements.length;
  } catch (error) {
    console.error('Error checking synced requirements:', error);
    return false;
  }
}
