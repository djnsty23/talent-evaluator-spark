
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TableHead } from '@/components/ui/table';

interface SortableTableHeaderProps {
  title: string;
  sortKey: string;
  currentSort: {
    key: string;
    direction: 'ascending' | 'descending';
  } | null;
  onSort: (key: string) => void;
  className?: string;
  subtitle?: string;
  truncateAt?: number;
}

const SortableTableHeader = ({
  title,
  sortKey,
  currentSort,
  onSort,
  className = '',
  subtitle,
  truncateAt
}: SortableTableHeaderProps) => {
  const isSorted = currentSort?.key === sortKey;
  const direction = currentSort?.direction;
  
  const displayTitle = truncateAt && title.length > truncateAt
    ? title.substring(0, truncateAt) + '...'
    : title;

  return (
    <TableHead 
      className={`cursor-pointer ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex flex-col">
        <span>
          {displayTitle}
          {isSorted && (
            direction === 'ascending' 
              ? <ChevronUp className="h-4 w-4 inline-block ml-1" /> 
              : <ChevronDown className="h-4 w-4 inline-block ml-1" />
          )}
        </span>
        {subtitle && (
          <span className="text-xs text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
    </TableHead>
  );
};

export default SortableTableHeader;
