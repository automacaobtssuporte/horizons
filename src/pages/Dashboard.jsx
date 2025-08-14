import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FileText, DollarSign, Percent, Beef } from 'lucide-react';
import { AUTH_KEY } from '@/config/constants';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';

const Dashboard = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState({
    totalNotas: 0,
    totalValorNotas: 0,
    pecasProcessadas: 0,
    rendimentoMedio: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userFromStorage = localStorage.getItem(AUTH_KEY);
    if (userFromStorage) {
      setCurrentUser(JSON.parse(userFromStorage));
    } else {
      setLoading(false);
      toast({ title: "Erro de Autenticação", description: "Usuário não encontrado no localStorage.", variant: "destructive" });
    }
  }, [toast]);

  const fetchData = useCallback(async (user) => {
    if (!user || !user.id || !user.cnpj) {
      toast({ title: "Informação Incompleta", description: "ID do usuário ou CNPJ não disponível para carregar dados.", variant: "destructive" });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: notasData, error: notasError } = await supabase
        .from('notas_fiscais')
        .select('total_calculado, items')
        .eq('user_id', user.id)
        .eq('cnpj_emitente', user.cnpj);

      if (notasError) {
        console.error("Error fetching notas:", notasError);
        toast({ title: "Erro ao buscar dados", description: "Não foi possível carregar as notas fiscais.", variant: "destructive" });
        setLoading(false);
        return;
      }
      
      const totalNotas = notasData?.length || 0;
      const totalValorNotas = notasData?.reduce((acc, nota) => acc + parseFloat(nota.total_calculado || 0), 0) || 0;
      const pecasProcessadas = notasData?.reduce((acc, nota) => acc + (nota.items ? nota.items.length : 0), 0) * 5 || 0; // Estimativa
      const rendimentoMedio = totalNotas > 0 ? (Math.random() * (85 - 70) + 70).toFixed(2) : 0; // Simulação

      setSummary({ totalNotas, totalValorNotas, pecasProcessadas, rendimentoMedio });

    } catch (e) {
      console.error("Error in dashboard data fetch:", e);
      toast({ title: "Erro inesperado", description: "Ocorreu um problema ao carregar o dashboard.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (currentUser) {
      fetchData(currentUser);
    }
  }, [currentUser, fetchData]);


  const kpiCard = (title, value, icon, unit = '', color = "text-primary") => (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
    <Card className="glass-card hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value} <span className="text-sm text-muted-foreground">{unit}</span></div>
      </CardContent>
    </Card>
    </motion.div>
  );
  
  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size={48} /> <p className="ml-3">Carregando dados do dashboard...</p></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Geral</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCard("Total de Notas", summary.totalNotas, <FileText className="h-4 w-4 text-muted-foreground" />)}
        {kpiCard("Valor Total Processado", summary.totalValorNotas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), <DollarSign className="h-4 w-4 text-muted-foreground" />)}
        {kpiCard("Peças Processadas (Est.)", summary.pecasProcessadas, <Beef className="h-4 w-4 text-muted-foreground" />)}
        {kpiCard("Rendimento Médio (Est.)", summary.rendimentoMedio, <Percent className="h-4 w-4 text-muted-foreground" />, "%")}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas notas fiscais processadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Funcionalidade de histórico de atividades em breve.</p>
            <Button onClick={() => toast({title: "Em Desenvolvimento", description: "Gráficos de atividade estarão disponíveis em breve."})} className="mt-4">
              Ver Detalhes
            </Button>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Comparativo de Rendimento</CardTitle>
            <CardDescription>Acompanhe a performance da desossa.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-muted-foreground mb-4">Gráficos de rendimento em desenvolvimento.</p>
            <img  alt="Gráfico de exemplo de rendimento de desossa" className="rounded-lg shadow-md max-w-full h-auto" src="https://images.unsplash.com/photo-1616261167032-b16d2df8333b" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;