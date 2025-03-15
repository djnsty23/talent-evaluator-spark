
import { v4 as uuidv4 } from 'uuid';
import { JobRequirement } from '@/types/job.types';

/**
 * Default requirements for a Customer Success role
 */
export const getDefaultCustomerSuccessRequirements = (): JobRequirement[] => {
  return [
    {
      id: uuidv4(), // Using proper UUID instead of "req_1"
      description: "Direct experience in customer success or a related role",
      weight: 5,
      category: "Experience",
      isRequired: true
    },
    {
      id: uuidv4(), // Using proper UUID instead of "req_2"
      description: "Experience working in SaaS and/or familiarity with A/B testing, experimentation, or CRO",
      weight: 4,
      category: "Technical", 
      isRequired: true
    },
    {
      id: uuidv4(), // Using proper UUID instead of "req_3"
      description: "Ability to analyze customer pain points, interpret data, and provide solutions",
      weight: 5,
      category: "Skills",
      isRequired: true
    },
    {
      id: uuidv4(), // Using proper UUID instead of "req_4"
      description: "Strong written/verbal communication and ability to build relationships",
      weight: 5,
      category: "Skills",
      isRequired: true
    },
    {
      id: uuidv4(), // Using proper UUID instead of "req_5"
      description: "Demonstrated taking initiative, driving product adoption, or improving processes",
      weight: 4,
      category: "Attitude",
      isRequired: false
    },
    {
      id: uuidv4(), // Using proper UUID instead of "req_6"
      description: "Comfort with tools like analytics platforms, CRMs, Hubspot, Google Analytics",
      weight: 3,
      category: "Technical",
      isRequired: false
    },
    {
      id: uuidv4(), // Using proper UUID instead of "req_7"
      description: "Professional level English communication skills",
      weight: 5,
      category: "Language",
      isRequired: true
    }
  ];
};
