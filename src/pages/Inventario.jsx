import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { AUTH_KEY } from '@/config/constants';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import ControlesInventario from '@/components/inventario/ControlesInventario';
import ListaItensInventario from '@/components/inventario/ListaItensInventario';
import PainelResumoQuebras from '@/components/inventario/PainelResumoQuebras';
import ModalSalvarInventario from '@/components/inventario/ModalSalvarInventario';
import ModalPesquisaInventario from '@/components/inventario/ModalPesquisaInventario';
import * as XLSX from 'xlsx';

const performAnalysisCalculation = (item) => {
  const ei = parseFloat(item.estoque_inicial) || 0;
  const c = parseFloat(item.compras) || 0;
  const oe = parseFloat(item.outras_entradas) || 0;
  const v = parseFloat(item.vendas) || 0;
  const os = parseFloat(item.outras_saidas) || 0;
  const ef = parseFloat(item.estoque_fisico_contado) || 0;
  const cmu = parseFloat(item.custo_medio_unitario) || 0;

  const calculado = ei + oe + c - v - os;
  const div = ef - calculado;
  const divValor = div * cmu;

  let pQuebra = 0;
  if (calculado > 0) {
    pQuebra = ((calculado - ef) / calculado) * 100;
  } else if (ef > 0 && calculado <= 0) {
    pQuebra = -100;
  } else if (calculado === 0 && ef === 0) {
    pQuebra = 0;
  } else if (calculado < 0 && ef > calculado) {
    pQuebra = -100;
  }

  let mensagem = '';
  let corMsg = 'text-muted-foreground';

  if (pQuebra > 2) {
    mensagem = `Atenção! Quebra de ${pQuebra.toFixed(2)}% acima do aceitável.`;
    corMsg = 'text-red-500';
  } else if (pQuebra >= 0 && pQuebra <= 2) {
    mensagem = `Parabéns! Quebra de ${pQuebra.toFixed(2)}% dentro do aceitável.`;
    corMsg = 'text-green-500';
  } else {
    mensagem = `Sobra de ${Math.abs(pQuebra).toFixed(2)}% identificada.`;
    corMsg = 'text-blue-500';
  }
  
  return {
    estoque_calculado: calculado.toFixed(2),
    divergencia: div.toFixed(2),
    divergencia_valor: divValor.toFixed(2),
    percentual_quebra: pQuebra.toFixed(2),
    mensagem_quebra: mensagem,
    cor_mensagem: corMsg,
  };
};

