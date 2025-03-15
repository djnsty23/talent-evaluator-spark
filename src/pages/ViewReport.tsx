
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
import ReportLoading from '@/components/reports/ReportLoading';

const ViewReport = () => {
  const { jobId, reportId } = useParams<{ jobId: string; reportId: string }>();
  const { jobs, reports } = useJob();
  const [job, setJob] = useState<Job | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (jobId && jobs) {
      const foundJob = jobs.find(j => j.id === jobId);
      if (foundJob) {
        setJob(foundJob);
      } else {
        // Job not found, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [jobId, jobs, navigate]);

  useEffect(() => {
    if (reportId && reports) {
      const foundReport = reports.find(r => r.id === reportId);
      if (foundReport) {
        setReport(foundReport);
      } else {
        // Report not found, redirect to job page
        navigate(`/jobs/${jobId}`);
      }
    }
  }, [reportId, reports, jobId, navigate]);

  const handleExportCSV = () => {
    if (!report || !job) return;
    exportReportToCSV(job, report.candidateIds);
  };

  if (!job || !report) {
    return <ReportLoading />;
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
  );
};

export default ViewReport;
