import { LandingPage } from './pages/LandingPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HomeworkProvider } from './contexts/HomeworkContext';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { NovoDever } from './pages/NovoDever';
import { ConcluirDever } from './pages/ConcluirDever';
import { Historico } from './pages/Historico';
import { Perfil } from './pages/Perfil';
import { BottomNav } from './components/BottomNav';

function ProtectedRoute({ children, hideNav = false }: { children: React.ReactNode, hideNav?: boolean }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return (
    <>
      {children}
      {!hideNav && <BottomNav />}
    </>
  );
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/app/novo" element={<ProtectedRoute hideNav><NovoDever /></ProtectedRoute>} />
      <Route path="/app/concluir/:id" element={<ProtectedRoute hideNav><ConcluirDever /></ProtectedRoute>} />
      <Route path="/app/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
      <Route path="/app/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HomeworkProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </HomeworkProvider>
    </AuthProvider>
  );
}
