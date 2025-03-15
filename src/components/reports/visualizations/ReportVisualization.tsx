
import { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Candidate, JobRequirement } from '@/types/job.types';
import { prepareRadarChartData, prepareBarChartData, createChartConfig } from '../utils/visualizationUtils';

interface ReportVisualizationProps {
  candidates: Candidate[];
  requirements: JobRequirement[];
}

const ReportVisualization = ({ candidates, requirements }: ReportVisualizationProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Safety check: ensure we have valid data
  const validCandidates = candidates?.filter(c => c && c.id && c.scores) || [];
  const validRequirements = requirements?.filter(r => r && r.id) || [];
  
  // Only proceed if we have candidates and requirements
  if (validCandidates.length === 0 || validRequirements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Candidate Visualization</CardTitle>
          <CardDescription>
            {validCandidates.length === 0 
              ? "No candidate data available to visualize" 
              : "No requirements data available to visualize"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Check if we have any actual scores (not N/A) to visualize
  const hasScores = validCandidates.some(c => c.overallScore > 0);
  
  if (!hasScores) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Candidate Visualization</CardTitle>
          <CardDescription>
            No scores available to visualize. Process candidates to view visualizations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Create chart data with error handling
  try {
    const radarData = prepareRadarChartData(validCandidates, validRequirements);
    const barData = prepareBarChartData(validCandidates);
    const chartConfig = createChartConfig(validCandidates);
    
    // Custom tooltip for the bar chart to show star status
    const CustomBarTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-sm">
            <p className="flex items-center gap-1 font-medium">
              {data.name}
              {data.isStarred && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />}
            </p>
            <p className="text-sm">Score: {data.score > 0 ? `${data.score.toFixed(1)}/10` : 'N/A'}</p>
          </div>
        );
      }
      return null;
    };
    
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Candidate Visualization</CardTitle>
          <CardDescription>
            Visual comparison of candidate scores across different requirements
          </CardDescription>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="radar">Requirement Breakdown</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="overview" className="mt-0">
            <div className="h-[350px] w-full">
              <ChartContainer 
                config={chartConfig}
                className="w-full h-full"
              >
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <ChartTooltip content={<CustomBarTooltip />} />
                  <Legend />
                  <Bar dataKey="score" name="Overall Score" fill="var(--color-Vivid purple, #8B5CF6)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="radar" className="mt-0">
            <div className="h-[400px] w-full">
              <ChartContainer 
                config={chartConfig}
                className="w-full h-full"
              >
                <RadarChart data={radarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="requirement" />
                  <PolarRadiusAxis domain={[0, 10]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  
                  {validCandidates.map((candidate, index) => (
                    <Radar
                      key={candidate.id}
                      name={candidate.name}
                      dataKey={candidate.name}
                      stroke={chartConfig[candidate.name]?.color || '#8B5CF6'}
                      fill={chartConfig[candidate.name]?.color || '#8B5CF6'}
                      fillOpacity={0.2}
                    />
                  ))}
                </RadarChart>
              </ChartContainer>
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error rendering visualization:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Candidate Visualization</CardTitle>
          <CardDescription>Error rendering visualization. Please check console for details.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
};

export default ReportVisualization;
