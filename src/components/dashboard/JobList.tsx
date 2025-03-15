
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Job } from '@/types/job.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Building, 
  User, 
  Calendar, 
  ArrowUp, 
  ArrowDown,
  FilePlus2
} from 'lucide-react';
import { format } from 'date-fns';

interface JobListProps {
  jobs: Job[];
}

type SortOption = 'newest' | 'oldest' | 'candidates' | 'company';

const JobList = ({ jobs }: JobListProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Handle job filtering by search term
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle job sorting
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'candidates':
        return b.candidates.length - a.candidates.length;
      case 'company':
        return a.company.localeCompare(b.company);
      default:
        return 0;
    }
  });
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="candidates">Most Candidates</SelectItem>
              <SelectItem value="company">Company Name</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => navigate('/jobs/create')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        </div>
      </div>
      
      {sortedJobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {sortedJobs.map(job => (
            <Link to={`/jobs/${job.id}`} key={job.id} className="block group">
              <Card className="transition-all hover:shadow-md hover:border-primary/20">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center mt-1 text-muted-foreground">
                        <Building className="h-3.5 w-3.5 mr-1" />
                        <span className="text-sm">{job.company}</span>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>Created {format(new Date(job.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {job.candidates.length} candidates
                        </Badge>
                      </div>
                      
                      {job.candidates.length === 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/jobs/${job.id}/upload`);
                          }}
                          className="flex items-center gap-1"
                        >
                          <FilePlus2 className="h-3.5 w-3.5" />
                          Upload Candidates
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No jobs found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? `No jobs matching "${searchTerm}"` 
              : "You haven't created any jobs yet"}
          </p>
          <Button onClick={() => navigate('/jobs/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Job
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobList;
