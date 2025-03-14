
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface CandidateFilterProps {
  totalCandidates: number;
  processedCount: number;
  unprocessedCount: number;
  starredCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: 'all' | 'starred' | 'processed' | 'unprocessed';
  onFilterChange: (filter: 'all' | 'starred' | 'processed' | 'unprocessed') => void;
}

const CandidateFilter = ({
  totalCandidates,
  processedCount,
  unprocessedCount,
  starredCount,
  searchQuery,
  setSearchQuery,
  filter,
  onFilterChange
}: CandidateFilterProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search candidates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex overflow-x-auto gap-2 pb-1">
        <Badge
          variant={filter === 'all' ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1 h-9"
          onClick={() => onFilterChange('all')}
        >
          All ({totalCandidates})
        </Badge>
        <Badge
          variant={filter === 'starred' ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1 h-9"
          onClick={() => onFilterChange('starred')}
        >
          Starred ({starredCount})
        </Badge>
        <Badge
          variant={filter === 'processed' ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1 h-9"
          onClick={() => onFilterChange('processed')}
        >
          Processed ({processedCount})
        </Badge>
        <Badge
          variant={filter === 'unprocessed' ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1 h-9"
          onClick={() => onFilterChange('unprocessed')}
        >
          Unprocessed ({unprocessedCount})
        </Badge>
      </div>
    </div>
  );
};

export default CandidateFilter;
