import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { AUTH_KEY } from '@/config/constants';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import { exportToExcel, exportToPDF } from '@/utils/parametrosExport';

import ParametrosHeader from '@/components/parametros/ParametrosHeader';
import ParametrosSearch from '@/components/parametros/ParametrosSearch';
import CalculadoraRendimento from '@/components/parametros/CalculadoraRendimento';
import TabelaResultadosRendimento from '@/components/parametros/CortesGerados';
import TabelaParametros from '@/components/parametros/ListaParametros';
import ModalParametro from '@/components/parametros/ModalParametro';

const calcularRendimentoCortes = (parametros, pesoBoi) => {
  const cortes = parametros.map(item => {
    const peso = (parseFloat(item.rendimento_percentual) / 100) * pesoBoi;
    return {
      ...item,
      peso,
      precoVendaKg: parseFloat(item.preco_venda_kg) || 0
    };
  });

  const totalPeso = cortes.reduce((acc, item) => acc + item.peso, 0);
  if (totalPeso === 0) return [];
  
  const totalVenda = cortes.reduce((acc, item) => acc + item.peso * item.precoVendaKg, 0);

  return cortes.map(item => {
    const valorPeca = item.peso * item.precoVendaKg;
    const percentualPeso = totalPeso > 0 ? item.peso / totalPeso : 0;
    const percentualVenda = totalVenda > 0 ? valorPeca / totalVenda : 0;
    const novoCustoResidual = (1 - percentualVenda) * valorPeca;
    const novoCustoUnitario = item.peso > 0 ? novoCustoResidual / item.peso : 0;
    const margem = item.precoVendaKg > 0 ? (item.precoVendaKg - novoCustoUnitario) / item.precoVendaKg : 0;

    return {
      codigo_peca: item.codigo_peca,
      nome: item.nome_peca,
      parte: item.nome_parte_animal,
      peso: item.peso.toFixed(3),
      precoVendaKg: item.precoVendaKg.toFixed(2),
      valorPeca: valorPeca.toFixed(2),
      percentualPeso: (percentualPeso * 100).toFixed(2) + "%",
      percentualVenda: (percentualVenda * 100).toFixed(2) + "%",
      novoCustoUnitario: novoCustoUnitario.toFixed(2),
      margem: (margem * 100).toFixed(2) + "%"
    };
  });
};

