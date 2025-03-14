
import { useState, useRef, useEffect } from 'react';
import { Filter, ChevronLeft, ChevronRight, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import CandidateCard from '@/components/CandidateCard';
import { Candidate, JobRequirement } from '@/contexts/JobContext';
import { useNavigate } from 'react-router-dom';

interface CandidateCarouselProps {
  candidates: Candidate[];
  requirements: JobRequirement[];
  processingCandidateIds: string[];
  onStar: (candidateId: string, isStarred: boolean) => void;
  onProcess: (candidateId: string) => void;
  onDelete: (candidateId: string) => void;
}

const CandidateCarousel = ({
  candidates,
  requirements,
  processingCandidateIds,
  onStar,
  onProcess,
  onDelete
}: CandidateCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [api, setApi] = useState<any>(null);
  const navigate = useNavigate();
  
  // Update active index when the API changes slide
  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setActiveIndex(api.selectedScrollSnap());
    };
    
    api.on('select', onSelect);
    
    // Initial position
    setActiveIndex(api.selectedScrollSnap());
    
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);
  
  // Helper function to get the current job ID from URL
  const getCurrentJobId = () => {
    const path = window.location.pathname;
    const pathParts = path.split('/');
    const jobsIndex = pathParts.findIndex(part => part === 'jobs');
    if (jobsIndex !== -1 && pathParts.length > jobsIndex + 1) {
      return pathParts[jobsIndex + 1];
    }
    return null;
  };

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No candidates match your filter</h3>
        <p className="text-muted-foreground mb-6">
          Try changing your search query or filter criteria
        </p>
        <div className="flex justify-center gap-3">
          <Button 
            onClick={() => navigate(`/jobs/${getCurrentJobId()}/upload`)}
            className="flex gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Candidates
          </Button>
          
          {getCurrentJobId() && (
            <Button 
              variant="outline"
              onClick={() => navigate(`/jobs/${getCurrentJobId()}/report`)}
              className="flex gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate Report
            </Button>
          )}
        </div>
      </div>
    );
  }

  const handleViewDetails = (candidateId: string) => {
    const jobId = getCurrentJobId();
    if (jobId) {
      navigate(`/jobs/${jobId}/candidates/${candidateId}`);
    }
  };

  const jobId = getCurrentJobId();

  return (
    <div className="relative py-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-medium">Candidates ({candidates.length})</h2>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/jobs/${getCurrentJobId()}/upload`)}
            className="flex gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload More
          </Button>
          
          {candidates.length > 1 && (
            <div className="text-sm text-muted-foreground flex items-center ml-2">
              Showing candidate {activeIndex + 1} of {candidates.length}
            </div>
          )}
        </div>
      </div>
      
      <Carousel 
        className="w-full"
        opts={{
          align: "start",
        }}
        setApi={setApi}
      >
        <CarouselContent>
          {candidates.map((candidate, index) => (
            <CarouselItem key={candidate.id} className="md:basis-1/2 lg:basis-1/2 xl:basis-1/3 pl-4 pr-4">
              <div className="p-1">
                <CandidateCard
                  candidate={candidate}
                  requirements={requirements}
                  onStar={(isStarred) => onStar(candidate.id, isStarred)}
                  onProcess={() => onProcess(candidate.id)}
                  onDelete={() => onDelete(candidate.id)}
                  isProcessing={processingCandidateIds.includes(candidate.id)}
                  onViewDetails={() => handleViewDetails(candidate.id)}
                  jobId={jobId || undefined}
                  allCandidatesData={candidates}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Custom, more visible carousel navigation */}
        <div className="flex justify-center gap-2 mt-4">
          <CarouselPrevious className="relative static transform-none" />
          <CarouselNext className="relative static transform-none" />
        </div>
      </Carousel>
      
      {/* Carousel navigation instructions */}
      <div className="text-center mt-4">
        {candidates.length > 1 && (
          <p className="text-sm text-muted-foreground mb-2">
            Use the arrows to navigate between candidates
          </p>
        )}
      </div>
    </div>
  );
};

export default CandidateCarousel;
