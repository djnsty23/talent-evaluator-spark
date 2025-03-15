
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Job } from '@/types/job.types';
import { Building, Calendar, Users, Eye, PlusCircle, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { useJob } from '@/contexts/job/JobContext';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JobListProps {
  jobs: Job[];
}

const JobList = ({ jobs }: JobListProps) => {
  const navigate = useNavigate();
  const { deleteJob } = useJob();
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Clean up state when component unmounts or jobs change
  useEffect(() => {
    return () => {
      if (jobToDelete) {
        setJobToDelete(null);
      }
    };
  }, [jobs]); // Reset dialog when jobs array changes

  const handleDeleteJob = async (jobId: string) => {
    if (isDeleting) return; // Prevent multiple deletions
    
    setIsDeleting(true);
    console.log(`Starting deletion for job: ${jobId}`);
    
    try {
      await deleteJob(jobId);
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    } finally {
      setIsDeleting(false);
      setJobToDelete(null); // Always reset jobToDelete to ensure dialog is closed
    }
  };
  
  // Handle cancel deletion
  const handleCancelDelete = () => {
    console.log('Cancelling job deletion');
    setJobToDelete(null);
  };
  
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl truncate">{job.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/jobs/${job.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500" 
                      onClick={() => setJobToDelete(job.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Job
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <Eye className="h-4 w-4" />
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        <Card className="border-dashed bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer flex flex-col items-center justify-center p-6"
          onClick={() => navigate('/jobs/create')}
        >
          <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">Create New Job</h3>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Add a new job to your dashboard
          </p>
        </Card>
      </div>

      {/* Only render the dialog when jobToDelete is not null */}
      {jobToDelete && (
        <ConfirmDialog 
          isOpen={!!jobToDelete}
          title="Delete Job"
          description="Are you sure you want to delete this job? This will permanently remove the job and all associated candidates. This action cannot be undone."
          onConfirm={() => jobToDelete && handleDeleteJob(jobToDelete)}
          onCancel={handleCancelDelete}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
        />
      )}
    </>
  );
};

export default JobList;
