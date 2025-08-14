import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { APP_NAME, AUTH_KEY } from '@/config/constants';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import { isBefore } from 'date-fns';

import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';

const MainAppLayout = lazy(() => import('@/components/layout/MainAppLayout'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Inventario = lazy(() => import('@/pages/Inventario'));
const CalculosDesossa = lazy(() => import('@/pages/CalculosDesossa'));
const SimulacaoPrecos = lazy(() => import('@/pages/SimulacaoPrecos'));
const NotasFiscais = lazy(() => import('@/pages/NotasFiscais'));
const PDV = lazy(() => import('@/pages/PDV'));
const ParametrosRendimento = lazy(() => import('@/pages/ParametrosRendimento'));
const HistoricoCnpj = lazy(() => import('@/pages/HistoricoCnpj'));
const Configuracoes = lazy(() => import('@/pages/Configuracoes'));
const ManualSistema = lazy(() => import('@/pages/ManualSistema'));
const LicencaExpirada = lazy(() => import('@/pages/LicencaExpirada'));
const DREPage = lazy(() => import('@/pages/DRE.jsx'));

function App() {
  const [userSession, setUserSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setLoadingSession(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email,
          cnpj: session.user.user_metadata?.cnpj || '',
          storeName: session.user.user_metadata?.store_name || session.user.user_metadata?.storeName || `Loja ${session.user.user_metadata?.cnpj?.slice(0,5) || 'Nova'}`
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
        setUserSession({ user: userData });
      } else {
        localStorage.removeItem(AUTH_KEY);
        setUserSession(null);
      }
      setLoadingSession(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const verificarLicenca = async () => {
      if (userSession?.user) {
        const { data: usuarios, error } = await supabase
          .from('usuarios')
          .select('validade_licenca, nome_loja')
          .eq('auth_user_id', userSession.user.id);

        if (error) {
          console.error("Erro ao verificar dados da licença:", error.message);
          toast({
            title: "Erro de Sistema",
            description: "Não foi possível verificar os dados da sua licença. Tente novamente mais tarde.",
            variant: "destructive",
          });
          return;
        }
        
        if (!usuarios || usuarios.length === 0) {
          console.warn(`Perfil de usuário não encontrado para o ID: ${userSession.user.id}. A verificação de licença foi ignorada.`);
          return;
        }

        const usuario = usuarios[0];

        if (usuario.validade_licenca) {
          const validadeLicenca = new Date(usuario.validade_licenca);
          const hoje = new Date();

          if (isBefore(validadeLicenca, hoje)) {
            toast({
              title: "Licença Expirada",
              description: `Sua licença para a loja ${usuario.nome_loja || ''} expirou.`,
              variant: "destructive",
              duration: 9000,
            });
            navigate("/licenca-expirada");
          }
        }
      }
    };

    if (!loadingSession) {
      verificarLicenca();
    }
  }, [userSession, loadingSession, navigate, toast]);
  
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, []);

  if (loadingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner size={64} /> 
        <p className="ml-4 text-lg">Carregando {APP_NAME}...</p>
      </div>
    );
  }

  const user = userSession?.user;

  return (
    <>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <LoadingSpinner size={64} /> 
          <p className="ml-4 text-lg">Carregando página...</p>
        </div>
      }>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/app/dashboard" /> : <LoginPage />} />
          <Route path="/signup" element={user ? <Navigate to="/app/dashboard" /> : <SignupPage />} />
          <Route path="/licenca-expirada" element={<LicencaExpirada />} />
          <Route path="/app" element={user ? <MainAppLayout user={user} /> : <Navigate to="/login" />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pdv" element={<PDV />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="calculos" element={<CalculosDesossa />} />
            <Route path="simulacao" element={<SimulacaoPrecos />} />
            <Route path="notas" element={<NotasFiscais />} />
            <Route path="parametros" element={<ParametrosRendimento />} />
            <Route path="dre" element={<DREPage />} />
            <Route path="historico" element={<HistoricoCnpj />} />
            <Route path="manual" element={<ManualSistema />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="*" element={<Navigate to={user ? "/app/dashboard" : "/login"} />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}

function RootApp() {
  return (
    <HashRouter>
      <App />
    </HashRouter>
  )
}

export default RootApp;