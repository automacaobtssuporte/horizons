import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { AUTH_KEY } from '@/config/constants';
import * as XLSX from 'xlsx';
import { exportSimulacaoToPDF } from '@/utils/simulacaoPdfExport';

export const useSimulacaoActions = () => {
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem(AUTH_KEY));

  const salvarSimulacao = async (nomeSimulacao, observacoes, itensSimulacao, selectedSimulacaoId) => {
    if (!user || !user.id || !user.cnpj) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      return { success: false };
    }
    if (!nomeSimulacao.trim()) {
      toast({ title: "Erro", description: "Nome da simulação é obrigatório.", variant: "destructive" });
      return { success: false };
    }
    if (itensSimulacao.length === 0 || itensSimulacao.every(item => !item.codigo && !item.nome)) {
      toast({ title: "Erro", description: "Adicione pelo menos um item à simulação.", variant: "destructive" });
      return { success: false };
    }

    try {
      const simulacaoData = {
        user_id: user.id,
        cnpj_empresa: user.cnpj,
        nome_simulacao: nomeSimulacao,
        data_simulacao: new Date().toISOString().split('T')[0],
        itens_simulacao: itensSimulacao.filter(item => item.codigo || item.nome),
        observacoes: observacoes
      };

      let result;
      if (selectedSimulacaoId) {
        result = await supabase
          .from('simulacoes_precos')
          .update(simulacaoData)
          .eq('id', selectedSimulacaoId)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('simulacoes_precos')
          .insert([simulacaoData]);
      }

      if (result.error) throw result.error;

      toast({ 
        title: "Simulação Salva", 
        description: selectedSimulacaoId ? "Simulação atualizada com sucesso!" : "Simulação salva com sucesso!" 
      });

      return { success: true };
    } catch (error) {
      toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
      return { success: false };
    }
  };

  const exportarExcel = (itensSimulacao, nomeSimulacao, calcularTotalVendaAtual, calcularMargemAtual) => {
    if (itensSimulacao.length === 0 || itensSimulacao.every(item => !item.codigo && !item.nome)) {
      toast({ title: "Erro", description: "Nenhum item para exportar.", variant: "destructive" });
      return;
    }

    try {
      const worksheetData = [
        [
          'Código', 'Nome', 'Peso (kg)', 'Custo Atual (R$)', 'Preço Venda Atual (R$/kg)', 
          'Total Venda Atual (R$)', 'Margem Atual (%)', 'Nova Margem (%)', 
          'Preço Oferta (R$/kg)', 'Novo Preço Venda (R$/kg)', 'Total da Venda (R$)', 
          'Novo Custo (R$)', 'Nova Margem Calc. (%)'
        ],
        ...itensSimulacao
          .filter(item => item.codigo || item.nome)
          .map(item => [
            item.codigo || '',
            item.nome || '',
            item.peso || '',
            item.custoAtual || '',
            item.precoVendaAtual || '',
            calcularTotalVendaAtual(item.precoVendaAtual, item.peso),
            calcularMargemAtual(item.custoAtual, item.precoVendaAtual).replace('%', ''),
            item.novaMargem || '',
            item.precoOferta || '',
            item.novoPrecoVenda || '',
            item.totalVenda || '',
            item.novoCusto || '',
            item.novaMargemCalculada || ''
          ])
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
          if (!worksheet[cell_address]) continue;
          
          if (R === 0) {
            worksheet[cell_address].s = { font: { bold: true }, fill: { fgColor: { rgb: "CCCCCC" } } };
          }
        }
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Simulação de Preços");
      
      const fileName = `Simulacao_Precos_${nomeSimulacao || 'Nova'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({ title: "Excel Exportado", description: "Planilha baixada com sucesso!" });
    } catch (error) {
      toast({ title: "Erro na Exportação", description: error.message, variant: "destructive" });
    }
  };

  const exportarPDF = (itensSimulacao, nomeSimulacao, observacoes, calcularTotalVendaAtual, calcularMargemAtual) => {
    if (itensSimulacao.length === 0 || itensSimulacao.every(item => !item.codigo && !item.nome)) {
      toast({ title: "Erro", description: "Nenhum item para exportar.", variant: "destructive" });
      return;
    }

    try {
      const dadosSimulacao = {
        nomeSimulacao: nomeSimulacao || 'Simulação de Preços',
        dataSimulacao: new Date().toLocaleDateString('pt-BR'),
        observacoes: observacoes,
        cnpjEmpresa: user.cnpj,
        nomeEmpresa: user.storeName
      };

      const itensParaExport = itensSimulacao
        .filter(item => item.codigo || item.nome)
        .map(item => ({
          ...item,
          totalVendaAtual: calcularTotalVendaAtual(item.precoVendaAtual, item.peso),
          margemAtual: calcularMargemAtual(item.custoAtual, item.precoVendaAtual)
        }));

      const doc = exportSimulacaoToPDF(dadosSimulacao, itensParaExport);
      const fileName = `Simulacao_Precos_${nomeSimulacao || 'Nova'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({ title: "PDF Exportado", description: "Relatório baixado com sucesso!" });
    } catch (error) {
      toast({ title: "Erro na Exportação", description: error.message, variant: "destructive" });
    }
  };

  return {
    salvarSimulacao,
    exportarExcel,
    exportarPDF
  };
};