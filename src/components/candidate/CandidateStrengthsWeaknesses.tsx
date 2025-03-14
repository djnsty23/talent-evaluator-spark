
import React from 'react';
import { Trophy, AlertTriangle } from 'lucide-react';

interface CandidateStrengthsWeaknessesProps {
  strengths: string[];
  weaknesses: string[];
}

const CandidateStrengthsWeaknesses = ({ strengths, weaknesses }: CandidateStrengthsWeaknessesProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <h4 className="text-sm font-medium mb-1 flex items-center">
          <Trophy className="h-4 w-4 text-green-500 mr-1" />
          Strengths
        </h4>
        <ul className="text-sm">
          {strengths.length > 0 ? (
            strengths.map((strength, index) => (
              <li key={index} className="text-green-600 dark:text-green-400 flex items-start mb-1">
                <span className="bg-green-100 dark:bg-green-950/30 rounded-full p-1 mr-1 flex-shrink-0">
                  <svg className="w-2 h-2 fill-current" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                </span>
                <span className="text-gray-800 dark:text-gray-200">{strength}</span>
              </li>
            ))
          ) : (
            <li className="text-gray-500 dark:text-gray-400">No notable strengths identified</li>
          )}
        </ul>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-1 flex items-center">
          <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
          Areas for Development
        </h4>
        <ul className="text-sm">
          {weaknesses.length > 0 ? (
            weaknesses.map((weakness, index) => (
              <li key={index} className="text-red-600 dark:text-red-400 flex items-start mb-1">
                <span className="bg-red-100 dark:bg-red-950/30 rounded-full p-1 mr-1 flex-shrink-0">
                  <svg className="w-2 h-2 fill-current" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                </span>
                <span className="text-gray-800 dark:text-gray-200">{weakness}</span>
              </li>
            ))
          ) : (
            <li className="text-gray-500 dark:text-gray-400">No notable weaknesses identified</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CandidateStrengthsWeaknesses;
