
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, PencilLine, Upload, BarChart, Users } from 'lucide-react';
import { Job } from '@/types/job.types';

interface JobDetailHeaderProps {
  job: Job;
  handleEditRequirements: () => void;
  handleUploadCandidates: () => void;
  handleGenerateReport: () => void;
}

const JobDetailHeader = ({
  job,
  handleEditRequirements,
  handleUploadCandidates,
  handleGenerateReport
}: JobDetailHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <div className="flex items-center mt-1 text-muted-foreground">
              <Building className="h-4 w-4 mr-1" />
              <span>{job.company}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={handleEditRequirements}
            >
              <PencilLine className="h-4 w-4 mr-2" />
              Edit Requirements
            </Button>
            
            <Button
              variant="outline"
              onClick={handleUploadCandidates}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Candidates
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate(`/jobs/${job.id}/analysis`)}
            >
              <Users className="h-4 w-4 mr-2" />
              Candidate Analysis
            </Button>
            
            <Button
              onClick={handleGenerateReport}
              disabled={job.candidates.length === 0}
            >
              <BarChart className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default JobDetailHeader;
