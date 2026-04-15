import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppShell from '@/components/layout/AppShell';
import Spinner from '@/components/ui/Spinner';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

const Register = lazy(() => import('@/pages/Register'));

const Dashboard    = lazy(() => import('@/pages/Dashboard'));
const Projects     = lazy(() => import('@/pages/Projects'));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const Completion   = lazy(() => import('@/pages/Completion'));
const ProjectView  = lazy(() => import('@/pages/ProjectView'));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="flex items-center justify-center min-h-[50vh]">
      <Spinner size="h-8 w-8" />
    </div>
  }>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <S><Register /></S>,
  },
  {
    // Rota pública standalone — sem auth guard
    path: '/view',
    element: <S><ProjectView /></S>,
  },
  {
    element: <AppShell />,
    children: [
      { index: true,                        element: <S><Dashboard /></S> },
      { path: 'projects',                   element: <S><Projects /></S> },
      { path: 'projects/:id',               element: <S><ProjectDetail /></S> },
      { path: 'settings',                   element: <S><SettingsPage /></S> },
      { path: 'settings/completion',        element: <S><Completion /></S> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
