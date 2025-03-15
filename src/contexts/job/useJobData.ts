
import { useEffect } from 'react';
import { getStorageData, saveStorageData } from '@/utils/storage';
import { Job, Report } from './types';

export function useJobData(
  jobs: Job[],
  reports: Report[],
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>,
  setReports: React.Dispatch<React.SetStateAction<Report[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  // Load data from Supabase on initial render
  useEffect(() => {
    const loadSavedData = async () => {
      setIsLoading(true);
      try {
        const data = await getStorageData();
        setJobs(data.jobs);
        setReports(data.reports);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, [setJobs, setReports, setIsLoading, setError]);

  // Save data to Supabase whenever it changes
  useEffect(() => {
    saveStorageData({ jobs, reports });
  }, [jobs, reports]);

  return { jobs, reports };
}
