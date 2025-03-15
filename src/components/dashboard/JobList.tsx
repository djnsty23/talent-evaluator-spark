
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Job } from '@/types/job.types';
import { Building, Calendar, Users, Eye, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

interface JobListProps {
  jobs: Job[];
}

const JobList = ({ jobs }: JobListProps) => {
  const navigate = useNavigate();
  
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No jobs found</h3>
        <p className="text-muted-foreground mb-6">Create your first job to get started.</p>
        <Button 
          onClick={() => navigate('/jobs/create')}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Create Job
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobs.map((job) => (
        <Card key={job.id} className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl truncate">{job.title}</CardTitle>
            <CardDescription className="flex items-center">
              <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
              <span className="truncate">{job.company}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <span>Created {format(new Date(job.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                <span>{job.candidates.length} candidates</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="secondary" 
              className="w-full flex items-center justify-center gap-1.5"
              onClick={() => navigate(`/jobs/${job.id}`)} // Use navigate instead of href
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
      
      <Card className="border-dashed bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer flex flex-col items-center justify-center p-6"
        onClick={() => navigate('/jobs/create')} // Use navigate instead of href
      >
        <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">Create New Job</h3>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Add a new job to your dashboard
        </p>
      </Card>
    </div>
  );
};

export default JobList;
