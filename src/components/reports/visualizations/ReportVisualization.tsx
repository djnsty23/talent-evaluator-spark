
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
  Legend,
  Line,
  ComposedChart
} from 'recharts';
import { Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Candidate, JobRequirement } from '@/types/job.types';
import { prepareRadarChartData, prepareBarChartData, createChartConfig } from '../utils/visualizationUtils';
import { calculateAverageScores } from '../utils/scoreUtils';

interface ReportVisualizationProps {
  candidates: Candidate[];
  requirements: JobRequirement[];
}

const ReportVisualization = ({ candidates, requirements }: ReportVisualizationProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Only proceed if we have candidates
  if (candidates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Candidate Visualization</CardTitle>
          <CardDescription>No candidates available to visualize</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Create chart data
  const radarData = prepareRadarChartData(candidates, requirements);
  const barData = prepareBarChartData(candidates);
  const chartConfig = createChartConfig(candidates);
  
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
          <p className="text-sm">Score: {data.score.toFixed(1)}/10</p>
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
                
                {candidates.map((candidate, index) => (
                  <Radar
                    key={candidate.id}
                    name={candidate.name}
                    dataKey={candidate.name}
                    stroke={chartConfig[candidate.name].color}
                    fill={chartConfig[candidate.name].color}
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
};

export default ReportVisualization;
