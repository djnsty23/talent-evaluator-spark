
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { JobProvider } from './contexts/JobContext';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/Navbar';
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateJob from './pages/CreateJob';
import JobDetail from './pages/JobDetail';
import CandidateUpload from './pages/CandidateUpload';
import CandidateAnalysis from './pages/CandidateAnalysis';
import ReportGeneration from './pages/ReportGeneration';
import ViewReport from './pages/ViewReport';
import JobRequirementsEditor from './pages/JobRequirementsEditor';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <AuthProvider>
          <JobProvider>
            <Navbar />
            <main className="min-h-screen bg-background pt-16 pb-12">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/jobs/create" element={
                  <ProtectedRoute>
                    <CreateJob />
                  </ProtectedRoute>
                } />
                
                <Route path="/jobs/:jobId" element={
                  <ProtectedRoute>
                    <JobDetail />
                  </ProtectedRoute>
                } />
                
                <Route path="/jobs/:jobId/requirements" element={
                  <ProtectedRoute>
                    <JobRequirementsEditor />
                  </ProtectedRoute>
                } />
                
                <Route path="/jobs/:jobId/upload" element={
                  <ProtectedRoute>
                    <CandidateUpload />
                  </ProtectedRoute>
                } />
                
                <Route path="/jobs/:jobId/analysis" element={
                  <ProtectedRoute>
                    <CandidateAnalysis />
                  </ProtectedRoute>
                } />
                
                <Route path="/jobs/:jobId/report" element={
                  <ProtectedRoute>
                    <ReportGeneration />
                  </ProtectedRoute>
                } />
                
                <Route path="/jobs/:jobId/reports/:reportId" element={
                  <ProtectedRoute>
                    <ViewReport />
                  </ProtectedRoute>
                } />
                
                {/* Fallback routes */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
            <Toaster />
          </JobProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
