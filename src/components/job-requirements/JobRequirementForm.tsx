
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { JobRequirement } from '@/types/job.types';

interface JobRequirementFormProps {
  requirement: JobRequirement;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof JobRequirement, value: any) => void;
}

// Predefined categories for job requirements
export const REQUIREMENT_CATEGORIES = [
  'Skills',
  'Experience',
  'Education',
  'Technical',
  'Soft Skills',
  'Language',
  'Certification',
  'Tools',
  'Knowledge',
  'Attitude',
  'Other'
];

const JobRequirementForm = ({ requirement, onRemove, onChange }: JobRequirementFormProps) => {
  const handleInputChange = (field: keyof JobRequirement, value: any) => {
    onChange(requirement.id, field, value);
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-3 border rounded-md bg-white dark:bg-gray-950">
      <div className="col-span-3">
        <Select
          value={requirement.category || ''}
          onValueChange={(value) => handleInputChange('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {REQUIREMENT_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="col-span-5">
        <Input
          value={requirement.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Requirement description"
          className="w-full"
        />
      </div>
      
      <div className="col-span-2">
        <Input
          type="number"
          min="1"
          max="10"
          value={requirement.weight}
          onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
          placeholder="Weight"
          className="w-full"
        />
      </div>
      
      <div className="col-span-1 flex justify-center items-center">
        <Switch
          checked={requirement.isRequired}
          onCheckedChange={(checked) => handleInputChange('isRequired', checked)}
        />
      </div>
      
      <div className="col-span-1 flex justify-center items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(requirement.id)}
          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default JobRequirementForm;
