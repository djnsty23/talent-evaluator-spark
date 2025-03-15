
import { saveJobData } from './supabase/jobOperations';
import { saveRequirementsData } from './supabase/requirementsOperations';
import { saveCandidatesData } from './supabase/candidateOperations';
import { saveReportData } from './supabase/reportOperations';
import { deleteJob } from './supabase/jobOperations';

/**
 * Save a single entity to Supabase
 */
export const mockSaveData = async (data: any): Promise<void> => {
  try {
    console.log('Saving data to Supabase:', data);
    
    // If we're saving a job
    if (data.id && (data.title || data.candidates)) {
      await saveJobData(data);
      
      // Save candidates if they exist
      if (data.candidates && data.candidates.length > 0) {
        await saveCandidatesData(data.candidates, data.id);
      }
      
      // Save requirements if they exist
      if (data.requirements && data.requirements.length > 0) {
        await saveRequirementsData(data.requirements, data.id);
      }
    }
    
    // If we're saving a report
    if (data.id && data.candidateIds) {
      await saveReportData(data);
    }
    
    // If we're deleting a job
    if (data.id && data.deleted) {
      await deleteJob(data.id);
    }
  } catch (err) {
    console.error('Error saving to Supabase:', err);
    throw err;
  }
};
