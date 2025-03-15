
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Job } from '@/types/job.types';
import { 
  ClipboardList, 
  Users, 
  FileText, 
  TrendingUp,
  Star 
} from 'lucide-react';

interface DashboardStatsProps {
  jobs: Job[];
  reports: any[];
}

const DashboardStats = ({ jobs, reports }: DashboardStatsProps) => {
  // Calculate statistics
  const totalJobs = jobs.length;
  const totalCandidates = jobs.reduce((sum, job) => sum + job.candidates.length, 0);
  const totalReports = reports.length;
  const starredCandidates = jobs.reduce(
    (sum, job) => sum + job.candidates.filter(c => c.isStarred).length, 
    0
  );
  
  // Find top job (with most candidates)
  const topJob = [...jobs].sort((a, b) => b.candidates.length - a.candidates.length)[0];
  
  const stats = [
    {
      label: 'Active Jobs',
      value: totalJobs,
      icon: <ClipboardList className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
      link: '/jobs'
    },
    {
      label: 'Total Candidates',
      value: totalCandidates,
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
      link: topJob ? `/jobs/${topJob.id}/analysis` : '/jobs'
    },
    {
      label: 'Generated Reports',
      value: totalReports,
      icon: <FileText className="h-5 w-5" />,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
      link: topJob ? `/jobs/${topJob.id}/report` : '/jobs'
    },
    {
      label: 'Starred Candidates',
      value: starredCandidates,
      icon: <Star className="h-5 w-5" />,
      color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
      link: '/jobs'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Link to={stat.link} key={index}>
          <Card className="h-full hover:shadow-md transition-all hover:border-primary/20">
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              
              <div className="font-bold text-3xl mb-1">
                {stat.value}
              </div>
              
              <div className="text-muted-foreground text-sm">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default DashboardStats;
