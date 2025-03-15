
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { Candidate } from '@/types/job.types';

interface CandidateSelectionProps {
  candidates: Candidate[];
  selectedCandidates: Set<string>;
  selectionMode: 'all' | 'starred' | 'custom';
  onCandidateToggle: (id: string) => void;
  onSelectAll: () => void;
  onSelectStarred: () => void;
}

const CandidateSelection = ({
  candidates,
  selectedCandidates,
  selectionMode,
  onCandidateToggle,
  onSelectAll,
  onSelectStarred
}: CandidateSelectionProps) => {
  const processedCandidates = candidates.filter(c => c.scores.length > 0);
  const starredProcessedCandidates = processedCandidates.filter(c => c.isStarred);

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Candidate Selection</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge
          variant={selectionMode === 'all' ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1"
          onClick={onSelectAll}
        >
          All Processed ({processedCandidates.length})
        </Badge>
        <Badge
          variant={selectionMode === 'starred' ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1"
          onClick={onSelectStarred}
        >
          <Star className="h-3 w-3 mr-1 fill-current" />
          Starred ({starredProcessedCandidates.length})
        </Badge>
        <Badge
          variant={selectionMode === 'custom' ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1"
        >
          Custom ({selectedCandidates.size})
        </Badge>
      </div>
      
      <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
        {processedCandidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No processed candidates available
          </p>
        ) : (
          <div className="space-y-3">
            {processedCandidates.map(candidate => (
              <div key={candidate.id} className="flex items-center space-x-2">
                <Checkbox
                  id={candidate.id}
                  checked={selectedCandidates.has(candidate.id)}
                  onCheckedChange={() => onCandidateToggle(candidate.id)}
                />
                <div className="flex items-center">
                  <Label
                    htmlFor={candidate.id}
                    className="flex items-center cursor-pointer"
                  >
                    {candidate.name}
                  </Label>
                  {candidate.isStarred && (
                    <Star className="h-3 w-3 ml-2 text-yellow-500 fill-current" />
                  )}
                  <Badge
                    variant="outline"
                    className="ml-2"
                  >
                    {candidate.overallScore.toFixed(1)}/10
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateSelection;
