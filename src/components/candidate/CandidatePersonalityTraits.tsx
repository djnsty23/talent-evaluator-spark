
import React from 'react';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CandidatePersonalityTraitsProps {
  personalityTraits: string[];
}

const CandidatePersonalityTraits = ({ personalityTraits }: CandidatePersonalityTraitsProps) => {
  if (!personalityTraits || personalityTraits.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2 flex items-center">
        <Users className="h-4 w-4 text-indigo-500 mr-1" />
        Personality Traits
      </h4>
      <div className="flex flex-wrap gap-2">
        {personalityTraits.map((trait, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {trait}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default CandidatePersonalityTraits;
