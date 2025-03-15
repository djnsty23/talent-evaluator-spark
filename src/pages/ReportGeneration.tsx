
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ArrowLeft, FileText, Settings, Loader2 } from 'lucide-react';
import CandidateSelection from '@/components/report/CandidateSelection';
import AdditionalPromptInput from '@/components/report/AdditionalPromptInput';
import ReportPreview from '@/components/report/ReportPreview';
import NoCandidatesMessage from '@/components/report/NoCandidatesMessage';

const ReportGeneration = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, isLoading, generateReport } = useJob();
  const [job, setJob] = useState<null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState<'all' | 'starred' | 'custom'>('all');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (jobId && jobs) {
      const foundJob = jobs.find(j => j.id === jobId);
      if (foundJob) {
        setJob(foundJob);
        
        // Initially select all processed candidates
        const processedCandidates = foundJob.candidates
          .filter(c => c.scores.length > 0)
          .map(c => c.id);
        setSelectedCandidates(new Set(processedCandidates));
      } else {
        // Job not found, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [jobId, jobs, navigate]);

  useEffect(() => {
    if (job) {
      // Update selected candidates based on selection mode
      if (selectionMode === 'all') {
        const processedCandidates = job.candidates
          .filter(c => c.scores.length > 0)
          .map(c => c.id);
        setSelectedCandidates(new Set(processedCandidates));
      } else if (selectionMode === 'starred') {
        const starredCandidates = job.candidates
          .filter(c => c.isStarred && c.scores.length > 0)
          .map(c => c.id);
        setSelectedCandidates(new Set(starredCandidates));
      }
      // For 'custom' mode, we leave the selection as is
    }
  }, [job, selectionMode]);

  const handleCandidateToggle = (candidateId: string) => {
    const newSelected = new Set(selectedCandidates);
    
    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId);
    } else {
      newSelected.add(candidateId);
    }
    
    setSelectedCandidates(newSelected);
    setSelectionMode('custom');
  };

  const handleGenerateReport = async () => {
    if (!jobId || !job || selectedCandidates.size === 0) return;
    
    setIsGenerating(true);
    
    try {
      const report = await generateReport(
        jobId, 
        Array.from(selectedCandidates),
        additionalPrompt || undefined
      );
      
      // Navigate to the report view page
      navigate(`/jobs/${jobId}/report/${report.id}`);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || !job) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="h-12 bg-muted rounded w-2/3 mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const processedCandidates = job.candidates.filter(c => c.scores.length > 0);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
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
          <h1 className="text-3xl font-bold">Generate Report</h1>
          <p className="text-muted-foreground mt-1">
            {job.title} at {job.company}
          </p>
        </div>
      </div>
      
      {processedCandidates.length === 0 ? (
        <NoCandidatesMessage 
          onGoToAnalysis={() => navigate(`/jobs/${jobId}/analysis`)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Report Settings</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select candidates to include in the report and customize report generation
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <CandidateSelection 
                  candidates={job.candidates}
                  selectedCandidates={selectedCandidates}
                  selectionMode={selectionMode}
                  onCandidateToggle={handleCandidateToggle}
                  onSelectAll={() => setSelectionMode('all')}
                  onSelectStarred={() => setSelectionMode('starred')}
                />
                
                <AdditionalPromptInput 
                  value={additionalPrompt}
                  onChange={setAdditionalPrompt}
                />
              </CardContent>
              
              <CardFooter>
                <Button
                  onClick={handleGenerateReport}
                  disabled={selectedCandidates.size === 0 || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <ReportPreview hasCustomInstructions={additionalPrompt.length > 0} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGeneration;
