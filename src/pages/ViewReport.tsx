
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

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
          setError("Missing job or report ID in URL");
          setIsLoading(false);
          return;
        }
        
        console.log("Loading report with ID:", reportId);
        console.log("Available reports:", reports);
        
        // Find the job
        const foundJob = jobs?.find(j => j.id === jobId);
        
        // Find the report
        const foundReport = reports?.find(r => r.id === reportId);
        
        // If job not found but report is found, we can still display some report data
        if (!foundJob && foundReport) {
          setError("Job not found, but report is available");
          setReport(foundReport);
          setIsLoading(false);
          return;
        }
        
        // If report not found, show error
        if (!foundReport) {
          setError("Report not found");
          setIsLoading(false);
          return;
        }
        
        console.log("Found report:", foundReport);
        if (foundJob) {
          console.log("Found job:", foundJob);
          setJob(foundJob);
        }
        
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
    if (!report) {
      toast.error("Cannot export: Report data missing");
      return;
    }
    
    if (!job) {
      toast.error("Cannot export: Job data missing");
      return;
    }
    
    try {
      exportReportToCSV(job, report.candidateIds);
      toast.success("Report exported to CSV successfully");
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast.error("Failed to export report to CSV");
    }
  };

  if (isLoading) {
    return <PageLoading message="Loading report..." />;
  }

  if (error && !report) {
    return (
      <ErrorPage 
        title="Report Not Available"
        message={error || "The requested report could not be found"}
        showHomeButton={true}
        showRefreshButton={false}
      />
    );
  }

  // We have a report but no job
  if (!job && report) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col space-y-4 items-center justify-center">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 w-full">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  The job associated with this report is no longer available. Some report features may be limited.
                </p>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold">{report.title}</h1>
          <p className="text-gray-500">Created on {new Date(report.createdAt || Date.now()).toLocaleDateString()}</p>
          
          <div className="w-full mt-8">
            <ReportContent content={report.content || ''} />
          </div>
          
          <div className="flex space-x-4 mt-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Both job and report available - render full UI
  // Safety check for candidateIds - ensure it's an array
  const candidateIds = Array.isArray(report?.candidateIds) ? report?.candidateIds : [];
  
  // Get candidates included in report (if job is available)
  const reportCandidates = job?.candidates?.filter(c => 
    candidateIds.includes(c.id)
  ) || [];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Button 
        variant="ghost" 
        asChild 
        className="mb-6"
      >
        <Link to={job ? `/jobs/${jobId}` : '/dashboard'} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {job ? 'Back to Job Details' : 'Back to Dashboard'}
        </Link>
      </Button>
      
      <ReportHeader 
        job={job} 
        report={report} 
        onExportCSV={job ? handleExportCSV : undefined} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {report && (
            <ReportMetrics 
              report={report} 
              candidateCount={candidateIds.length || 0} 
            />
          )}
          
          {job && reportCandidates.length > 0 && (
            <ReportScoreMatrix 
              candidates={reportCandidates} 
              requirements={job.requirements}
            />
          )}
          
          {job && (
            <ReportCandidates 
              job={job} 
              candidateIds={candidateIds} 
            />
          )}
          
          <ReportContent content={report?.content || ''} />
        </div>
        
        <div className="space-y-6">
          {report && jobId && (
            <ReportShareWidget 
              reportId={report.id} 
              jobId={jobId} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewReport;
