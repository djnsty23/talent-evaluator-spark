
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Job } from '@/contexts/JobContext';

// Import our components and hooks
import JobRequirementsSummary from '@/components/JobRequirementsSummary';
import CandidateFilter from '@/components/CandidateFilter';
import CandidateCarousel from '@/components/CandidateCarousel';
import EmptyCandidatesState from '@/components/EmptyCandidatesState';
import CandidateAnalysisNavigation from '@/components/CandidateAnalysisNavigation';
import CandidateAnalysisHeader from '@/components/CandidateAnalysisHeader';
import CandidateAnalysisActions from '@/components/CandidateAnalysisActions';
import CandidateAnalysisLoading from '@/components/CandidateAnalysisLoading';
import PostProcessingCTA from '@/components/candidate/PostProcessingCTA';
import ReportGenerationButton from '@/components/candidate/ReportGenerationButton';
import { useCandidateProcessing } from '@/hooks/useCandidateProcessing';
import { useCandidateFiltering } from '@/hooks/useCandidateFiltering';

const CandidateAnalysis = () => {
  const { jobId, candidateId } = useParams<{ jobId: string; candidateId?: string }>();
  const { jobs, isLoading, starCandidate, deleteCandidate } = useJob();
  const [job, setJob] = useState<Job | null>(null);
  const navigate = useNavigate();

  // Use our custom hooks
  const {
    searchQuery, setSearchQuery,
    filteredCandidates, filter, setFilter
  } = useCandidateFiltering(job, candidateId);

  const {
    processingCandidateIds,
    isProcessingAll,
    processingProgress,
    totalToProcess,
    processedCountTracking,
    errorCount,
    currentProcessing,
    showPostProcessCTA,
    handleProcessCandidate,
    handleProcessAllCandidatesClick
  } = useCandidateProcessing(jobId, job);

  useEffect(() => {
    if (jobId && jobs && jobs.length > 0) {
      const foundJob = jobs.find(j => j.id === jobId);
      if (foundJob) {
        setJob(foundJob);
        
        if (candidateId) {
          const candidate = foundJob.candidates.find(c => c.id === candidateId);
          if (candidate) {
            setJob(foundJob);
          } else {
            navigate(`/jobs/${jobId}/analysis`);
          }
        }
      } else {
        navigate('/dashboard');
      }
    }
  }, [jobId, candidateId, jobs, navigate]);

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

  const unprocessedCount = job.candidates.filter(c => c.scores.length === 0).length;
  const processedCandidatesCount = job.candidates.filter(c => c.scores.length > 0).length;
  const starredCount = job.candidates.filter(c => c.isStarred).length;

  return (
    <div className="container mx-auto px-4 py-8" id="job-candidates-container">
      <CandidateAnalysisNavigation jobId={jobId || ''} candidateId={candidateId} />
      
      <CandidateAnalysisHeader
        jobTitle={job.title}
        jobCompany={job.company}
        candidateId={candidateId}
        jobId={jobId || ''}
        candidatesCount={job.candidates.length}
        processedCount={processedCandidatesCount}
        isProcessingAll={isProcessingAll}
        processingProgress={processingProgress}
        currentProcessing={currentProcessing}
        totalToProcess={totalToProcess}
        processedCountTracking={processedCountTracking}
        errorCount={errorCount}
      />
      
      <JobRequirementsSummary 
        jobId={jobId || ''} 
        requirements={job.requirements} 
      />
      
      {job.candidates.length === 0 ? (
        <EmptyCandidatesState jobId={jobId || ''} />
      ) : (
        <>
          {!candidateId && (
            <>
              <CandidateFilter
                totalCandidates={job.candidates.length}
                processedCount={processedCandidatesCount}
                unprocessedCount={unprocessedCount}
                starredCount={starredCount}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filter={filter}
                onFilterChange={setFilter}
              />
              
              <PostProcessingCTA 
                jobId={jobId || ''} 
                processedCandidatesCount={processedCandidatesCount}
                show={showPostProcessCTA}
              />
            </>
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

          <ReportGenerationButton
            jobId={jobId || ''}
            processedCandidatesCount={processedCandidatesCount}
            candidateId={candidateId}
            showPostProcessCTA={showPostProcessCTA}
          />
        </>
      )}
    </div>
  );
};

export default CandidateAnalysis;
