import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { APP_NAME, AUTH_KEY } from '@/config/constants';
import { supabase } from '@/lib/supabaseClient';
import * as XLSX from 'xlsx';

const initialCorteState = {
  id: Date.now(),
  codigo_produto: '',
  nome: '',
  peso: '',
  preco_venda_kg: '',
  parte_boi: '', 
  parte_animal: '',
  rendimentoIndividual: 0,
  receitaVendaCorte: 0,
  indiceParticipacao: 0,
  novoCustoKg: 0,
  margemLucro: 0,
};

export const useDesossaFormManager = () => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  const [tipoAnimal, setTipoAnimal] = useState('bovino');
  const [numeroNotaFiscal, setNumeroNotaFiscal] = useState('');
  const [dataChegada, setDataChegada] = useState('');
  const [pesoInicialBoi, setPesoInicialBoi] = useState('');
  const [custoTotalCarcaça, setCustoTotalCarcaça] = useState('');
  const [cortes, setCortes] = useState([{...initialCorteState}]);

  const [searchTermDesossa, setSearchTermDesossa] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentDesossaId, setCurrentDesossaId] = useState(null);

  useEffect(() => {
    const userFromStorage = localStorage.getItem(AUTH_KEY);
    if (userFromStorage) {
      setCurrentUser(JSON.parse(userFromStorage));
    }
  }, []);

  const resetForm = (showToast = true) => {
    setCurrentDesossaId(null);
    setTipoAnimal('bovino');
    setNumeroNotaFiscal('');
    setDataChegada('');
    setPesoInicialBoi('');
    setCustoTotalCarcaça('');
    setCortes([{...initialCorteState, id: Date.now()}]);
    if (showToast) toast({ title: "Formulário Limpo", description: "Pronto para nova desossa."});
  };

  const handleAddCorte = () => {
    setCortes([...cortes, { ...initialCorteState, id: Date.now() }]);
  };

  const handleRemoveCorte = (id) => {
    setCortes(cortes.filter((corte) => corte.id !== id));
  };

  const handleCorteChange = (id, field, value) => {
    setCortes(prevCortes => prevCortes.map(c => {
      if (c.id === id) {
        const updatedCorte = { ...c, [field]: value };
        
        // Sincronizar parte_animal e parte_boi
        if (field === 'parte_animal') {
          updatedCorte.parte_boi = value;
        } else if (field === 'parte_boi') {
          updatedCorte.parte_animal = value;
        }
        
        return updatedCorte;
      }
      return c;
    }));
  };

  const handleDownloadPlanilhaModeloDesossa = () => {
    const tipoAnimalLabel = tipoAnimal === 'suino' ? 'suino' : 'bovino';
    const exemploParteAnimal = tipoAnimal === 'suino' ? 'pernil' : 'traseiro';
    const exemploCorte = tipoAnimal === 'suino' ? 'Pernil Suíno' : 'Picanha';
    
    const worksheetData = [ 
      ["codigo_produto", "nome_corte", "peso_kg", "preco_venda_kg", `parte_${tipoAnimalLabel}`], 
      ["PC001", exemploCorte, 2.5, 79.90, exemploParteAnimal] 
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ModeloDesossa");
    XLSX.writeFile(workbook, `Modelo_Planilha_Desossa_${tipoAnimalLabel}_${APP_NAME}.xlsx`);
    toast({ title: "Download Iniciado", description: "Modelo de planilha baixado."});
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0]; 
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result); 
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0]; 
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length < 2) { 
              toast({ title: "Erro na Planilha", description: "Planilha vazia ou formato inválido.", variant: "destructive" }); 
              return; 
            }
            
            const header = jsonData[0].map(h => String(h).toLowerCase().trim());
            const expectedHeader = ["codigo_produto", "nome_corte", "peso_kg", "preco_venda_kg"];
            const missingHeaders = expectedHeader.filter(eh => !header.includes(eh));
            
            if (missingHeaders.length > 0) { 
              toast({ 
                title: "Erro de Cabeçalho", 
                description: `Colunas obrigatórias faltando: ${missingHeaders.join(', ')}.`, 
                variant: "destructive", 
                duration: 7000 
              }); 
              return; 
            }
            
            const tipoAnimalLabel = tipoAnimal === 'suino' ? 'suino' : 'bovino';
            
            // Buscar índices das colunas
            const codigoProdutoIdx = header.indexOf("codigo_produto");
            const nomeCorteIdx = header.indexOf("nome_corte");
            const pesoKgIdx = header.indexOf("peso_kg");
            const precoVendaKgIdx = header.indexOf("preco_venda_kg");
            
            // Buscar coluna de parte do animal (específica do tipo ou genérica)
            let parteAnimalIdx = header.indexOf(`parte_${tipoAnimalLabel}`);
            if (parteAnimalIdx === -1) {
              parteAnimalIdx = header.indexOf("parte_boi"); // fallback para compatibilidade
            }
            if (parteAnimalIdx === -1) {
              parteAnimalIdx = header.indexOf("parte_animal"); // outro fallback
            }
            
            const importedCortes = jsonData.slice(1).map((row, index) => {
                const codigo_produto = String(row[codigoProdutoIdx] || '');
                const nome = String(row[nomeCorteIdx] || '');
                const peso = String(row[pesoKgIdx] || '');
                const preco_venda_kg = String(row[precoVendaKgIdx] || '');
                
                // Obter parte do animal se a coluna existir
                const parte_animal = parteAnimalIdx !== -1 ? String(row[parteAnimalIdx] || '') : '';

                // Validar dados obrigatórios
                if (!nome || !peso || !preco_venda_kg) { 
                  return null; 
                }
                
                // Se for descarte, preço deve ser 0
                const precoFinal = parte_animal === 'descarte' ? '0' : preco_venda_kg;
                
                return { 
                  ...initialCorteState, 
                  id: Date.now() + index, 
                  codigo_produto, 
                  nome, 
                  peso, 
                  preco_venda_kg: precoFinal, 
                  parte_animal,
                  parte_boi: parte_animal // manter compatibilidade
                };
            }).filter(corte => corte !== null);

            if (importedCortes.length > 0) { 
              setCortes(importedCortes); 
              toast({ 
                title: "Planilha Carregada com Sucesso!", 
                description: `${importedCortes.length} cortes importados. ${parteAnimalIdx !== -1 ? 'Partes do animal incluídas.' : 'Partes do animal não encontradas - você pode preenchê-las manualmente.'}` 
              }); 
            } else { 
              toast({ 
                title: "Nenhum Corte Importado", 
                description: "Verifique se os dados estão preenchidos corretamente.", 
                variant: "destructive" 
              }); 
            }
        } catch (error) {
            toast({ 
              title: "Erro ao Processar Planilha", 
              description: `Falha ao ler arquivo: ${error.message}`, 
              variant: "destructive" 
            });
        } finally {
            event.target.value = null;
        }
    };
    reader.readAsArrayBuffer(file);
  };

  const loadDesossaToForm = (desossa) => {
    setIsLoadingForm(true);
    try {
      setCurrentDesossaId(desossa.id);
      setTipoAnimal(desossa.tipo_animal || 'bovino');
      setNumeroNotaFiscal(desossa.numero_nota_fiscal || '');
      setDataChegada(desossa.data_chegada || '');
      setPesoInicialBoi(String(desossa.peso_inicial_boi || ''));
      setCustoTotalCarcaça(String(desossa.custo_total_carcaca || ''));
      
      if (desossa.cortes_info && Array.isArray(desossa.cortes_info)) {
        const cortesCarregados = desossa.cortes_info.map((corte, index) => ({
          ...initialCorteState,
          id: Date.now() + index,
          codigo_produto: corte.codigo_produto || '',
          nome: corte.nome || '',
          peso: String(corte.peso || ''),
          preco_venda_kg: String(corte.preco_venda_kg || ''),
          parte_animal: corte.parte_animal || corte.parte_boi || '',
          parte_boi: corte.parte_boi || corte.parte_animal || '',
          rendimentoIndividual: corte.rendimentoIndividual || 0,
          receitaVendaCorte: corte.receitaVendaCorte || 0,
          indiceParticipacao: corte.indiceParticipacao || 0,
          novoCustoKg: corte.novoCustoKg || 0,
          margemLucro: corte.margemLucro || 0,
        }));
        setCortes(cortesCarregados);
      } else {
        setCortes([{...initialCorteState, id: Date.now()}]);
      }
      
      toast({ title: "Desossa Carregada", description: `Dados da desossa ${desossa.numero_nota_fiscal || desossa.id} carregados.` });
    } catch (error) {
      toast({ title: "Erro ao Carregar Desossa", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleSaveDesossa = async () => {
    if (!currentUser || !currentUser.id || !currentUser.cnpj) {
      toast({ title: "Erro de Autenticação", description: "Usuário não identificado.", variant: "destructive" });
      return;
    }
    
    if (!numeroNotaFiscal || !pesoInicialBoi || !custoTotalCarcaça) {
      toast({ title: "Dados Incompletos", description: "Preencha pelo menos o número da nota, peso inicial e custo total.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const desossaPayload = {
        user_id: currentUser.id,
        cnpj_empresa: currentUser.cnpj,
        numero_nota_fiscal: numeroNotaFiscal,
        data_chegada: dataChegada || null,
        peso_inicial_boi: parseFloat(pesoInicialBoi),
        custo_total_carcaca: parseFloat(custoTotalCarcaça),
        cortes_info: cortes.map(({id, ...rest}) => ({
          ...rest,
          peso: parseFloat(rest.peso) || 0,
          preco_venda_kg: parseFloat(rest.preco_venda_kg) || 0,
        })),
        resultados_consolidados: {}, // Será preenchido pelos cálculos
      };

      if (currentDesossaId && typeof currentDesossaId !== 'string') {
        // Atualizar desossa existente
        const { data, error } = await supabase
          .from('desossas_registradas')
          .update(desossaPayload)
          .eq('id', currentDesossaId)
          .eq('user_id', currentUser.id)
          .select();
        
        if (error) throw error;
        toast({ title: "Desossa Atualizada", description: "Dados salvos com sucesso!" });
      } else {
        // Criar nova desossa
        const { data, error } = await supabase
          .from('desossas_registradas')
          .insert([desossaPayload])
          .select();
        
        if (error) throw error;
        if (data && data.length > 0) {
          setCurrentDesossaId(data[0].id);
        }
        toast({ title: "Desossa Salva", description: "Nova desossa registrada com sucesso!" });
      }
    } catch (error) {
      toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearchDesossas = async () => {
    if (!currentUser || !currentUser.id || !currentUser.cnpj) {
      toast({ title: "Erro de Autenticação", description: "Usuário não identificado.", variant: "destructive" });
      return;
    }

    setIsSearching(true);
    try {
      let query = supabase
        .from('desossas_registradas')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('cnpj_empresa', currentUser.cnpj)
        .order('created_at', { ascending: false });

      if (searchTermDesossa.trim()) {
        // Buscar por número da nota ou data
        if (searchTermDesossa.includes('-')) {
          // Provavelmente uma data
          query = query.eq('data_chegada', searchTermDesossa);
        } else {
          // Provavelmente número da nota
          query = query.ilike('numero_nota_fiscal', `%${searchTermDesossa}%`);
        }
      }

      const { data, error } = await query.limit(20);
      
      if (error) throw error;
      setSearchResults(data || []);
      setSearchModalOpen(true);
      
      if (data && data.length > 0) {
        toast({ title: "Busca Concluída", description: `${data.length} desossa(s) encontrada(s).` });
      } else {
        toast({ title: "Nenhum Resultado", description: "Nenhuma desossa encontrada com os critérios informados." });
      }
    } catch (error) {
      toast({ title: "Erro na Busca", description: error.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  return {
    // Estados
    currentUser,
    isSaving,
    isSearching,
    isLoadingForm,
    tipoAnimal,
    numeroNotaFiscal,
    dataChegada,
    pesoInicialBoi,
    custoTotalCarcaça,
    cortes,
    searchTermDesossa,
    searchModalOpen,
    searchResults,
    currentDesossaId,
    
    // Setters
    setTipoAnimal,
    setNumeroNotaFiscal,
    setDataChegada,
    setPesoInicialBoi,
    setCustoTotalCarcaça,
    setCortes,
    setSearchTermDesossa,
    setSearchModalOpen,
    
    // Handlers
    resetForm,
    handleAddCorte,
    handleRemoveCorte,
    handleCorteChange,
    handleDownloadPlanilhaModeloDesossa,
    handleFileUpload,
    loadDesossaToForm,
    handleSaveDesossa,
    handleSearchDesossas
  };
};