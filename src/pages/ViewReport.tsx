
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Job, Report } from '@/contexts/JobContext';
import { ArrowLeft, Download, FileText, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CandidateScoreTable from '@/components/reports/CandidateScoreTable';

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
    
    // Get the candidates included in the report
    const candidates = job.candidates.filter(c => report.candidateIds.includes(c.id));
    
    // Create CSV header row with requirement descriptions
    let csvContent = "Candidate Name,";
    job.requirements.forEach(req => {
      csvContent += `"${req.description}",`;
    });
    csvContent += "Overall Score\n";
    
    // Add candidate data rows
    candidates.forEach(candidate => {
      csvContent += `"${candidate.name}",`;
      
      // Add scores for each requirement
      job.requirements.forEach(req => {
        const score = candidate.scores.find(s => s.requirementId === req.id);
        csvContent += `${score ? score.score : "N/A"},`;
      });
      
      // Add overall score
      csvContent += `${candidate.overallScore}\n`;
    });
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${job.title}_Candidate_Scores_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!job || !report) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="h-12 bg-muted rounded w-2/3 mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
          
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // Get candidates included in report
  const reportCandidates = job.candidates.filter(c => report.candidateIds.includes(c.id));

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Button 
        variant="ghost" 
        asChild 
        className="mb-6"
      >
        <Link to={`/jobs/${jobId}`} className="flex items-center gap-2">
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
          onClick={handleExportCSV}
          className="mt-4 md:mt-0"
        >
          <Download className="h-4 w-4 mr-2" />
          Export as CSV
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="text-sm font-medium">Generated</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(report.createdAt), 'PPP')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="text-sm font-medium">Candidates</p>
                <p className="text-xs text-muted-foreground">
                  {report.candidateIds.length} included
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="text-sm font-medium">Report Type</p>
                <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                  {report.additionalPrompt 
                    ? `Custom Analysis: ${report.additionalPrompt.substring(0, 50)}${report.additionalPrompt.length > 50 ? '...' : ''}`
                    : 'Standard Candidate Ranking Analysis'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Candidate Comparison Matrix</CardTitle>
          <CardDescription>
            Scores of each candidate against job requirements (scale: 1-10)
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <CandidateScoreTable 
            candidates={reportCandidates}
            requirements={job.requirements}
          />
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Candidates Included</CardTitle>
          <CardDescription>
            This report includes analysis for the following candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {report.candidateIds.map(candidateId => {
              const candidate = job.candidates.find(c => c.id === candidateId);
              if (!candidate) return null;
              
              return (
                <Badge key={candidateId} variant="secondary" className="px-3 py-1">
                  {candidate.name}
                  {candidate.isStarred && (
                    <span className="ml-1 text-yellow-500">★</span>
                  )}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Full Report</CardTitle>
          <CardDescription>
            Detailed ranking and analysis of selected candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{report.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewReport;
