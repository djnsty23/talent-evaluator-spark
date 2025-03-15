
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useJob } from '@/contexts/job/JobContext';
import { PageLoading } from '@/components/ui/page-loading';
import ErrorPage from '@/components/ui/error-page';
import DashboardStats from '@/components/dashboard/DashboardStats';
import JobList from '@/components/dashboard/JobList';
import { Job } from '@/types/job.types';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { jobs, reports, loadJobs, isLoading, error } = useJob();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  
  useEffect(() => {
    if (currentUser && !isLoading && !jobs.length) {
      loadJobs();
    }
  }, [currentUser, loadJobs, isLoading, jobs]);
  
  useEffect(() => {
    // Get recent jobs (limited to 10)
    const sorted = [...jobs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setRecentJobs(sorted.slice(0, 10));
  }, [jobs]);
  
  if (isLoading) {
    return <PageLoading message="Loading your dashboard..." />;
  }
  
  if (error) {
    return (
      <ErrorPage 
        title="Error loading dashboard"
        message={error}
        showHomeButton={true}
        showRefreshButton={true}
      />
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Welcome, {currentUser?.name?.split(' ')[0] || 'User'}
        </h1>
        
        <DashboardStats jobs={jobs} reports={reports} />
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Jobs</h2>
          <JobList jobs={jobs} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
