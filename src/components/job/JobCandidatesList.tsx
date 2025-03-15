
import { useState } from 'react';
import { Job } from '@/types/job.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import CandidateCard from '@/components/CandidateCard';
import EmptyCandidatesState from '@/components/EmptyCandidatesState';
import CandidateFilter from '@/components/CandidateFilter';
import { useCandidateFiltering } from '@/hooks/useCandidateFiltering';
import { useCandidateProcessing } from '@/hooks/candidate-processing';
import ProcessingStatus from '@/components/ProcessingStatus';
import ProcessAllCandidatesButton from '@/components/ProcessAllCandidatesButton';
import PostProcessingCTA from '@/components/candidate/PostProcessingCTA';
import ReportGenerationButton from '@/components/candidate/ReportGenerationButton';

interface JobCandidatesListProps {
  job: Job;
  handleUploadCandidates: () => void;
  handleAnalyzeCandidate: (candidateId: string) => void;
}

const JobCandidatesList = ({
  job,
  handleUploadCandidates,
  handleAnalyzeCandidate,
}: JobCandidatesListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter candidates
  const { filteredCandidates, filter, setFilter } = 
    useCandidateFiltering(job.candidates, searchTerm);
  
  // Candidate processing
  const {
    isProcessingAll,
    processingCandidateIds,
    showPostProcessCTA,
    processingProgress,
    currentProcessing,
    processedCountTracking,
    totalToProcess,
    errorCount,
    unprocessedCount,
    handleProcessCandidate,
    handleProcessAllCandidatesClick,
    cancelProcessing,
    setShowPostProcessCTA
  } = useCandidateProcessing(job.id, job);
  
  return (
    <div className="space-y-6">
      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <CandidateFilter 
            filter={filter}
            onFilterChange={setFilter}
            searchQuery={searchTerm}
            setSearchQuery={setSearchTerm}
            totalCandidates={job.candidates.length}
            starredCount={job.candidates.filter(c => c.isStarred).length}
            processedCount={job.candidates.filter(c => c.scores.length > 0).length}
            unprocessedCount={job.candidates.filter(c => c.scores.length === 0).length}
          />
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleUploadCandidates}
              className="flex items-center whitespace-nowrap"
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload More
            </Button>
            
            <ProcessAllCandidatesButton
              unprocessedCount={unprocessedCount}
              isProcessingAll={isProcessingAll}
              processingCandidateIds={processingCandidateIds}
              onProcessAll={() => {
                handleProcessAllCandidatesClick();
                return;
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Processing status */}
      <ProcessingStatus
        isProcessingAll={isProcessingAll}
        processingProgress={processingProgress}
        currentProcessing={currentProcessing}
        totalToProcess={totalToProcess}
        processedCount={processedCountTracking}
        errorCount={errorCount}
        onCancel={cancelProcessing}
      />
      
      {/* Post processing CTA */}
      {showPostProcessCTA && !isProcessingAll && (
        <div className="mb-6">
          <PostProcessingCTA
            jobId={job.id}
          />
        </div>
      )}
      
      {/* No candidates state */}
      {job.candidates.length === 0 ? (
        <EmptyCandidatesState jobId={job.id} />
      ) : (
        <>
          {/* No results from filter */}
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">No candidates found</h3>
              <p className="text-muted-foreground mt-1">
                Try changing your search or filter
              </p>
            </div>
          ) : (
            /* Candidate cards grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  jobId={job.id}
                  onClick={() => handleAnalyzeCandidate(candidate.id)}
                  onProcess={(e) => {
                    handleProcessCandidate(candidate.id, e);
                    return;
                  }}
                  isProcessing={processingCandidateIds.includes(candidate.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobCandidatesList;
