
import { Job } from '@/types/job.types';
import { saveStorageData } from './saveStorageData';

/**
 * Save a single entity (like a job or report) to storage
 */
export const saveStorageItem = async (item: any): Promise<void> => {
  // If we're saving a job
  if (item && item.title && item.candidates) {
    await saveStorageData({ jobs: [item] });
  }
  // If we're saving a report
  else if (item && item.candidateIds) {
    await saveStorageData({ reports: [item] });
  }
};
