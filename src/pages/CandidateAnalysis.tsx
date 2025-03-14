
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { toast } from 'sonner';
import { Job, Candidate } from '@/contexts/JobContext';

// Import refactored components
import JobRequirementsSummary from '@/components/JobRequirementsSummary';
import CandidateFilter from '@/components/CandidateFilter';
import CandidateCarousel from '@/components/CandidateCarousel';
import EmptyCandidatesState from '@/components/EmptyCandidatesState';
import CandidateAnalysisNavigation from '@/components/CandidateAnalysisNavigation';
import CandidateAnalysisHeader from '@/components/CandidateAnalysisHeader';
import CandidateAnalysisActions from '@/components/CandidateAnalysisActions';
import CandidateAnalysisLoading from '@/components/CandidateAnalysisLoading';

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
      // Start progress animation
      const updateProgressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev < 95) {
            return prev + 5;
          }
          return prev;
        });
      }, 1000);
      
      // Use the JobContext function to process all candidates
      await handleProcessAllCandidates(jobId);
      
      // Clean up and show completion
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
    return <CandidateAnalysisLoading />;
  }

  // Count candidates by status
  const unprocessedCount = job?.candidates.filter(c => c.scores.length === 0).length || 0;
  const processedCount = job?.candidates.filter(c => c.scores.length > 0).length || 0;
  const starredCount = job?.candidates.filter(c => c.isStarred).length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <CandidateAnalysisNavigation jobId={jobId || ''} candidateId={candidateId} />
      
      <CandidateAnalysisHeader
        jobTitle={job.title}
        jobCompany={job.company}
        candidateId={candidateId}
        jobId={jobId || ''}
        candidatesCount={job.candidates.length}
        processedCount={processedCount}
        isProcessingAll={isProcessingAll}
        processingProgress={processingProgress}
        currentProcessing={currentProcessing}
        totalToProcess={totalToProcess}
      />
      
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
          
          <CandidateAnalysisActions
            jobId={jobId || ''}
            candidateId={candidateId}
            unprocessedCount={unprocessedCount}
            isProcessingAll={isProcessingAll}
            processingCandidateIds={processingCandidateIds}
            onProcessAll={handleProcessAllCandidatesClick}
          />
        </>
      )}
    </div>
  );
};

export default CandidateAnalysis;
