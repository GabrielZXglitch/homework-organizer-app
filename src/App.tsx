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
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/novo" element={<ProtectedRoute hideNav><NovoDever /></ProtectedRoute>} />
      <Route path="/concluir/:id" element={<ProtectedRoute hideNav><ConcluirDever /></ProtectedRoute>} />
      <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
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
