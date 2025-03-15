
import { Report } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserId } from '@/utils/authUtils';

/**
 * Save reports to Supabase
 */
export const saveReports = async (reports: Report[]): Promise<void> => {
  let savedCount = 0;
  let errorCount = 0;
  
  // Check authentication status first
  const userId = await getUserId();
  if (!userId) {
    console.error('User must be authenticated to save reports');
    toast.error('Authentication required to save reports');
    return;
  }
  
  for (const report of reports) {
    try {
      console.log(`Saving report to Supabase: ${report.id}`);
      
      if (!report.id || !report.title || !report.jobId) {
        console.error('Invalid report data:', report);
        errorCount++;
        continue;
      }
      
      const { error } = await supabase
        .from('reports')
        .upsert({ 
          id: report.id,
          title: report.title,
          content: report.content,
          job_id: report.jobId // Map from our app's jobId to the DB's job_id
        });
      
      if (error) {
        console.error('Error saving report to Supabase:', error);
        errorCount++;
        continue; // Skip linking candidates for this report
      }
      
      savedCount++;
      
      // Also save the candidate links
      if (report.candidateIds && report.candidateIds.length > 0) {
        await saveCandidateReportLinks(report.id, report.candidateIds);
      }
    } catch (error) {
      console.error('Exception saving report:', error);
      errorCount++;
    }
  }
  
  // Provide feedback based on results
  if (errorCount === 0 && savedCount > 0) {
    toast.success(`Successfully saved ${savedCount} report(s)`);
  } else if (savedCount > 0 && errorCount > 0) {
    toast.warning(`Saved ${savedCount} report(s), but ${errorCount} failed`);
  } else if (errorCount > 0) {
    toast.error(`Failed to save any reports. Check console for details.`);
  }
};

/**
 * Save the links between candidates and reports
 */
const saveCandidateReportLinks = async (reportId: string, candidateIds: string[]): Promise<void> => {
  let linkedCount = 0;
  
  // First clear existing links to avoid duplicates
  try {
    const { error } = await supabase
      .from('report_candidates')
      .delete()
      .eq('report_id', reportId);
      
    if (error) {
      console.error('Error clearing existing candidate-report links:', error);
      // Continue anyway to try adding new links
    }
  } catch (error) {
    console.error('Exception clearing existing candidate-report links:', error);
  }
  
  // Add new links - use batch insert for better performance
  try {
    const links = candidateIds.map(candidateId => ({
      report_id: reportId,
      candidate_id: candidateId
    }));
    
    const { error, count } = await supabase
      .from('report_candidates')
      .upsert(links);
    
    if (error) {
      console.error('Error saving candidate-report links to Supabase:', error);
    } else {
      linkedCount = count || candidateIds.length;
    }
  } catch (error) {
    console.error('Exception linking candidates to report:', error);
  }
  
  console.log(`Linked ${linkedCount}/${candidateIds.length} candidates to report ${reportId}`);
};
