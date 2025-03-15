
import { Candidate, JobRequirement } from '@/types/job.types';
import { calculateMaxScores, calculateAverageScores } from './scoreUtils';

/**
 * Transforms candidate data into a format suitable for radar charts
 */
export const prepareRadarChartData = (
  candidates: Candidate[], 
  requirements: JobRequirement[]
) => {
  // Create data points for each requirement
  return requirements.map(req => {
    const dataPoint: { [key: string]: string | number } = {
      requirement: req.description.length > 15 
        ? req.description.substring(0, 15) + '...' 
        : req.description,
      fullName: req.description, // Store full name for tooltips
    };
    
    // Add a data point for each candidate
    candidates.forEach(candidate => {
      const score = candidate.scores.find(s => s.requirementId === req.id);
      dataPoint[candidate.name] = score ? score.score : 0;
    });
    
    return dataPoint;
  });
};

/**
 * Prepares data for a bar chart comparing candidates
 */
export const prepareBarChartData = (
  candidates: Candidate[]
) => {
  return candidates.map(candidate => {
    return {
      name: candidate.name,
      score: candidate.overallScore,
      isStarred: candidate.isStarred
    };
  }).sort((a, b) => b.score - a.score); // Sort by score descending
};

/**
 * Creates a configuration object for chart colors
 */
export const createChartConfig = (candidates: Candidate[]) => {
  const colors = [
    '#8B5CF6', // Vivid purple
    '#0EA5E9', // Ocean blue
    '#F97316', // Bright orange
    '#D946EF', // Magenta pink
    '#10B981', // Green
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#F59E0B', // Amber
    '#14B8A6', // Teal
    '#EF4444', // Red
  ];

  const config: { [key: string]: { color: string } } = {};
  
  // Assign colors to each candidate
  candidates.forEach((candidate, index) => {
    config[candidate.name] = {
      color: colors[index % colors.length]
    };
  });
  
  // Add a config for the average line
  config['Average'] = {
    color: '#9CA3AF' // Gray
  };
  
  return config;
};
