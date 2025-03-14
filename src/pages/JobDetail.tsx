import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Job, JobRequirement } from '@/contexts/JobContext';
import { ArrowLeft, Upload, ChevronRight, Star, User, BarChart, FileText, Building } from 'lucide-react';

const JobDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, setCurrentJob } = useJob();
  const [job, setJob] = useState<Job | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (jobId && jobs) {
      const foundJob = jobs.find(j => j.id === jobId);
      if (foundJob) {
        setJob(foundJob);
        setCurrentJob(foundJob);
      } else {
        navigate('/dashboard');
      }
    }
  }, [jobId, jobs, navigate, setCurrentJob]);

  const handleUploadCandidates = () => {
    navigate(`/jobs/${jobId}/upload`);
  };

  const handleViewAnalysis = () => {
    navigate(`/jobs/${jobId}/analysis`);
  };

  const handleGenerateReport = () => {
    navigate(`/jobs/${jobId}/report`);
  };

  const renderRequirements = (requirements: JobRequirement[]) => {
    const categories = [...new Set(requirements.map(req => req.category))];
    
    return categories.map(category => (
      <div key={category} className="mb-6">
        <h3 className="text-lg font-medium mb-3">{category}</h3>
        <ul className="space-y-2">
          {requirements
            .filter(req => req.category === category)
            .map(req => (
              <li key={req.id} className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                  <div className="w-full h-full rounded-full border border-primary/30 flex items-center justify-center">
                    <div 
                      className="rounded-full bg-primary" 
                      style={{ width: '60%', height: '60%' }}
                    ></div>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{req.description}</span>
                    {req.isRequired && (
                      <Badge variant="outline" className="text-xs h-5 px-1.5 border-destructive/30 text-destructive">
                        Required
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                      Weight: {req.weight}/10
                    </Badge>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
    ));
  };

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="h-12 bg-muted rounded w-2/3 mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        <div>
          <Button 
            variant="ghost" 
            asChild 
            className="mb-4"
          >
            <Link to="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <div className="flex items-center mt-1 text-muted-foreground">
                <Building className="h-4 w-4 mr-1" />
                {job.company}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline"
                onClick={handleUploadCandidates}
                className="h-9"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Candidates
              </Button>
              
              <Button
                variant={job.candidates.length > 0 ? "default" : "outline"}
                onClick={handleViewAnalysis}
                disabled={job.candidates.length === 0}
                className="h-9"
              >
                <BarChart className="h-4 w-4 mr-2" />
                View Analysis
              </Button>
              
              <Button
                variant={job.candidates.length > 0 ? "default" : "outline"}
                onClick={handleGenerateReport}
                disabled={job.candidates.length === 0}
                className="h-9"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="requirements" className="flex-1">Requirements</TabsTrigger>
            <TabsTrigger value="candidates" className="flex-1">Candidates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{job.requirements.length}</div>
                  <p className="text-muted-foreground text-sm">
                    {job.requirements.filter(r => r.isRequired).length} required
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 w-full"
                    onClick={() => {
                      const element = document.querySelector('[data-value="requirements"]');
                      if (element) (element as HTMLElement).click();
                    }}
                  >
                    View Requirements
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Candidates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{job.candidates.length}</div>
                  <p className="text-muted-foreground text-sm">
                    {job.candidates.filter(c => c.isStarred).length} starred
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 w-full"
                    onClick={() => {
                      const element = document.querySelector('[data-value="candidates"]');
                      if (element) (element as HTMLElement).click();
                    }}
                  >
                    View Candidates
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-primary" />
                    Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">
                    {job.candidates.filter(c => c.scores.length > 0).length}/{job.candidates.length}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    candidates analyzed
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 w-full"
                    onClick={handleViewAnalysis}
                    disabled={job.candidates.length === 0}
                  >
                    View Analysis
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {job.description && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{job.description}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="requirements" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Requirements</CardTitle>
                <CardDescription>
                  The following requirements have been generated based on the job details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {job.requirements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No requirements generated</h3>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                      There are no requirements generated for this job yet.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[450px] pr-4">
                    {renderRequirements(job.requirements)}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="candidates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Candidates</CardTitle>
                <CardDescription>
                  {job.candidates.length} candidates have been uploaded for this job
                </CardDescription>
              </CardHeader>
              <CardContent>
                {job.candidates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No candidates uploaded</h3>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                      Upload candidate resumes to start analyzing and ranking candidates for this job.
                    </p>
                    <Button onClick={handleUploadCandidates}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Candidates
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[450px] pr-4">
                    <div className="space-y-4">
                      {job.candidates.map(candidate => (
                        <div 
                          key={candidate.id} 
                          className="flex items-start p-4 rounded-lg border border-border/60 hover:border-border hover:bg-accent/20 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-medium">{candidate.name}</h3>
                              {candidate.isStarred && (
                                <Star className="h-4 w-4 text-yellow-500 ml-2 fill-current" />
                              )}
                            </div>
                            {candidate.scores.length > 0 ? (
                              <div className="mt-2">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium mr-2">
                                    Score: {candidate.overallScore.toFixed(1)}/10
                                  </span>
                                  <div
                                    className={`px-2 py-0.5 text-xs rounded-full ${
                                      candidate.overallScore >= 8 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                        : candidate.overallScore >= 6 
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                                        : candidate.overallScore >= 4 
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}
                                  >
                                    {candidate.overallScore >= 8 
                                      ? 'Excellent' 
                                      : candidate.overallScore >= 6 
                                      ? 'Good' 
                                      : candidate.overallScore >= 4 
                                      ? 'Average' 
                                      : 'Poor'}
                                  </div>
                                </div>
                                
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {candidate.strengths.slice(0, 2).map((strength, index) => (
                                    <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900">
                                      {strength}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground mt-1">
                                Not yet processed
                              </p>
                            )}
                          </div>
                          
                          {candidate.resumeUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => window.open(candidate.resumeUrl, '_blank')}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Resume
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JobDetail;
