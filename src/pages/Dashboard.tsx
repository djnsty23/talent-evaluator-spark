
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Briefcase, FileText, Trash2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const { jobs, isLoading, deleteJob, setCurrentJob } = useJob();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleCreateJob = () => {
    navigate('/jobs/create');
  };

  const handleViewJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setCurrentJob(job);
      navigate(`/jobs/${jobId}`);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    setIsDeleting(jobId);
    try {
      await deleteJob(jobId);
    } catch (error) {
      console.error('Error deleting job:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-7 bg-muted rounded mb-2 w-2/3"></div>
                <div className="h-5 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded mb-2 w-full"></div>
                <div className="h-4 bg-muted rounded mb-2 w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Jobs</h1>
          <p className="text-muted-foreground mt-1">Manage your job listings and candidates</p>
        </div>
        <Button onClick={handleCreateJob} className="mt-4 md:mt-0">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-center mb-2">No jobs yet</h3>
            <p className="text-muted-foreground text-center mb-6">Get started by creating your first job listing</p>
            <Button onClick={handleCreateJob}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <Card key={job.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="font-semibold">{job.title}</CardTitle>
                <CardDescription>{job.company}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{job.candidates.length} Candidates</span>
                </div>
                <p className="text-sm line-clamp-2">
                  {job.description || "No description provided"}
                </p>
                <div className="mt-4 text-xs text-muted-foreground">
                  Created: {format(new Date(job.createdAt), 'MMM d, yyyy')}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isDeleting === job.id}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this job and all associated candidate data.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteJob(job.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleViewJob(job.id)}
                >
                  View Details
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
