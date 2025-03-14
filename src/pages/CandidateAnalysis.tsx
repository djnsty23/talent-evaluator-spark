
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { Job, Candidate } from '@/contexts/JobContext';

// Import refactored components
import JobRequirementsSummary from '@/components/JobRequirementsSummary';
import CandidateFilter from '@/components/CandidateFilter';
import ProcessingStatus from '@/components/ProcessingStatus';
import CandidateCarousel from '@/components/CandidateCarousel';
import EmptyCandidatesState from '@/components/EmptyCandidatesState';

const CandidateAnalysis = () => {
  const { jobId, candidateId } = useParams<{ jobId: string; candidateId?: string }>();
  const { jobs, isLoading, processCandidate, handleProcessAllCandidates, starCandidate, deleteCandidate } = useJob();
  const [job, setJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingCandidateIds, setProcessingCandidateIds] = useState<string[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [filter, setFilter] = useState<'all' | 'starred' | 'processed' | 'unprocessed'>('all');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (jobId && jobs) {
      const foundJob = jobs.find(j => j.id === jobId);
      if (foundJob) {
        setJob(foundJob);
        
        // If we have a candidateId, filter to show only that candidate
        if (candidateId) {
          const candidate = foundJob.candidates.find(c => c.id === candidateId);
          if (candidate) {
            setFilteredCandidates([candidate]);
          } else {
            // Candidate not found, redirect to analysis page
            navigate(`/jobs/${jobId}/analysis`);
          }
        }
      } else {
        // Job not found, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [jobId, candidateId, jobs, navigate]);

  useEffect(() => {
    if (job && !candidateId) {
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
  }, [job, searchQuery, filter, candidateId]);

  const handleProcessCandidate = async (candidateId: string) => {
    if (!jobId) return;
    
    setProcessingCandidateIds(prev => [...prev, candidateId]);
    try {
      await processCandidate(jobId, candidateId);
      toast.success('Candidate processed successfully');
    } catch (error) {
      console.error('Process error:', error);
      toast.error('Failed to process candidate');
    } finally {
      setProcessingCandidateIds(prev => prev.filter(id => id !== candidateId));
    }
  };

  const handleProcessAllCandidatesClick = async () => {
    if (!jobId || !job) return;
    
    const unprocessedCandidates = job.candidates.filter(c => c.scores.length === 0);
    if (unprocessedCandidates.length === 0) {
      toast.info("No unprocessed candidates found");
      return;
    }
    
    // Set state to show we're processing all candidates
    setIsProcessingAll(true);
    setTotalToProcess(unprocessedCandidates.length);
    setProcessingProgress(0);
    
    try {
      // Start an interval to show progress animation
      const updateProgressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev < 95) {
            return prev + 5;
          }
          return prev;
        });
      }, 1000);
      
      // Process all candidates using the JobContext function
      await handleProcessAllCandidates(jobId);
      
      clearInterval(updateProgressInterval);
      setProcessingProgress(100);
      
      // Delay to show 100% completion
      setTimeout(() => {
        setIsProcessingAll(false);
        setCurrentProcessing('');
      }, 1500);
      
    } catch (error) {
      console.error('Batch process error:', error);
      toast.error('An error occurred during batch processing');
      setIsProcessingAll(false);
      setCurrentProcessing('');
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
          <h1 className="text-3xl font-bold">
            {candidateId ? 'Candidate Details' : 'Candidate Analysis'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {job.title} at {job.company}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          {unprocessedCount > 0 && !isProcessingAll && (
            <Button 
              onClick={handleProcessAllCandidatesClick}
              disabled={isProcessingAll || processingCandidateIds.length > 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Process All ({unprocessedCount})
            </Button>
          )}
          
          <ProcessingStatus 
            isProcessingAll={isProcessingAll}
            processingProgress={processingProgress}
            currentProcessing={currentProcessing}
            totalToProcess={totalToProcess}
          />
          
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
      <JobRequirementsSummary 
        jobId={jobId || ''} 
        requirements={job.requirements} 
      />
      
      {job.candidates.length === 0 ? (
        <EmptyCandidatesState jobId={jobId || ''} />
      ) : (
        <>
          {!candidateId && (
            <CandidateFilter
              totalCandidates={job.candidates.length}
              processedCount={processedCount}
              unprocessedCount={unprocessedCount}
              starredCount={starredCount}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filter={filter}
              onFilterChange={setFilter}
            />
          )}
          
          <CandidateCarousel
            candidates={filteredCandidates}
            requirements={job.requirements}
            processingCandidateIds={processingCandidateIds}
            onStar={handleStarCandidate}
            onProcess={handleProcessCandidate}
            onDelete={handleDeleteCandidate}
          />
        </>
      )}
    </div>
  );
};

export default CandidateAnalysis;
