
import { Job, Report } from '@/types/job.types';
import { toast } from 'sonner';

const STORAGE_KEY = 'job_app_data';

interface StorageData {
  jobs: Job[];
  reports: Report[];
}

/**
 * Get data from localStorage with error handling to prevent app crashes
 */
export const getStorageData = (): StorageData => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      console.log('Loading data from localStorage:', parsedData);
      return {
        jobs: Array.isArray(parsedData.jobs) ? parsedData.jobs : [],
        reports: Array.isArray(parsedData.reports) ? parsedData.reports : []
      };
    }
  } catch (err) {
    console.error('Error loading data from localStorage:', err);
    // Return empty data rather than crashing
  }
  
  return { jobs: [], reports: [] };
};

/**
 * Save data to localStorage with error handling
 */
export const saveStorageData = (data: StorageData): void => {
  try {
    // Validate data before saving to prevent corruption
    const safeData = {
      jobs: Array.isArray(data.jobs) ? data.jobs : [],
      reports: Array.isArray(data.reports) ? data.reports : []
    };
    
    console.log('Saving data to localStorage:', safeData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
  } catch (err) {
    console.error('Error saving data to localStorage:', err);
    // Alert user but don't crash the app
    toast.error('Failed to save data. Your changes may not persist if you reload the page.');
  }
};

/**
 * Mock function to simulate saving data to a backend with optimistic updates
 */
export const mockSaveData = async (data: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Save to localStorage
      try {
        // Get current data from localStorage
        const currentData = getStorageData();
        
        // If we're saving a job
        if (data.id && (data.title || data.candidates)) {
          // Find if job already exists
          const jobIndex = currentData.jobs.findIndex((j: Job) => j.id === data.id);
          
          if (jobIndex >= 0) {
            // Update existing job
            currentData.jobs[jobIndex] = data;
          } else {
            // Add new job
            currentData.jobs.push(data);
          }
        }
        
        // If we're saving a report
        if (data.id && data.candidateIds) {
          // Find if report already exists
          const reportIndex = currentData.reports.findIndex((r: Report) => r.id === data.id);
          
          if (reportIndex >= 0) {
            // Update existing report
            currentData.reports[reportIndex] = data;
          } else {
            // Add new report
            currentData.reports.push(data);
          }
        }
        
        // If we're deleting a job
        if (data.id && data.deleted) {
          currentData.jobs = currentData.jobs.filter((j: Job) => j.id !== data.id);
        }
        
        // Save back to localStorage
        saveStorageData(currentData);
        resolve();
      } catch (err) {
        console.error('Error saving to localStorage:', err);
        reject(err);
      }
    }, 500);
  });
};
