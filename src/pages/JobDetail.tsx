import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Job, JobRequirement } from '@/contexts/JobContext';
import { ArrowLeft, Upload, ChevronRight, Star, User, BarChart, FileText, Building, PencilLine, Sparkles, Loader2 } from 'lucide-react';
import { AIService } from '@/services/api';
import { toast } from 'sonner';
import OpenAIKeyInput from '@/components/OpenAIKeyInput';

const JobDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, setCurrentJob, updateJob } = useJob();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<Job | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    if (jobId) {
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
  
  const handleAnalyzeCandidate = (candidateId: string) => {
    navigate(`/jobs/${jobId}/candidates/${candidateId}`);
  };
  
  const handleGenerateReport = () => {
    navigate(`/jobs/${jobId}/reports/new`);
  };

  const handleEditRequirements = () => {
    navigate(`/jobs/${jobId}/requirements/edit`);
  };

  const handleGenerateRequirements = async () => {
    if (!window.openAIKey) {
      toast.error('Please set your OpenAI API key first');
      return;
    }

    if (!job) return;
    
    // If we already have requirements, confirm before replacing
    if (job.requirements.length > 0) {
      const confirmed = window.confirm(
        'This will replace your existing requirements. Continue?'
      );
      
      if (!confirmed) {
        return;
      }
    }
    
    setIsGenerating(true);
    
    try {
      const result = await AIService.generateRequirements({
        jobInfo: {
          title: job.title,
          company: job.company,
          description: job.description,
        }
      });
      
      const updatedJob = {
        ...job,
        requirements: result.requirements,
      };
      
      await updateJob(updatedJob);
      setJob(updatedJob);
      toast.success('Requirements generated successfully');
    } catch (error) {
      console.error('Error generating requirements:', error);
      toast.error('Failed to generate requirements');
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (!job) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }
  
  // Group requirements by category
  const groupedRequirements: Record<string, JobRequirement[]> = job.requirements.reduce((acc, requirement) => {
    if (!acc[requirement.category]) {
      acc[requirement.category] = [];
    }
    acc[requirement.category].push(requirement);
    return acc;
  }, {} as Record<string, JobRequirement[]>);
  
  return (
    <div className="container mx-auto p-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/dashboard')} 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <div className="flex items-center mt-1 text-muted-foreground">
                    <Building className="h-4 w-4 mr-1" />
                    <span>{job.company}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleEditRequirements}
                  >
                    <PencilLine className="h-4 w-4 mr-2" />
                    Edit Requirements
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleUploadCandidates}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Candidates
                  </Button>
                  <Button
                    onClick={handleGenerateReport}
                    disabled={job.candidates.length === 0}
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="lg:col-span-3">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="candidates">
              Candidates
              {job.candidates.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {job.candidates.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {job.description ? (
                    <p className="whitespace-pre-line">{job.description}</p>
                  ) : (
                    <p className="text-muted-foreground">No description provided</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  {job.requirements.length > 0 ? (
                    <ul className="space-y-2">
                      {job.requirements
                        .filter(req => req.isRequired)
                        .slice(0, 5)
                        .map(requirement => (
                          <li key={requirement.id} className="flex items-start">
                            <div className="w-1 h-1 rounded-full bg-primary mt-2 mr-2"></div>
                            <span>{requirement.description}</span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">No requirements defined yet</p>
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateRequirements}
                          disabled={isGenerating}
                          className="w-full"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 mr-2" />
                              Generate with AI
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const element = document.querySelector('[data-value="requirements"]');
                            if (element) (element as HTMLElement).click();
                          }}
                          className="w-full"
                        >
                          View Requirements
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                      <div className="mt-2">
                        <OpenAIKeyInput />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Candidates</CardTitle>
                </CardHeader>
                <CardContent>
                  {job.candidates.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {job.candidates.slice(0, 6).map(candidate => (
                        <Card key={candidate.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium truncate">{candidate.name}</h3>
                              {candidate.isStarred && (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              )}
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-4">
                              Score: {candidate.overallScore}/10
                            </div>
                            
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-full"
                              onClick={() => handleAnalyzeCandidate(candidate.id)}
                            >
                              <User className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">No candidates uploaded yet</p>
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="requirements">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Job Requirements</CardTitle>
                <div className="flex gap-2">
                  <OpenAIKeyInput />
                  <Button
                    variant="outline"
                    onClick={handleGenerateRequirements}
                    disabled={isGenerating}
                    className="gap-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleEditRequirements}
                  >
                    <PencilLine className="h-4 w-4 mr-2" />
                    Edit Requirements
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {Object.keys(groupedRequirements).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(groupedRequirements).map(([category, requirements]) => (
                      <div key={category}>
                        <h3 className="text-lg font-medium mb-3">{category}</h3>
                        <div className="space-y-2">
                          {requirements.map(requirement => (
                            <div 
                              key={requirement.id} 
                              className="p-3 border rounded-md flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span>{requirement.description}</span>
                                  {requirement.isRequired && (
                                    <Badge variant="outline" className="ml-2">Required</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4 text-right">
                                <span className="text-sm font-medium">
                                  Weight: {requirement.weight}/10
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No requirements defined yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Define requirements to help evaluate candidates
                    </p>
                    <div className="flex flex-col gap-2 max-w-xs mx-auto">
                      <Button 
                        onClick={handleGenerateRequirements}
                        disabled={isGenerating}
                        className="w-full"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate with AI
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleEditRequirements}
                        className="w-full"
                      >
                        <PencilLine className="h-4 w-4 mr-2" />
                        Add Manually
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="candidates">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Candidates</CardTitle>
                <Button onClick={handleUploadCandidates}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Candidates
                </Button>
              </CardHeader>
              <CardContent>
                {job.candidates.length > 0 ? (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {job.candidates.map(candidate => (
                        <Card key={candidate.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-medium text-lg">{candidate.name}</h3>
                                <div className="flex items-center mt-1">
                                  <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    Processed on {new Date(candidate.processedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                {candidate.isStarred && (
                                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-2" />
                                )}
                                <Badge className={`${
                                  candidate.overallScore >= 8 ? 'bg-green-100 text-green-800' : 
                                  candidate.overallScore >= 6 ? 'bg-blue-100 text-blue-800' : 
                                  candidate.overallScore >= 4 ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'
                                }`}>
                                  Score: {candidate.overallScore}/10
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="text-sm font-medium mb-2">Strengths</h4>
                                {candidate.strengths.length > 0 ? (
                                  <ul className="list-disc list-inside text-sm space-y-1">
                                    {candidate.strengths.slice(0, 3).map((strength, index) => (
                                      <li key={index} className="text-green-600">{strength}</li>
                                    ))}
                                    {candidate.strengths.length > 3 && (
                                      <li className="text-muted-foreground">
                                        +{candidate.strengths.length - 3} more
                                      </li>
                                    )}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted-foreground">None identified</p>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium mb-2">Areas for Improvement</h4>
                                {candidate.weaknesses.length > 0 ? (
                                  <ul className="list-disc list-inside text-sm space-y-1">
                                    {candidate.weaknesses.slice(0, 3).map((weakness, index) => (
                                      <li key={index} className="text-red-600">{weakness}</li>
                                    ))}
                                    {candidate.weaknesses.length > 3 && (
                                      <li className="text-muted-foreground">
                                        +{candidate.weaknesses.length - 3} more
                                      </li>
                                    )}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted-foreground">None identified</p>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => handleAnalyzeCandidate(candidate.id)}
                              className="w-full"
                            >
                              View Detailed Analysis
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No candidates uploaded yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Upload candidate resumes to start the evaluation process
                    </p>
                    <Button onClick={handleUploadCandidates}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Candidates
                    </Button>
                  </div>
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
