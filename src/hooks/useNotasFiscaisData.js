import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { AUTH_KEY } from '@/config/constants';
import { supabase } from '@/lib/supabaseClient';

export const useNotasFiscaisData = () => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parametrosRendimento, setParametrosRendimento] = useState([]);
  const [produtosInventario, setProdutosInventario] = useState([]);
  const [produtosDesossa, setProdutosDesossa] = useState([]);

  const fetchInitialData = useCallback(async (user) => {
    if (!user || !user.id || !user.cnpj) return;
    try {
      const [paramsRes, inventarioRes, notasRes, desossasRes] = await Promise.all([
        supabase.from('parametros_rendimento_boi').select('codigo_peca, descricao_peca').eq('user_id', user.id).eq('cnpj_empresa', user.cnpj),
        supabase.from('inventario_fisico').select('codigo, nome').eq('user_id', user.id).eq('cnpj_loja', user.cnpj),
        supabase.from('notas_fiscais').select('*').eq('user_id', user.id).eq('cnpj_emitente', user.cnpj).order('created_at', { ascending: false }),
        supabase.from('desossas_registradas').select('cortes_info').eq('user_id', user.id).eq('cnpj_empresa', user.cnpj).order('created_at', { ascending: false }).limit(50)
      ]);

      if (paramsRes.error) throw paramsRes.error;
      setParametrosRendimento(paramsRes.data || []);

      if (inventarioRes.error) throw inventarioRes.error;
      setProdutosInventario(inventarioRes.data || []);

      if (notasRes.error) throw notasRes.error;
      setNotas(notasRes.data.map(n => ({...n, items: n.items.map((it, idx) => ({...it, id: Date.now() + idx + Math.random() })) })) || []);

      if (desossasRes.error) throw desossasRes.error;
      const produtosUnicos = new Map();
      
      desossasRes.data.forEach(desossa => {
        if (desossa.cortes_info && Array.isArray(desossa.cortes_info)) {
          desossa.cortes_info.forEach(corte => {
            if (corte.nome && corte.nome.trim()) {
              const chave = `${corte.codigo_produto || ''}-${corte.nome}`.toLowerCase();
              if (!produtosUnicos.has(chave)) {
                produtosUnicos.set(chave, {
                  codigo: corte.codigo_produto || `AUTO-${Math.random().toString(36).substr(2,5).toUpperCase()}`,
                  nome: corte.nome.trim(),
                  origem: 'desossa'
                });
              }
            }
          });
        }
      });

      setProdutosDesossa(Array.from(produtosUnicos.values()));

    } catch (error) {
      toast({ title: "Erro ao Carregar Dados", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const userFromStorage = localStorage.getItem(AUTH_KEY);
    if (userFromStorage) {
      const parsedUser = JSON.parse(userFromStorage);
      setCurrentUser(parsedUser);
    } else {
      setLoading(false);
      toast({ title: "Erro de Autenticação", description: "Usuário não encontrado.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      fetchInitialData(currentUser);
    }
  }, [currentUser, fetchInitialData]);

  return {
    currentUser,
    notas,
    setNotas,
    loading,
    parametrosRendimento,
    produtosInventario,
    produtosDesossa,
    fetchInitialData
  };
};