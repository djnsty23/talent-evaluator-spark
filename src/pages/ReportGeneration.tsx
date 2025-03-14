
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Job, Candidate } from '@/contexts/JobContext';
import { ArrowLeft, FileText, Star, Settings, Loader2 } from 'lucide-react';

const ReportGeneration = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, isLoading, generateReport } = useJob();
  const [job, setJob] = useState<Job | null>(null);
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

  const handleSelectAll = () => {
    setSelectionMode('all');
  };

  const handleSelectStarred = () => {
    setSelectionMode('starred');
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
  const starredProcessedCandidates = processedCandidates.filter(c => c.isStarred);

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
        <Card className="flex flex-col items-center justify-center p-12">
          <div className="text-muted-foreground mb-4">
            <FileText className="h-16 w-16" />
          </div>
          <h2 className="text-xl font-medium mb-2">No processed candidates</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            You need to process at least one candidate before you can generate a report.
            Go to the analysis page to process your candidates.
          </p>
          <Button 
            onClick={() => navigate(`/jobs/${jobId}/analysis`)}
          >
            Go to Analysis
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle>Report Settings</CardTitle>
                </div>
                <CardDescription>
                  Select candidates to include in the report and customize report generation
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Candidate Selection</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge
                      variant={selectionMode === 'all' ? 'default' : 'outline'}
                      className="cursor-pointer px-3 py-1"
                      onClick={handleSelectAll}
                    >
                      All Processed ({processedCandidates.length})
                    </Badge>
                    <Badge
                      variant={selectionMode === 'starred' ? 'default' : 'outline'}
                      className="cursor-pointer px-3 py-1"
                      onClick={handleSelectStarred}
                    >
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Starred ({starredProcessedCandidates.length})
                    </Badge>
                    <Badge
                      variant={selectionMode === 'custom' ? 'default' : 'outline'}
                      className="cursor-pointer px-3 py-1"
                    >
                      Custom ({selectedCandidates.size})
                    </Badge>
                  </div>
                  
                  <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                    {processedCandidates.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No processed candidates available
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {processedCandidates.map(candidate => (
                          <div key={candidate.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={candidate.id}
                              checked={selectedCandidates.has(candidate.id)}
                              onCheckedChange={() => handleCandidateToggle(candidate.id)}
                            />
                            <div className="flex items-center">
                              <Label
                                htmlFor={candidate.id}
                                className="flex items-center cursor-pointer"
                              >
                                {candidate.name}
                              </Label>
                              {candidate.isStarred && (
                                <Star className="h-3 w-3 ml-2 text-yellow-500 fill-current" />
                              )}
                              <Badge
                                variant="outline"
                                className="ml-2"
                              >
                                {candidate.overallScore.toFixed(1)}/10
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Additional Prompt (Optional)</h3>
                  <Textarea
                    value={additionalPrompt}
                    onChange={(e) => setAdditionalPrompt(e.target.value)}
                    placeholder="e.g. Focus on leadership skills, exclude candidates without marketing experience..."
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Provide additional instructions to customize the report generation
                  </p>
                </div>
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
            <Card>
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>
                  What your report will include
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Job Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Basic job information including title, company, and description
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Requirements Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Overview of job requirements and their weights
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Candidate Ranking</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed ranking of selected candidates based on their scores
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Individual Assessments</h3>
                  <p className="text-sm text-muted-foreground">
                    Analysis of each candidate's strengths and weaknesses
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-generated hiring recommendations and next steps
                  </p>
                </div>
                
                {additionalPrompt && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Custom Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Additional analysis based on your custom instructions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGeneration;
