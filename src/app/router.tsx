import { createBrowserRouter } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import SettingsPage from '@/pages/Settings';
import Completion from '@/pages/Completion';
import ProjectView from '@/pages/ProjectView';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    // Rota pública standalone — sem auth guard
    path: '/view',
    element: <ProjectView />,
  },
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:id', element: <ProjectDetail /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'settings/completion', element: <Completion /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
