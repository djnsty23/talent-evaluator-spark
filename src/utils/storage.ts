
import { Job, Report } from '@/types/job.types';

const STORAGE_KEY = 'job_app_data';

interface StorageData {
  jobs: Job[];
  reports: Report[];
}

export const getStorageData = (): StorageData => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      console.log('Loading data from localStorage:', parsedData);
      return {
        jobs: parsedData.jobs || [],
        reports: parsedData.reports || []
      };
    }
  } catch (err) {
    console.error('Error loading data from localStorage:', err);
  }
  
  return { jobs: [], reports: [] };
};

export const saveStorageData = (data: StorageData): void => {
  try {
    console.log('Saving data to localStorage:', data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving data to localStorage:', err);
  }
};

export const mockSaveData = async (data: any): Promise<void> => {
  return new Promise((resolve) => {
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
      } catch (err) {
        console.error('Error saving to localStorage:', err);
      }
      
      resolve();
    }, 500);
  });
};
