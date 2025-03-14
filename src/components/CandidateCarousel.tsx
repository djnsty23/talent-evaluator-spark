
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import CandidateCard from '@/components/CandidateCard';
import { Candidate, JobRequirement } from '@/contexts/JobContext';

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

  return (
    <div className="relative py-4">
      <Carousel 
        className="w-full"
        opts={{
          align: "start",
        }}
      >
        <CarouselContent>
          {candidates.map((candidate) => (
            <CarouselItem key={candidate.id} className="md:basis-1/2 lg:basis-1/2 xl:basis-1/3 pl-4 pr-4">
              <div className="p-1">
                <CandidateCard
                  candidate={candidate}
                  requirements={requirements}
                  onStar={(isStarred) => onStar(candidate.id, isStarred)}
                  onProcess={() => onProcess(candidate.id)}
                  onDelete={() => onDelete(candidate.id)}
                  isProcessing={processingCandidateIds.includes(candidate.id)}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Custom, more visible carousel navigation */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md hover:bg-primary hover:text-primary-foreground"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md hover:bg-primary hover:text-primary-foreground"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </Carousel>
      
      {/* Carousel navigation instruction */}
      <div className="text-center mt-4 text-sm text-muted-foreground">
        <p>Swipe or use arrows to view more candidates</p>
      </div>
    </div>
  );
};

export default CandidateCarousel;
