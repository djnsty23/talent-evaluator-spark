
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
    const loadData = () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!jobId || !reportId) {
          setError("Missing job or report ID");
          setIsLoading(false);
          return;
        }
        
        console.log("Loading report with ID:", reportId);
        console.log("Available reports:", reports);
        
        // Find the job
        const foundJob = jobs?.find(j => j.id === jobId);
        if (!foundJob) {
          setError("Job not found");
          setIsLoading(false);
          return;
        }
        
        // Find the report
        const foundReport = reports?.find(r => r.id === reportId);
        if (!foundReport) {
          setError("Report not found");
          setIsLoading(false);
          return;
        }
        
        console.log("Found report:", foundReport);
        console.log("Found job:", foundJob);
        
        setJob(foundJob);
        setReport(foundReport);
      } catch (err) {
        console.error("Error loading report data:", err);
        setError("Failed to load report data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
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
  const reportCandidates = job.candidates.filter(c => 
    report.candidateIds && report.candidateIds.includes(c.id)
  );

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
            candidateCount={report.candidateIds?.length || 0} 
          />
          
          <ReportScoreMatrix 
            candidates={reportCandidates} 
            requirements={job.requirements}
          />
          
          <ReportCandidates 
            job={job} 
            candidateIds={report.candidateIds || []} 
          />
          
          <ReportContent content={report.content || ''} />
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
