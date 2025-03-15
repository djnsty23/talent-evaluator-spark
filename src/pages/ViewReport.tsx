
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Job, Report } from '@/types/job.types';
import { exportReportToCSV } from '@/components/reports/ReportCSVExporter';
import ReportHeader from '@/components/reports/ReportHeader';
import ReportMetrics from '@/components/reports/ReportMetrics';
import ReportScoreMatrix from '@/components/reports/ReportScoreMatrix';
import ReportCandidates from '@/components/reports/ReportCandidates';
import ReportContent from '@/components/reports/ReportContent';
import ReportShareWidget from '@/components/reports/ReportShareWidget';
import { PageLoading } from '@/components/ui/page-loading';
import ErrorPage from '@/components/ui/error-page';

const ViewReport = () => {
  const { jobId, reportId } = useParams<{ jobId: string; reportId: string }>();
  const { jobs, reports } = useJob();
  const [job, setJob] = useState<Job | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (jobId && jobs) {
      const foundJob = jobs.find(j => j.id === jobId);
      if (foundJob) {
        setJob(foundJob);
      } else {
        setError("Job not found");
      }
    }

    if (reportId && reports) {
      const foundReport = reports.find(r => r.id === reportId);
      if (foundReport) {
        setReport(foundReport);
      } else {
        setError("Report not found");
      }
    }

    setIsLoading(false);
  }, [jobId, reportId, jobs, reports]);

  const handleExportCSV = () => {
    if (!report || !job) return;
    exportReportToCSV(job, report.candidateIds);
  };

  if (isLoading) {
    return <PageLoading message="Loading report..." />;
  }

  if (error || !job || !report) {
    return (
      <ErrorPage 
        title="Report Not Available"
        message={error || "The requested report could not be found"}
        showHomeButton={true}
        showRefreshButton={false}
      />
    );
  }

  // Get candidates included in report
  const reportCandidates = job.candidates.filter(c => report.candidateIds.includes(c.id));

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <ReportHeader 
        job={job} 
        report={report} 
        onExportCSV={handleExportCSV} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ReportMetrics 
            report={report} 
            candidateCount={report.candidateIds.length} 
          />
          
          <ReportScoreMatrix 
            candidates={reportCandidates} 
            requirements={job.requirements}
          />
          
          <ReportCandidates 
            job={job} 
            candidateIds={report.candidateIds} 
          />
          
          <ReportContent content={report.content} />
        </div>
        
        <div className="space-y-6">
          <ReportShareWidget 
            reportId={report.id} 
            jobId={job.id} 
          />
          
          {/* Additional side widgets can be added here */}
        </div>
      </div>
    </div>
  );
};

export default ViewReport;
