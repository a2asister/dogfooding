import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import Login from '@/pages/Login';
import AuthCallback from '@/pages/AuthCallback';
import MainLayout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Repositories from '@/pages/Repositories';
import RepositoryDetail from '@/pages/RepositoryDetail';
import BranchRules from '@/pages/BranchRules';
import PullRequests from '@/pages/PullRequests';
import PullRequestDetail from '@/pages/PullRequestDetail';
import Pipelines from '@/pages/Pipelines';
import PipelineDetail from '@/pages/PipelineDetail';
import PipelineRuns from '@/pages/PipelineRuns';
import PipelineRunDetail from '@/pages/PipelineRunDetail';
import Environments from '@/pages/Environments';
import Deployments from '@/pages/Deployments';
import Snapshots from '@/pages/Snapshots';
import Users from '@/pages/Users';
import AuditLogs from '@/pages/AuditLogs';
import Alerts from '@/pages/Alerts';

function App(): JSX.Element {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/repositories/:id" element={<RepositoryDetail />} />
        <Route path="/branch-rules" element={<BranchRules />} />
        <Route path="/pull-requests" element={<PullRequests />} />
        <Route path="/pull-requests/:id" element={<PullRequestDetail />} />
        <Route path="/pipelines" element={<Pipelines />} />
        <Route path="/pipelines/:id" element={<PipelineDetail />} />
        <Route path="/pipeline-runs" element={<PipelineRuns />} />
        <Route path="/pipeline-runs/:id" element={<PipelineRunDetail />} />
        <Route path="/environments" element={<Environments />} />
        <Route path="/deployments" element={<Deployments />} />
        <Route path="/snapshots" element={<Snapshots />} />
        <Route path="/users" element={<Users />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
