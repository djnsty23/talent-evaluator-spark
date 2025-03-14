
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateJob from "./pages/CreateJob";
import JobDetail from "./pages/JobDetail";
import CandidateUpload from "./pages/CandidateUpload";
import CandidateAnalysis from "./pages/CandidateAnalysis";
import ReportGeneration from "./pages/ReportGeneration";
import ViewReport from "./pages/ViewReport";
import { AuthProvider } from "./contexts/AuthContext";
import { JobProvider } from "./contexts/JobContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <JobProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs/create" 
                element={
                  <ProtectedRoute>
                    <CreateJob />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs/:jobId" 
                element={
                  <ProtectedRoute>
                    <JobDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs/:jobId/upload" 
                element={
                  <ProtectedRoute>
                    <CandidateUpload />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs/:jobId/analysis" 
                element={
                  <ProtectedRoute>
                    <CandidateAnalysis />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs/:jobId/report" 
                element={
                  <ProtectedRoute>
                    <ReportGeneration />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs/:jobId/report/:reportId" 
                element={
                  <ProtectedRoute>
                    <ViewReport />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </JobProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
