
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Job, Candidate, JobRequirement } from '@/contexts/JobContext';
import { ArrowLeft, Search, Filter, FileText, Info, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import CandidateCard from '@/components/CandidateCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';

const CandidateAnalysis = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, isLoading, processCandidate, starCandidate, deleteCandidate } = useJob();
  const [job, setJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingCandidateIds, setProcessingCandidateIds] = useState<string[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [filter, setFilter] = useState<'all' | 'starred' | 'processed' | 'unprocessed'>('all');
  const [showRequirements, setShowRequirements] = useState(false);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
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
    if (job) {
      let candidates = [...job.candidates];
      
      // Apply filter
      if (filter === 'starred') {
        candidates = candidates.filter(c => c.isStarred);
      } else if (filter === 'processed') {
        candidates = candidates.filter(c => c.scores.length > 0);
      } else if (filter === 'unprocessed') {
        candidates = candidates.filter(c => c.scores.length === 0);
      }
      
      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        candidates = candidates.filter(c => 
          c.name.toLowerCase().includes(query) ||
          c.strengths.some(s => s.toLowerCase().includes(query)) ||
          c.weaknesses.some(w => w.toLowerCase().includes(query))
        );
      }
      
      // Sort by score (highest first)
      candidates.sort((a, b) => b.overallScore - a.overallScore);
      
      setFilteredCandidates(candidates);
    }
  }, [job, searchQuery, filter]);

  const handleProcessCandidate = async (candidateId: string) => {
    if (!jobId) return;
    
    setProcessingCandidateIds(prev => [...prev, candidateId]);
    try {
      await processCandidate(jobId, candidateId);
    } catch (error) {
      console.error('Process error:', error);
    } finally {
      setProcessingCandidateIds(prev => prev.filter(id => id !== candidateId));
    }
  };

  const handleProcessAllCandidates = async () => {
    if (!jobId || !job) return;
    
    const unprocessedCandidates = job.candidates.filter(c => c.scores.length === 0);
    if (unprocessedCandidates.length === 0) {
      toast.info("No unprocessed candidates found");
      return;
    }
    
    // Set state to show we're processing all candidates
    setIsProcessingAll(true);
    
    try {
      // Process each unprocessed candidate sequentially
      for (const candidate of unprocessedCandidates) {
        setProcessingCandidateIds(prev => [...prev, candidate.id]);
        
        try {
          await processCandidate(jobId, candidate.id);
        } catch (error) {
          console.error(`Error processing candidate ${candidate.name}:`, error);
        }
        
        setProcessingCandidateIds(prev => prev.filter(id => id !== candidate.id));
        
        // Small delay between processing candidates to avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      toast.success(`Processed ${unprocessedCandidates.length} candidates successfully`);
    } catch (error) {
      console.error('Batch process error:', error);
      toast.error('An error occurred during batch processing');
    } finally {
      setIsProcessingAll(false);
      setProcessingCandidateIds([]);
    }
  };

  const handleStarCandidate = async (candidateId: string, isStarred: boolean) => {
    if (!jobId) return;
    
    try {
      await starCandidate(jobId, candidateId, isStarred);
    } catch (error) {
      console.error('Star error:', error);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!jobId) return;
    
    try {
      await deleteCandidate(jobId, candidateId);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'starred' | 'processed' | 'unprocessed') => {
    setFilter(newFilter);
  };

  // Format weight for display
  const formatWeight = (weight: number) => {
    if (weight >= 9) return "Critical";
    if (weight >= 7) return "High";
    if (weight >= 5) return "Medium";
    if (weight >= 3) return "Low";
    return "Optional";
  };

  // Get weight class for styling
  const getWeightClass = (weight: number) => {
    if (weight >= 9) return "text-red-500";
    if (weight >= 7) return "text-orange-500";
    if (weight >= 5) return "text-blue-500";
    if (weight >= 3) return "text-green-500";
    return "text-gray-500";
  };

  if (isLoading || !job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="h-12 bg-muted rounded w-2/3 mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Count unprocessed candidates
  const unprocessedCount = job.candidates.filter(c => c.scores.length === 0).length;
  const processedCount = job.candidates.filter(c => c.scores.length > 0).length;
  const starredCount = job.candidates.filter(c => c.isStarred).length;

  return (
    <div className="container mx-auto px-4 py-8">
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
          <h1 className="text-3xl font-bold">Candidate Analysis</h1>
          <p className="text-muted-foreground mt-1">
            {job.title} at {job.company}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          {unprocessedCount > 0 && (
            <Button 
              onClick={handleProcessAllCandidates}
              disabled={isProcessingAll || processingCandidateIds.length > 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isProcessingAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Process All ({unprocessedCount})
                </>
              )}
            </Button>
          )}
          
          <Button 
            onClick={() => navigate(`/jobs/${jobId}/report`)}
            disabled={job.candidates.length === 0 || processedCount === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
      
      {/* Requirements Summary */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            Job Requirements
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2 p-0 h-auto">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Requirements and their importance for this job</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowRequirements(!showRequirements)}
            >
              {showRequirements ? 'Hide Details' : 'Show Details'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/jobs/${jobId}/requirements`)}
            >
              Edit Requirements
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className={showRequirements ? "pt-6" : "py-4"}>
            {!showRequirements && (
              <div className="text-sm text-muted-foreground">
                {job.requirements.length === 0 ? (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>No requirements defined yet. Click 'Edit Requirements' to add job requirements.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>This job has {job.requirements.length} defined requirements. Click 'Show Details' to view them.</span>
                  </div>
                )}
              </div>
            )}
            
            {showRequirements && (
              <>
                {job.requirements.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No requirements defined for this job yet.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigate(`/jobs/${jobId}/requirements`)}
                    >
                      Add Requirements
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 font-medium text-sm pb-2 border-b">
                      <div className="col-span-5">Requirement</div>
                      <div className="col-span-3">Category</div>
                      <div className="col-span-2">Importance</div>
                      <div className="col-span-2 text-center">Required</div>
                    </div>
                    
                    {job.requirements.map((req: JobRequirement) => (
                      <div key={req.id} className="grid grid-cols-12 text-sm py-2 border-b border-gray-100 last:border-0">
                        <div className="col-span-5">{req.description}</div>
                        <div className="col-span-3">{req.category}</div>
                        <div className={`col-span-2 ${getWeightClass(req.weight)}`}>
                          {formatWeight(req.weight)} ({req.weight}/10)
                        </div>
                        <div className="col-span-2 text-center">
                          {req.isRequired ? (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Optional</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {job.candidates.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12">
          <div className="text-muted-foreground mb-4">
            <FileText className="h-16 w-16" />
          </div>
          <h2 className="text-xl font-medium mb-2">No candidates found</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            You haven't uploaded any candidates for this job yet. Upload candidate resumes to see the analysis.
          </p>
          <Button 
            onClick={() => navigate(`/jobs/${jobId}/upload`)}
          >
            Upload Candidates
          </Button>
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex overflow-x-auto gap-2 pb-1">
              <Badge
                variant={filter === 'all' ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1 h-9"
                onClick={() => handleFilterChange('all')}
              >
                All ({job.candidates.length})
              </Badge>
              <Badge
                variant={filter === 'starred' ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1 h-9"
                onClick={() => handleFilterChange('starred')}
              >
                Starred ({starredCount})
              </Badge>
              <Badge
                variant={filter === 'processed' ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1 h-9"
                onClick={() => handleFilterChange('processed')}
              >
                Processed ({processedCount})
              </Badge>
              <Badge
                variant={filter === 'unprocessed' ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1 h-9"
                onClick={() => handleFilterChange('unprocessed')}
              >
                Unprocessed ({unprocessedCount})
              </Badge>
            </div>
          </div>
          
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No candidates match your filter</h3>
              <p className="text-muted-foreground">
                Try changing your search query or filter criteria
              </p>
            </div>
          ) : (
            <div className="relative py-4">
              <Carousel 
                className="w-full"
                opts={{
                  align: "start",
                }}
              >
                <CarouselContent>
                  {filteredCandidates.map((candidate, index) => (
                    <CarouselItem key={candidate.id} className="md:basis-1/2 lg:basis-1/2 xl:basis-1/3 pl-4 pr-4">
                      <div className="p-1">
                        <CandidateCard
                          candidate={candidate}
                          requirements={job.requirements}
                          onStar={(isStarred) => handleStarCandidate(candidate.id, isStarred)}
                          onProcess={() => handleProcessCandidate(candidate.id)}
                          onDelete={() => handleDeleteCandidate(candidate.id)}
                          isProcessing={processingCandidateIds.includes(candidate.id)}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CandidateAnalysis;
