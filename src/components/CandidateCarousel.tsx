
import { useState, useRef } from 'react';
import { Filter, ChevronLeft, ChevronRight, User } from 'lucide-react';
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
  const carouselRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
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
        <p className="text-muted-foreground">
          Try changing your search query or filter criteria
        </p>
      </div>
    );
  }

  const handleViewDetails = (candidateId: string) => {
    const jobId = getCurrentJobId();
    if (jobId) {
      navigate(`/jobs/${jobId}/candidates/${candidateId}`);
    }
  };

  return (
    <div className="relative py-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-medium">Candidates ({candidates.length})</h2>
        
        {/* Add view options if needed */}
        <div className="flex gap-2">
          {candidates.length > 1 && (
            <div className="text-sm text-muted-foreground flex items-center">
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
        ref={carouselRef}
        onSelect={(api) => {
          if (api) {
            setActiveIndex(api.selectedScrollSnap());
          }
        }}
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
      <div className="text-center mt-4 flex flex-col md:flex-row justify-center items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Swipe or use arrows to view more candidates
        </p>
        
        {/* View all button for individual candidate views */}
        {candidates.length > 1 && candidates.length < 4 && getCurrentJobId() && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/jobs/${getCurrentJobId()}/analysis`)}
            className="ml-2"
          >
            <User className="h-4 w-4 mr-2" />
            View All Candidates
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateCarousel;