const ParametrosRendimento = () => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [parametros, setParametros] = useState([]);
  const [originalParametros, setOriginalParametros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentParametro, setCurrentParametro] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [pesoBoi, setPesoBoi] = useState('');
  const [resultadosCortes, setResultadosCortes] = useState([]);
  const [selectedParte, setSelectedParte] = useState('todos');

  const hasChanges = useMemo(() => {
    return JSON.stringify(parametros) !== JSON.stringify(originalParametros);
  }, [parametros, originalParametros]);

  const initialParametroState = useCallback(() => ({
    id: `new_${Date.now()}`,
    codigo_peca: '',
    nome_peca: '',
    codigo_parte_animal: '',
    nome_parte_animal: '',
    rendimento_percentual: '',
    descricao_peca: '',
    preco_venda_kg: '',
    user_id: currentUser?.id || null,
    cnpj_empresa: currentUser?.cnpj || '',
  }), [currentUser]);

  useEffect(() => {
    const userFromStorage = localStorage.getItem(AUTH_KEY);
    if (userFromStorage) {
      const parsedUser = JSON.parse(userFromStorage);
      setCurrentUser(parsedUser);
      if (parsedUser?.id && parsedUser?.cnpj) {
        fetchParametros(parsedUser);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchParametros = useCallback(async (user) => {
    if (!user?.id || !user?.cnpj) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('parametros_rendimento_boi')
        .select('*')
        .eq('user_id', user.id)
        .eq('cnpj_empresa', user.cnpj)
        .order('codigo_peca', { ascending: true });

      if (error) throw error;
      const fetchedParametros = data || [];
      setParametros(fetchedParametros);
      setOriginalParametros(JSON.parse(JSON.stringify(fetchedParametros)));
    } catch (error) {
      toast({ title: "Erro ao Carregar Parâmetros", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleOpenModal = (parametro = null) => {
    setCurrentParametro(parametro ? { ...parametro, rendimento_percentual: String(parametro.rendimento_percentual || ''), preco_venda_kg: String(parametro.preco_venda_kg || '') } : initialParametroState());
    setModalOpen(true);
  };

  const handleParametroChange = (field, value) => {
    setCurrentParametro(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveParametro = async () => {
    const {
      id,
      codigo_peca,
      nome_peca,
      codigo_parte_animal,
      nome_parte_animal,
      rendimento_percentual,
      descricao_peca,
      preco_venda_kg
    } = currentParametro;

    if (!codigo_peca || !nome_peca || !rendimento_percentual || !codigo_parte_animal) {
      toast({ title: "Erro de Validação", description: "Código, Nome, Rendimento e Parte do Animal são obrigatórios.", variant: "destructive" });
      return;
    }
    if (!currentUser?.id || !currentUser?.cnpj) {
      toast({ title: "Erro de Autenticação", description: "Não foi possível identificar o usuário ou a empresa.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    
    const rendimentoNum = parseFloat(rendimento_percentual);
    const precoNum = preco_venda_kg ? parseFloat(preco_venda_kg) : null;

    if (isNaN(rendimentoNum)) {
        toast({ title: "Erro de Validação", description: "O valor do rendimento é inválido.", variant: "destructive" });
        setIsSaving(false);
        return;
    }

    const parametroPayload = {
      user_id: currentUser.id,
      cnpj_empresa: currentUser.cnpj,
      codigo_peca: parseInt(codigo_peca, 10),
      nome_peca,
      codigo_parte_animal: String(codigo_parte_animal),
      nome_parte_animal,
      rendimento_percentual: rendimentoNum,
      percentual_rendimento_esperado: rendimentoNum,
      descricao_peca: descricao_peca || null,
      preco_venda_kg: precoNum,
    };

    try {
      let response;
      if (id && !String(id).startsWith('new_')) {
        const { user_id, cnpj_empresa, ...updatePayload } = parametroPayload;
        response = await supabase
          .from('parametros_rendimento_boi')
          .update(updatePayload)
          .match({ id: id, user_id: currentUser.id });
      } else {
        response = await supabase
          .from('parametros_rendimento_boi')
          .insert([parametroPayload]);
      }
      
      const { error } = response;
      if (error) throw error;
      
      await fetchParametros(currentUser);
      toast({ title: "Sucesso!", description: `Parâmetro "${nome_peca}" foi salvo.` });
      setModalOpen(false);
    } catch (error) {
      console.error("Erro detalhado ao salvar parâmetro:", error);
      const errorMessage = error.details || (error.code ? `Código ${error.code}: ${error.message}` : error.message);
      toast({
        title: "Falha ao Salvar",
        description: `Não foi possível salvar o parâmetro. Detalhe: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAllPrices = async () => {
    if (!hasChanges) {
      toast({ title: "Nenhuma alteração", description: "Nenhuma alteração foi detectada para salvar." });
      return;
    }
    setIsSaving(true);
    try {
      const upsertPayload = parametros
        .filter(p => {
          const original = originalParametros.find(op => op.id === p.id);
          return original && JSON.stringify(p) !== JSON.stringify(original);
        })
        .map(p => {
          return {
            id: p.id,
            user_id: p.user_id || currentUser.id,
            cnpj_empresa: p.cnpj_empresa || currentUser.cnpj,
            codigo_peca: p.codigo_peca,
            nome_peca: p.nome_peca,
            rendimento_percentual: parseFloat(p.rendimento_percentual),
            percentual_rendimento_esperado: parseFloat(p.percentual_rendimento_esperado || p.rendimento_percentual),
            codigo_parte_animal: p.codigo_parte_animal,
            nome_parte_animal: p.nome_parte_animal,
            descricao_peca: p.descricao_peca,
            preco_venda_kg: p.preco_venda_kg ? parseFloat(p.preco_venda_kg) : null,
          };
        });

      if (upsertPayload.length === 0) {
        toast({ title: "Nenhuma alteração detectada", description: "Nenhum preço foi alterado." });
        setIsSaving(false);
        return;
      }

      const { error } = await supabase.from('parametros_rendimento_boi').upsert(upsertPayload, {
        onConflict: 'id',
      });

      if (error) throw error;

      setOriginalParametros(JSON.parse(JSON.stringify(parametros)));
      toast({ title: "Sucesso!", description: "Todas as alterações foram salvas." });
    } catch (error) {
      toast({ title: "Erro ao Salvar Preços", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteParametro = async (id) => {
    if (!id || !currentUser?.id || !window.confirm('Tem certeza que deseja remover este parâmetro?')) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from('parametros_rendimento_boi').delete().match({ id, user_id: currentUser.id });
      if (error) throw error;
      await fetchParametros(currentUser);
      toast({ title: "Sucesso", description: "Parâmetro removido." });
    } catch (error) {
      toast({ title: "Erro ao Remover", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearchParametros = async () => {
    if (!currentUser?.id || !currentUser?.cnpj) return;
    setIsSearching(true);
    try {
      let query = supabase.from('parametros_rendimento_boi').select('*').eq('user_id', currentUser.id).eq('cnpj_empresa', currentUser.cnpj).order('codigo_peca', { ascending: true });
      if (searchTerm.trim()) {
        const isNumericSearch = !isNaN(searchTerm);
        if (isNumericSearch) {
          query = query.eq('codigo_peca', parseInt(searchTerm));
        } else {
          query = query.ilike('nome_peca', `%${searchTerm}%`);
        }
      }
      const { data, error } = await query.limit(20);
      if (error) throw error;
      setParametros(data || []);
      setOriginalParametros(JSON.parse(JSON.stringify(data || [])));
      toast({ title: "Busca Concluída", description: `${data?.length || 0} parâmetro(s) encontrado(s).` });
    } catch (error) {
      toast({ title: "Erro na Busca", description: error.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleParametroUpdate = (id, field, value) => {
    setParametros(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleCalcular = () => {
    const pesoNum = parseFloat(pesoBoi);
    if (isNaN(pesoNum) || pesoNum <= 0) {
      toast({ title: "Erro", description: "Por favor, insira um peso válido para o boi.", variant: "destructive" });
      return;
    }

    const parametrosFiltrados = selectedParte === 'todos'
      ? parametros
      : parametros.filter(p => p.nome_parte_animal === selectedParte);

    if (parametrosFiltrados.length === 0) {
      toast({ title: "Aviso", description: "Nenhum parâmetro encontrado para a parte selecionada.", variant: "destructive" });
      setResultadosCortes([]);
      return;
    }

    if (parametrosFiltrados.some(p => p.preco_venda_kg && (isNaN(parseFloat(p.preco_venda_kg)) || parseFloat(p.preco_venda_kg) < 0))) {
      toast({ title: "Erro", description: "Verifique se todos os preços de venda são números válidos e não negativos.", variant: "destructive" });
      return;
    }
    
    const resultados = calcularRendimentoCortes(parametrosFiltrados, pesoNum);
    setResultadosCortes(resultados);
    toast({ title: "Cálculo Realizado", description: "Os resultados foram atualizados abaixo." });
  };

  const handleExportExcel = () => {
    exportToExcel(parametros, resultadosCortes);
    toast({ title: "Exportação Iniciada", description: "Seu arquivo Excel está sendo gerado." });
  };

  const handleExportPDF = () => {
    exportToPDF(parametros, resultadosCortes);
    toast({ title: "Exportação Iniciada", description: "Seu arquivo PDF está sendo gerado." });
  };

  const partesDisponiveis = [...new Set(parametros.map(p => p.nome_parte_animal).filter(Boolean))];

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size={48} /><p className="ml-3">Carregando...</p></div>;
  }
  if (!currentUser) {
    return <div className="text-center py-10"><p className="text-red-500">Usuário não autenticado.</p></div>;
  }

  return (
    <div className="space-y-6">
      <ParametrosHeader 
        handleOpenModal={handleOpenModal} 
        handleSaveAll={handleSaveAllPrices}
        handleExportExcel={handleExportExcel}
        handleExportPDF={handleExportPDF}
        isSaving={isSaving}
        hasChanges={hasChanges}
      />
      <ParametrosSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearch={handleSearchParametros} isSearching={isSearching} />
      
      <TabelaParametros
        parametros={parametros}
        handleParametroUpdate={handleParametroUpdate}
        handleOpenModal={handleOpenModal}
        handleDeleteParametro={handleDeleteParametro}
      />

      <CalculadoraRendimento
        pesoBoi={pesoBoi}
        setPesoBoi={setPesoBoi}
        handleCalcular={handleCalcular}
        isLoading={isSaving || isSearching}
        partesDisponiveis={partesDisponiveis}
        selectedParte={selectedParte}
        setSelectedParte={setSelectedParte}
      />

      <TabelaResultadosRendimento resultados={resultadosCortes} />

      <ModalParametro
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        currentParametro={currentParametro}
        handleParametroChange={handleParametroChange}
        handleSaveParametro={handleSaveParametro}
        isSaving={isSaving}
      />
    </div>
  );
};

export default ParametrosRendimento;