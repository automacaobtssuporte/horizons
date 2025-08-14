import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { AUTH_KEY } from '@/config/constants';

export const useSimulacaoData = () => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);

  const [notasFiscais, setNotasFiscais] = useState([]);
  const [simulacoesSalvas, setSimulacoesSalvas] = useState([]);
  const [loadingNotas, setLoadingNotas] = useState(false);

  useEffect(() => {
    const userFromStorage = localStorage.getItem(AUTH_KEY);
    if(userFromStorage) {
      setUser(JSON.parse(userFromStorage));
    }
  }, []);

  const fetchNotasFiscais = useCallback(async () => {
    if (!user || !user.id) return;
    setLoadingNotas(true);
    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .select('id, numero_nota, data_nota, items')
        .eq('user_id', user.id)
        .order('data_nota', { ascending: false });

      if (error) throw error;
      setNotasFiscais(data || []);
    } catch (error) {
      toast({ title: "Erro ao buscar notas", description: error.message, variant: "destructive" });
    } finally {
      setLoadingNotas(false);
    }
  }, [user, toast]);

  const fetchSimulacoesSalvas = useCallback(async () => {
    if (!user || !user.id) return;
    try {
      const { data, error } = await supabase
        .from('simulacoes_precos')
        .select('id, nome_simulacao, data_simulacao, itens_simulacao, observacoes')
        .eq('user_id', user.id)
        .eq('cnpj_empresa', user.cnpj)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSimulacoesSalvas(data || []);
    } catch (error) {
      console.warn('Erro ao buscar simulações salvas:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotasFiscais();
    fetchSimulacoesSalvas();
  }, [fetchNotasFiscais, fetchSimulacoesSalvas]);

  return {
    notasFiscais,
    simulacoesSalvas,
    loadingNotas,
    reloadSimulacoesSalvas: fetchSimulacoesSalvas
  };
};