const Inventario = () => {
  const { toast } = useToast();
  const [itensInventario, setItensInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [inventariosSalvos, setInventariosSalvos] = useState([]);
  const [loadingInventarios, setLoadingInventarios] = useState(false);
  const [currentInventarioName, setCurrentInventarioName] = useState('');

  useEffect(() => {
    const userFromStorage = localStorage.getItem(AUTH_KEY);
    if (userFromStorage) {
      setCurrentUser(JSON.parse(userFromStorage));
    } else {
      setLoading(false);
      toast({ title: "Erro de Autenticação", description: "Usuário não encontrado.", variant: "destructive" });
    }
  }, [toast]);

  const fetchInventario = useCallback(async (user) => {
    if (!user?.id || !user?.cnpj) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventario_fisico')
        .select('*')
        .eq('user_id', user.id)
        .eq('cnpj_loja', user.cnpj)
        .is('nome_inventario', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const itensComCamposAnalise = data.map(item => ({
        ...item,
        estoque_inicial: '', compras: '', outras_entradas: '', vendas: '',
        outras_saidas: '', estoque_fisico_contado: '', custo_medio_unitario: '',
        estoque_calculado: 0, divergencia: 0, divergencia_valor: 0,
        percentual_quebra: 0, mensagem_quebra: '', cor_mensagem: 'text-muted-foreground',
      }));
      setItensInventario(itensComCamposAnalise || []);
      setCurrentInventarioName('Inventário Atual (Não Salvo)');
    } catch (error) {
      toast({ title: "Erro ao Carregar Inventário", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (currentUser) {
      fetchInventario(currentUser);
    }
  }, [currentUser, fetchInventario]);

  const handleUpdateItemAnalise = (itemId, field, value) => {
    setItensInventario(prev => prev.map(item => item.id === itemId ? { ...item, [field]: value } : item));
  };

  const calcularAnaliseQuebraItem = useCallback((itemId) => {
    setItensInventario(prev => prev.map(item => {
      if (item.id === itemId) {
        const resultadosAnalise = performAnalysisCalculation(item);
        return { ...item, ...resultadosAnalise };
      }
      return item;
    }));
    toast({title: "Análise Calculada", description: `Quebra calculada para o item.`});
  }, [toast]);

  const handleSaveItemAnalise = async (itemId) => {
    if (!currentUser || !currentUser.id) {
      toast({ title: "Erro de Autenticação", variant: "destructive" });
      return;
    }

    const item = itensInventario.find(i => i.id === itemId);
    if (!item) return;

    try {
      const { id, ...analiseData } = item;
      const { error } = await supabase
        .from('inventario_fisico')
        .update(analiseData)
        .eq('id', itemId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      toast({ 
        title: "Análise Salva", 
        description: "Os dados da análise de quebra foram salvos com sucesso!" 
      });
      
    } catch (error) {
      toast({ 
        title: "Erro ao Salvar Análise", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };
  
  const handleFileUploadUnificado = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast({ title: "Erro", description: "Planilha vazia ou inválida.", variant: "destructive" });
          return;
        }

        setLoading(true);

        const existingCodes = new Set(itensInventario.map(i => String(i.codigo).trim().toLowerCase()));
        
        const newItemsPayload = jsonData
          .filter(row => {
            const code = String(row.codigo_produto || '').trim().toLowerCase();
            return code && !existingCodes.has(code);
          })
          .map(row => ({
            codigo: String(row.codigo_produto),
            nome: String(row.nome_produto || 'Novo Item'),
            quantidade: parseFloat(row.quantidade_estoque || 0),
            unidade: String(row.unidade || 'kg'),
            parte_boi: String(row.parte_boi || ''),
            user_id: currentUser.id,
            cnpj_loja: currentUser.cnpj,
          }));

        if (newItemsPayload.length > 0) {
          const { error: insertError } = await supabase.from('inventario_fisico').insert(newItemsPayload);
          if (insertError) throw insertError;
          toast({ title: "Novos Itens Criados", description: `${newItemsPayload.length} novos itens foram adicionados ao inventário.` });
        }

        await fetchInventario(currentUser);

        setItensInventario(currentInventory => {
          const planilhaDataMap = new Map(
            jsonData.map(row => [String(row.codigo_produto).trim().toLowerCase(), row])
          );

          return currentInventory.map(item => {
            const rowData = planilhaDataMap.get(String(item.codigo).trim().toLowerCase());
            if (rowData) {
              const itemComDadosPlanilha = {
                ...item,
                estoque_inicial: String(rowData.estoque_inicial ?? item.estoque_inicial ?? ''),
                compras: String(rowData.compras ?? item.compras ?? ''),
                outras_entradas: String(rowData.outras_entradas ?? item.outras_entradas ?? ''),
                vendas: String(rowData.vendas ?? item.vendas ?? ''),
                outras_saidas: String(rowData.outras_saidas ?? item.outras_saidas ?? ''),
                estoque_fisico_contado: String(rowData.estoque_fisico_contado ?? item.estoque_fisico_contado ?? ''),
                custo_medio_unitario: String(rowData.custo_medio_unitario ?? item.custo_medio_unitario ?? ''),
              };
              const resultadosAnalise = performAnalysisCalculation(itemComDadosPlanilha);
              return { ...itemComDadosPlanilha, ...resultadosAnalise };
            }
            return item;
          });
        });

        toast({ title: "Sucesso!", description: "Planilha processada. Itens atualizados e/ou criados." });

      } catch (error) {
        console.error("Erro ao processar planilha:", error);
        toast({ title: "Erro ao Processar Planilha", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
        event.target.value = null;
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveInventario = async (nomeInventario) => {
    if (!currentUser || !currentUser.id) {
      toast({ title: "Erro de Autenticação", variant: "destructive" });
      return;
    }
    if (itensInventario.length === 0) {
      toast({ title: "Erro", description: "Nenhum item para salvar.", variant: "destructive" });
      return;
    }

    const itensParaSalvar = itensInventario.map(item => {
      const { id, created_at, updated_at, ...rest } = item;
      return {
        ...rest,
        user_id: currentUser.id,
        cnpj_loja: currentUser.cnpj,
        nome_inventario: nomeInventario,
        quantidade: parseFloat(item.quantidade) || 0,
        estoque_inicial: parseFloat(item.estoque_inicial) || 0,
        compras: parseFloat(item.compras) || 0,
        outras_entradas: parseFloat(item.outras_entradas) || 0,
        vendas: parseFloat(item.vendas) || 0,
        outras_saidas: parseFloat(item.outras_saidas) || 0,
        estoque_fisico_contado: parseFloat(item.estoque_fisico_contado) || 0,
        custo_medio_unitario: parseFloat(item.custo_medio_unitario) || 0,
        estoque_calculado: parseFloat(item.estoque_calculado) || 0,
        divergencia: parseFloat(item.divergencia) || 0,
        divergencia_valor: parseFloat(item.divergencia_valor) || 0,
        percentual_quebra: parseFloat(item.percentual_quebra) || 0,
      };
    });

    try {
      const { error } = await supabase.from('inventario_fisico').insert(itensParaSalvar);
      if (error) throw error;
      toast({ title: "Inventário Salvo!", description: `O inventário "${nomeInventario}" foi salvo com sucesso.` });
      setIsSaveModalOpen(false);
    } catch (error) {
      toast({ title: "Erro ao Salvar Inventário", description: error.message, variant: "destructive" });
    }
  };

  const handleOpenSearchModal = async () => {
    if (!currentUser) return;
    setLoadingInventarios(true);
    setIsSearchModalOpen(true);
    try {
      const { data, error } = await supabase
        .from('inventario_fisico')
        .select('nome_inventario')
        .eq('user_id', currentUser.id)
        .eq('cnpj_loja', currentUser.cnpj)
        .not('nome_inventario', 'is', null);

      if (error) throw error;
      
      const uniqueNames = [...new Set(data.map(item => item.nome_inventario))];
      setInventariosSalvos(uniqueNames);
    } catch (error) {
      toast({ title: "Erro ao buscar inventários", description: error.message, variant: "destructive" });
    } finally {
      setLoadingInventarios(false);
    }
  };

  const loadInventarioPorNome = async (nome) => {
    if (!currentUser) return;
    setLoading(true);
    setIsSearchModalOpen(false);
    try {
      const { data, error } = await supabase
        .from('inventario_fisico')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('cnpj_loja', currentUser.cnpj)
        .eq('nome_inventario', nome)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItensInventario(data || []);
      setCurrentInventarioName(nome);
      toast({ title: "Inventário Carregado", description: `Exibindo o inventário "${nome}".` });
    } catch (error) {
      toast({ title: "Erro ao carregar inventário", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading && itensInventario.length === 0 && currentUser) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size={48} /><p className="ml-3">Carregando...</p></div>;
  }
  if (!currentUser && !loading) {
      return <div className="text-center py-10"><p className="text-red-500">Usuário não autenticado.</p></div>;
  }

  return (
    <div className="space-y-6 pb-16">
      <h1 className="text-3xl font-bold text-gradient-brand">Inventário Físico e Análise de Quebras</h1>
      <p className="text-muted-foreground">Inventário carregado: <span className="font-semibold text-primary">{currentInventarioName}</span></p>
      
      <ControlesInventario
        currentUser={currentUser}
        setItensInventario={setItensInventario}
        onFileUploadUnificado={handleFileUploadUnificado}
        onSaveInventario={() => setIsSaveModalOpen(true)}
        onOpenSearchModal={handleOpenSearchModal}
        itensInventario={itensInventario}
      />

      <PainelResumoQuebras itensInventario={itensInventario} />

      <ListaItensInventario
        itensInventario={itensInventario}
        setItensInventario={setItensInventario}
        loading={loading}
        currentUser={currentUser}
        fetchInventario={fetchInventario}
        handleUpdateItemAnalise={handleUpdateItemAnalise}
        calcularAnaliseQuebraItem={calcularAnaliseQuebraItem}
        handleSaveItemAnalise={handleSaveItemAnalise}
      />

      <ModalSalvarInventario
        open={isSaveModalOpen}
        setOpen={setIsSaveModalOpen}
        onConfirmSave={handleSaveInventario}
      />

      <ModalPesquisaInventario
        open={isSearchModalOpen}
        setOpen={setIsSearchModalOpen}
        inventarios={inventariosSalvos}
        isLoading={loadingInventarios}
        onSelectInventario={loadInventarioPorNome}
      />
    </div>
  );
};

export default Inventario;