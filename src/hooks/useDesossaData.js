import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { AUTH_KEY } from '@/config/constants';

export const useDesossaData = () => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);

  const [desossasRegistradas, setDesossasRegistradas] = useState([]);
  const [loadingDesossas, setLoadingDesossas] = useState(false);

  useEffect(() => {
    const userFromStorage = localStorage.getItem(AUTH_KEY);
    if (userFromStorage) {
      setUser(JSON.parse(userFromStorage));
    }
  }, []);

  const fetchDesossasRegistradas = useCallback(async () => {
    if (!user || !user.id) return;
    setLoadingDesossas(true);
    try {
      const { data, error } = await supabase
        .from('desossas_registradas')
        .select('id, numero_nota_fiscal, data_chegada, cortes_info, peso_inicial_boi, custo_total_carcaca')
        .eq('user_id', user.id)
        .order('data_chegada', { ascending: false });

      if (error) throw error;
      setDesossasRegistradas(data || []);
    } catch (error) {
      toast({ title: "Erro ao buscar desossas", description: error.message, variant: "destructive" });
    } finally {
      setLoadingDesossas(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchDesossasRegistradas();
  }, [fetchDesossasRegistradas]);

  return {
    desossasRegistradas,
    loadingDesossas
  };
};