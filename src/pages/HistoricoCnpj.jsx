import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Search, BarChart2 } from 'lucide-react';
import { AUTH_KEY } from '@/config/constants';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';

const HistoricoCnpj = () => {
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem(AUTH_KEY));
  const [cnpjPesquisa, setCnpjPesquisa] = useState(user?.cnpj || '');
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscarHistorico = useCallback(async (cnpj) => {
    if (!cnpj) {
      toast({ title: "Atenção", description: "Digite um CNPJ para pesquisar.", variant: "default" });
      setHistorico([]);
      return;
    }
    if (!user || !user.id) {
      toast({ title: "Erro de Autenticação", description: "Usuário não identificado.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: notasData, error: notasError } = await supabase
        .from('notas_fiscais')
        .select('numero_nota, data_nota, total_calculado, items, created_at')
        .eq('user_id', user.id) // User must own the data
        .eq('cnpj_emitente', cnpj) // Filter by the searched CNPJ
        .order('data_nota', { ascending: false });

      if (notasError) throw notasError;

      const dadosAgregados = notasData.map(nota => ({
        tipo: "Nota Fiscal",
        id: nota.numero_nota,
        data: nota.data_nota,
        valor: nota.total_calculado,
        detalhes: `${nota.items ? nota.items.length : 0} itens`,
        criado_em: nota.created_at,
      })).sort((a,b) => new Date(b.data || b.criado_em) - new Date(a.data || a.criado_em));

      setHistorico(dadosAgregados);
      if(dadosAgregados.length === 0){
        toast({ title: "Sem Resultados", description: `Nenhum histórico encontrado para o CNPJ: ${cnpj}.`});
      } else {
        toast({ title: "Histórico Carregado", description: `Histórico para ${cnpj} exibido.`});
      }
    } catch (error) {
      toast({ title: "Erro ao Buscar Histórico", description: error.message, variant: "destructive" });
      setHistorico([]);
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    if (user?.cnpj) {
      buscarHistorico(user.cnpj);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.cnpj]); // buscarHistorico is memoized, so this is safe

  const handleSearch = () => {
    buscarHistorico(cnpjPesquisa);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Histórico por CNPJ</h1>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Pesquisar Histórico</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-grow">
            <Label htmlFor="cnpjPesquisa">CNPJ</Label>
            <Input id="cnpjPesquisa" value={cnpjPesquisa} onChange={e => setCnpjPesquisa(e.target.value)} placeholder="Digite o CNPJ"/>
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <LoadingSpinner className="mr-2" /> : <Search className="mr-2 h-4 w-4"/>}
            Pesquisar
          </Button>
        </CardContent>
      </Card>

      {loading && <div className="text-center py-10"><LoadingSpinner size={32} /> <p className="ml-2 inline">Carregando histórico...</p></div>}

      {!loading && historico.length === 0 && (
        <Card className="glass-card text-center py-12">
          <CardContent>
            <BarChart2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">Nenhum histórico para exibir.</p>
            <p className="text-sm text-muted-foreground">Use a pesquisa acima para encontrar dados de um CNPJ.</p>
          </CardContent>
        </Card>
      )}

      {!loading && historico.length > 0 && (
        <Card className="glass-card">
          <CardHeader><CardTitle>Resultados para CNPJ: {cnpjPesquisa}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Data</th>
                    <th className="p-2 text-left">Tipo</th>
                    <th className="p-2 text-left">ID/Referência</th>
                    <th className="p-2 text-left">Valor (R$)</th>
                    <th className="p-2 text-left">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((item, index) => (
                    <motion.tr key={index} className="border-b hover:bg-muted/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td className="p-2">{item.data ? new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR') : new Date(item.criado_em).toLocaleDateString('pt-BR')}</td>
                      <td className="p-2">{item.tipo}</td>
                      <td className="p-2">{item.id}</td>
                      <td className="p-2">{parseFloat(item.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2">{item.detalhes}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HistoricoCnpj;