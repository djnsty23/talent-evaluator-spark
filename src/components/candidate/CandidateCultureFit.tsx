
import React from 'react';
import { Zap, Award } from 'lucide-react';

interface CandidateCultureFitProps {
  cultureFit?: number;
  leadershipPotential?: number;
}

const CandidateCultureFit = ({ cultureFit, leadershipPotential }: CandidateCultureFitProps) => {
  // Ensure we have valid numbers between 0 and 10, default to 5 if undefined
  const normalizedCultureFit = typeof cultureFit === 'number' && !isNaN(cultureFit) 
    ? Math.max(0, Math.min(10, cultureFit)) 
    : 5;
  
  const normalizedLeadershipPotential = typeof leadershipPotential === 'number' && !isNaN(leadershipPotential)
    ? Math.max(0, Math.min(10, leadershipPotential))
    : 5;

  return (
    <div className="grid grid-cols-2 gap-4 mb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
      <div>
        <h4 className="text-sm font-medium mb-1 flex items-center">
          <Zap className="h-4 w-4 text-blue-500 mr-1" />
          Culture Fit
        </h4>
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${normalizedCultureFit * 10}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Culture Alignment</span>
          <span className="font-medium">{normalizedCultureFit.toFixed(1)}/10</span>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-1 flex items-center">
          <Award className="h-4 w-4 text-amber-500 mr-1" />
          Leadership Potential
        </h4>
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
          <div 
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${normalizedLeadershipPotential * 10}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Leadership</span>
          <span className="font-medium">{normalizedLeadershipPotential.toFixed(1)}/10</span>
        </div>
      </div>
    </div>
  );
};

export default CandidateCultureFit;
