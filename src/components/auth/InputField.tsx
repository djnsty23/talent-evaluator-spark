
import React from 'react';
import { Input } from '@/components/ui/input';

interface InputFieldProps {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
}

const InputField = ({
  icon,
  type,
  placeholder,
  value,
  onChange,
  required = false,
  minLength,
}: InputFieldProps) => {
  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4">
          {icon}
        </div>
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pl-10"
          required={required}
          minLength={minLength}
        />
      </div>
    </div>
  );
};

export default InputField;
