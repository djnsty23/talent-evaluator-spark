
import React from 'react';
import { JobRequirement } from '@/types/job.types';
import JobRequirementForm from './JobRequirementForm';

interface RequirementsListProps {
  requirements: JobRequirement[];
  onRemoveRequirement: (id: string) => void;
  onRequirementChange: (id: string, field: keyof JobRequirement, value: any) => void;
}

const RequirementsList = ({ requirements, onRemoveRequirement, onRequirementChange }: RequirementsListProps) => {
  if (!requirements || requirements.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-md bg-muted/10">
        <p className="text-lg mb-2">No requirements yet</p>
        <p className="text-sm max-w-md mx-auto">
          Click 'Add Requirement' to create one manually 
          or use 'Generate with AI' to create them automatically from the job description.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-4 p-3 font-medium text-sm border-b">
        <div className="col-span-3">Category</div>
        <div className="col-span-5">Description</div>
        <div className="col-span-2">Weight (1-10)</div>
        <div className="col-span-1 text-center">Required</div>
        <div className="col-span-1"></div>
      </div>
      
      {requirements.map((req) => (
        <JobRequirementForm
          key={req.id}
          requirement={req}
          onRemove={onRemoveRequirement}
          onChange={onRequirementChange}
        />
      ))}
    </div>
  );
};

export default RequirementsList;
