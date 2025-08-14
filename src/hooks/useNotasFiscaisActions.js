import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';

export const useNotasFiscaisActions = ({
  currentUser,
  currentNota,
  parametrosRendimento,
  setNotas,
  setCurrentNota,
  setModalOpen,
  setIsSaving,
  fetchInitialData,
  toast
}) => {

  const handleSaveNota = async () => {
    if (!currentNota.numero_nota || !currentNota.data_nota) { 
      toast({ title: "Erro", description: "Número e Data da Nota são obrigatórios.", variant: "destructive" }); 
      return; 
    }
    if (!currentUser || !currentUser.id || !currentUser.cnpj) { 
      toast({ title: "Erro de Autenticação", description: "Usuário ou CNPJ não identificado.", variant: "destructive" }); 
      return; 
    }
    
    setIsSaving(true);
    const notaPayload = { 
      ...currentNota, 
      user_id: currentUser.id, 
      cnpj_emitente: currentNota.cnpj_emitente || currentUser.cnpj, 
      total_calculado: parseFloat(currentNota.total_calculado), 
      items: currentNota.items.map(({id, ...rest}) => rest) 
    };
    let isNewNota = typeof currentNota.id === 'string' && currentNota.id.startsWith('new_');
    if (isNewNota) delete notaPayload.id;

    try {
      let savedNotaData;
      if (isNewNota) {
        const { data, error } = await supabase.from('notas_fiscais').insert([notaPayload]).select();
        if (error) throw error;
        savedNotaData = data[0];
        setNotas(prev => [{...savedNotaData, items: savedNotaData.items.map((it, idx) => ({...it, id: Date.now() + idx + Math.random()})) }, ...prev]);
        toast({ title: "Sucesso", description: "Nota fiscal adicionada." });
      } else { 
        const { data, error } = await supabase.from('notas_fiscais').update(notaPayload).eq('id', currentNota.id).eq('user_id', currentUser.id).select();
        if (error) throw error;
        savedNotaData = data[0];
        setNotas(prev => prev.map(n => n.id === currentNota.id ? {...savedNotaData, items: savedNotaData.items.map((it, idx) => ({...it, id: Date.now() + idx + Math.random()}))} : n));
        toast({ title: "Sucesso", description: "Nota fiscal atualizada." });
      }

      const { error: rpcError } = await supabase.rpc('update_inventory_from_note', {
        items_jsonb: JSON.stringify(savedNotaData.items),
        user_uuid: currentUser.id,
        cnpj_text: currentUser.cnpj
      });
      if (rpcError) {
        console.error("RPC Error:", rpcError);
        throw new Error(`Erro ao atualizar o inventário: ${rpcError.message}`);
      }
      toast({ title: "Estoque Atualizado", description: "O inventário foi atualizado com os itens da nota." });
      fetchInitialData(currentUser); 
      setModalOpen(false); 
      setCurrentNota(null);
    } catch (error) {
      toast({ title: "Erro ao Salvar Nota", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNota = async (id) => {
    if (!id || (typeof id === 'string' && id.startsWith('new_')) || !currentUser || !currentUser.id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('notas_fiscais').delete().match({ id: id, user_id: currentUser.id }); 
      if (error) throw error;
      setNotas(prev => prev.filter(n => n.id !== id));
      toast({ title: "Sucesso", description: "Nota fiscal removida." });
    } catch (error) {
      toast({ title: "Erro ao Remover Nota", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUploadNF = (event) => {
    const file = event.target.files[0]; 
    if (!file || !currentUser) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result); 
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0]; 
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length < 2) { 
              toast({ title: "Erro Planilha", description: "Vazia ou formato inválido.", variant: "destructive" }); 
              return; 
            }
            
            const header = jsonData[0].map(h => String(h).toLowerCase().trim());
            const expectedHeader = ["numero_nota", "data_nota", "cnpj_emitente_nota", "codigo_produto_item", "descricao_item", "quantidade_item", "valor_unitario_item"];
            const missingHeaders = expectedHeader.filter(eh => !header.includes(eh));
            
            if (missingHeaders.length > 0) { 
              toast({ title: "Erro Cabeçalho", description: `Faltando: ${missingHeaders.join(', ')}. Use modelo.`, variant: "destructive", duration: 7000 }); 
              return; 
            }
            
            const notasAgrupadas = {};
            jsonData.slice(1).forEach(row => {
                const numero_nota = String(row[header.indexOf("numero_nota")] || ''); 
                if (!numero_nota) return;
                
                if (!notasAgrupadas[numero_nota]) {
                  notasAgrupadas[numero_nota] = { 
                    numero_nota, 
                    data_nota: String(row[header.indexOf("data_nota")] || ''), 
                    cnpj_emitente: String(row[header.indexOf("cnpj_emitente_nota")] || currentUser.cnpj), 
                    items: [], 
                    observacoes: String(row[header.indexOf("observacoes_nota")] || ''), 
                    user_id: currentUser.id, 
                    total_calculado: 0 
                  };
                }
                
                const item = { 
                  id: Date.now() + Math.random(), 
                  codigoProduto: String(row[header.indexOf("codigo_produto_item")] || ''), 
                  descricao: String(row[header.indexOf("descricao_item")] || ''), 
                  quantidade: parseFloat(String(row[header.indexOf("quantidade_item")] || '0')), 
                  valorUnitario: parseFloat(String(row[header.indexOf("valor_unitario_item")] || '0')) 
                };
                item.valorTotal = (item.quantidade * item.valorUnitario).toFixed(2);
                notasAgrupadas[numero_nota].items.push(item);
            });
            
            const notasImportadas = Object.values(notasAgrupadas).map(nota => ({
              ...nota, 
              total_calculado: nota.items.reduce((sum, item) => sum + parseFloat(item.valorTotal), 0).toFixed(2) 
            }));
            
            if (notasImportadas.length > 0) {
                const { error } = await supabase.from('notas_fiscais').insert(notasImportadas.map(n => ({...n, items: n.items.map(({id, ...rest}) => rest)})));
                if (error) throw error;
                toast({ title: "Planilha Carregada", description: `${notasImportadas.length} notas importadas.` });
                fetchInitialData(currentUser);
            } else { 
              toast({ title: "Nenhuma Nota Importada", description: "Verifique os dados.", variant: "destructive" }); 
            }
        } catch (error) {
            toast({ title: "Erro Processar Planilha", description: error.message, variant: "destructive" });
        } finally { 
          event.target.value = null; 
        }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAplicarRendimento = async (itemIndexNaNota) => {
    const itemOriginal = currentNota.items[itemIndexNaNota];
    if (!itemOriginal || !itemOriginal.parte_boi) {
        toast({ title: "Seleção Inválida", description: "Selecione uma 'Parte do Boi' para aplicar o rendimento.", variant: "destructive" });
        return;
    }

    const parteBoiSelecionada = itemOriginal.parte_boi;
    const parametroEncontrado = parametrosRendimento.find(p => p.codigo_peca.toLowerCase() === parteBoiSelecionada.toLowerCase());
    
    if (!parametroEncontrado) {
        toast({
            title: "Parâmetro de rendimento não encontrado",
            description: (
              React.createElement('div', null,
                React.createElement('p', null, `Nenhum parâmetro para "${parteBoiSelecionada}".`),
                React.createElement('p', null, 
                  'Use o código ',
                  React.createElement('span', { className: 'font-bold text-primary' }, parteBoiSelecionada),
                  ' para cadastrar.'
                ),
                React.createElement(Link, {
                  to: '/app/parametros',
                  className: "text-sm text-primary underline hover:text-primary/80"
                }, 'Ir para Parâmetros de Rendimento')
              )
            ),
            variant: "destructive",
            duration: 10000,
          });
        return;
    }
    
    setIsSaving(true);
    try {
        const { data: desossasRef, error: desossasError } = await supabase
            .from('desossas_registradas')
            .select('cortes_info, peso_inicial_boi, custo_total_carcaca')
            .eq('user_id', currentUser.id)
            .eq('cnpj_empresa', currentUser.cnpj)
            .order('created_at', { ascending: false })
            .limit(10);

        if (desossasError) throw desossasError;

        const desossasComParte = desossasRef.filter(desossa => 
            desossa.cortes_info && 
            desossa.cortes_info.some(corte => 
                corte.parte_boi && corte.parte_boi.toLowerCase() === parteBoiSelecionada.toLowerCase()
            )
        );
        
        if (desossasComParte.length === 0) {
            toast({ 
                title: "Desossa de Referência não encontrada", 
                description: `Não foi encontrada uma desossa anterior detalhando "${parametroEncontrado.descricao_peca}" para usar como base.`, 
                variant: "info", 
                duration: 8000
            });
            setIsSaving(false);
            return;
        }

        const cortesAgrupados = {};
        let totalDesossasValidas = 0;

        desossasComParte.forEach(desossa => {
            const cortesDaParte = desossa.cortes_info.filter(c => 
                c.parte_boi && c.parte_boi.toLowerCase() === parteBoiSelecionada.toLowerCase()
            );
            
            if (cortesDaParte.length > 0) {
                totalDesossasValidas++;
                const pesoTotalDaParteNaDesossa = cortesDaParte.reduce((sum, corte) => sum + parseFloat(corte.peso || 0), 0);
                
                cortesDaParte.forEach(corte => {
                    const nomeCorte = corte.nome || 'Sem Nome';
                    if (!cortesAgrupados[nomeCorte]) {
                        cortesAgrupados[nomeCorte] = {
                            codigo_produto: corte.codigo_produto || '',
                            nome: nomeCorte,
                            parte_boi: corte.parte_boi,
                            percentualRendimento: 0,
                            custoMedio: 0,
                            contadorDesossas: 0
                        };
                    }
                    
                    const percentualRendimentoCorte = pesoTotalDaParteNaDesossa > 0 ? 
                        (parseFloat(corte.peso || 0) / pesoTotalDaParteNaDesossa) * 100 : 0;
                    
                    cortesAgrupados[nomeCorte].percentualRendimento += percentualRendimentoCorte;
                    cortesAgrupados[nomeCorte].custoMedio += parseFloat(corte.novoCustoKg || 0);
                    cortesAgrupados[nomeCorte].contadorDesossas++;
                });
            }
        });

        if (Object.keys(cortesAgrupados).length === 0) {
            toast({ 
                title: "Sem Cortes Detalhados", 
                description: `As desossas de referência não possuem cortes específicos para "${parametroEncontrado.descricao_peca}".`, 
                variant: "info", 
                duration: 7000
            });
            setIsSaving(false);
            return;
        }

        const cortesComMedias = Object.values(cortesAgrupados).map(corte => ({
            ...corte,
            percentualRendimentoMedio: corte.percentualRendimento / corte.contadorDesossas,
            custoMedio: corte.custoMedio / corte.contadorDesossas
        }));

        const valorTotalNota = parseFloat(currentNota.total_calculado || 0);
        const novosItens = cortesComMedias.map(corteMedia => {
            const quantidadeEstimada = parseFloat(itemOriginal.quantidade || 0) * (corteMedia.percentualRendimentoMedio / 100);
            
            const somaRendimentos = cortesComMedias.reduce((sum, c) => sum + c.percentualRendimentoMedio, 0);
            const indiceParticipacao = somaRendimentos > 0 ? (corteMedia.percentualRendimentoMedio / somaRendimentos) * 100 : 0;
            
            const custoEntrada = valorTotalNota > 0 ? (indiceParticipacao / 100) * valorTotalNota : corteMedia.custoMedio;
            const valorUnitarioCalculado = quantidadeEstimada > 0 ? custoEntrada / quantidadeEstimada : corteMedia.custoMedio;
            
            return {
                id: Date.now() + Math.random(),
                codigoProduto: corteMedia.codigo_produto || `AUT-${parametroEncontrado.codigo_peca}-${Math.random().toString(36).substr(2,5).toUpperCase()}`,
                descricao: corteMedia.nome,
                quantidade: quantidadeEstimada.toFixed(3),
                valorUnitario: valorUnitarioCalculado.toFixed(2),
                valorTotal: custoEntrada.toFixed(2),
                parte_boi: corteMedia.parte_boi,
            };
        });

        const itemsAtuais = [...currentNota.items];
        itemsAtuais.splice(itemIndexNaNota, 1, ...novosItens);
        
        const totalCalculado = itemsAtuais.reduce((sum, item) => sum + parseFloat(item.valorTotal || 0), 0);
        setCurrentNota(prev => ({ ...prev, items: itemsAtuais, total_calculado: totalCalculado.toFixed(2) }));
        
        toast({ 
            title: "Rendimento Aplicado com Sucesso", 
            description: `Item foi detalhado em ${novosItens.length} cortes baseado na média de ${totalDesossasValidas} desossa(s). Custos calculados proporcionalmente.` 
        });

    } catch (error) {
        toast({ title: "Erro ao Aplicar Rendimento", description: error.message, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  return {
    handleSaveNota,
    handleDeleteNota,
    handleFileUploadNF,
    handleAplicarRendimento,
  };
};