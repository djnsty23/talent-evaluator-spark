
import { TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ScoreCellProps {
  score: number;
  isHighest: boolean;
  weight?: number;
}

const ScoreCell = ({ score, isHighest, weight = 1 }: ScoreCellProps) => {
  // Calculate the color based on the score value
  const getScoreColor = (value: number) => {
    if (value >= 8) return 'bg-green-500 dark:bg-green-400';
    if (value >= 5) return 'bg-blue-500 dark:bg-blue-400';
    if (value >= 3) return 'bg-yellow-500 dark:bg-yellow-400';
    return 'bg-red-500 dark:bg-red-400';
  };

  // Enhanced animation for the progress bar
  const scoreColor = getScoreColor(score);
  
  return (
    <TableCell 
      className={`${isHighest ? "font-semibold bg-green-50 dark:bg-green-900/20" : ""}`}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <div className="w-8 text-center font-medium">
                {score > 0 ? score : 'N/A'}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full ${scoreColor} transition-all duration-500 ease-out`}
                  style={{ 
                    width: `${score > 0 ? score * 10 : 0}%`,
                    boxShadow: isHighest ? '0 0 5px rgba(139, 92, 246, 0.5)' : 'none'
                  }}
                ></div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Score: {score > 0 ? `${score}/10` : 'N/A'}</p>
            {weight && weight !== 1 && <p>Requirement weight: {weight}</p>}
            {isHighest && <p className="text-green-500">Highest score</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
};

export default ScoreCell;
