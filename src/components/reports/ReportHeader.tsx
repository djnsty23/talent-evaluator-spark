
import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Job, Report } from '@/types/job.types';
import { format } from 'date-fns';

interface ReportHeaderProps {
  job: Job;
  report: Report;
  onExportCSV: () => void;
}

const ReportHeader = ({ job, report, onExportCSV }: ReportHeaderProps) => {
  return (
    <>
      <Button 
        variant="ghost" 
        asChild 
        className="mb-6"
      >
        <Link to={`/jobs/${job.id}`} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Job Details
        </Link>
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Candidate Ranking Report</h1>
          <p className="text-muted-foreground mt-1">
            {job.title} at {job.company}
          </p>
        </div>
        
        <Button 
          onClick={onExportCSV}
          className="mt-4 md:mt-0"
        >
          <Download className="h-4 w-4 mr-2" />
          Export as CSV
        </Button>
      </div>
    </>
  );
};

export default ReportHeader;
