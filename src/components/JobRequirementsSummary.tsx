
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { JobRequirement } from '@/contexts/JobContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, AlertTriangle, CheckCircle2, ListChecks, Upload } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface JobRequirementsSummaryProps {
  jobId: string;
  requirements: JobRequirement[];
}

const JobRequirementsSummary = ({ jobId, requirements }: JobRequirementsSummaryProps) => {
  // Always show requirements by default
  const [showRequirements, setShowRequirements] = useState(true);

  // Format weight for display
  const formatWeight = (weight: number) => {
    if (weight >= 9) return "Critical";
    if (weight >= 7) return "High";
    if (weight >= 5) return "Medium";
    if (weight >= 3) return "Low";
    return "Optional";
  };

  // Get weight class for styling
  const getWeightClass = (weight: number) => {
    if (weight >= 9) return "text-red-500";
    if (weight >= 7) return "text-orange-500";
    if (weight >= 5) return "text-blue-500";
    if (weight >= 3) return "text-green-500";
    return "text-gray-500";
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          Job Requirements
          <Badge variant="outline" className="ml-2">
            {requirements.length} requirements
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2 p-0 h-auto">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Requirements and their importance for this job</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowRequirements(!showRequirements)}
          >
            {showRequirements ? 'Hide Details' : 'Show Details'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            asChild
          >
            <Link to={`/jobs/${jobId}/requirements`}>Edit Requirements</Link>
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className={showRequirements ? "pt-6" : "py-4"}>
          {!showRequirements && (
            <div className="text-sm text-muted-foreground">
              {requirements.length === 0 ? (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>No requirements defined yet. Click 'Edit Requirements' to add job requirements.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>This job has {requirements.length} defined requirements. Click 'Show Details' to view them.</span>
                </div>
              )}
            </div>
          )}
          
          {showRequirements && (
            <>
              {requirements.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No requirements defined for this job yet.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    asChild
                  >
                    <Link to={`/jobs/${jobId}/requirements`}>Add Requirements</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 font-medium text-sm pb-2 border-b">
                    <div className="col-span-5">Requirement</div>
                    <div className="col-span-3">Category</div>
                    <div className="col-span-2">Importance</div>
                    <div className="col-span-2 text-center">Required</div>
                  </div>
                  
                  {requirements.map((req: JobRequirement) => (
                    <div key={req.id} className="grid grid-cols-12 text-sm py-2 border-b border-gray-100 last:border-0">
                      <div className="col-span-5">{req.description}</div>
                      <div className="col-span-3">{req.category}</div>
                      <div className={`col-span-2 ${getWeightClass(req.weight)}`}>
                        {formatWeight(req.weight)} ({req.weight}/10)
                      </div>
                      <div className="col-span-2 text-center">
                        {req.isRequired ? (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Optional</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobRequirementsSummary;
