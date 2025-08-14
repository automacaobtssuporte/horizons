import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { APP_NAME } from '@/config/constants';
import * as XLSX from 'xlsx';
import { exportToPDF } from '@/utils/pdfExport';

export const useDesossaExportManager = () => {
  const { toast } = useToast();

  const handleExportResultadosExcel = (
    tipoAnimal,
    numeroNotaFiscal,
    dataChegada,
    pesoInicialBoi,
    custoTotalCarcaça,
    cortes,
    resultados
  ) => {
    if (!pesoInicialBoi && cortes.length === 1 && !cortes[0].nome) { 
      toast({ title: "Nada para Exportar", description: "Preencha ou calcule os dados primeiro.", variant: "default" }); 
      return; 
    }
    
    const wb = XLSX.utils.book_new();
    const tipoAnimalLabel = tipoAnimal === 'suino' ? 'Suíno' : 'Bovino';
    
    const dadosCarcaça = [
        ["Tipo de Animal", tipoAnimalLabel],
        ["Número Nota Fiscal", numeroNotaFiscal || 'N/A'], 
        ["Data Chegada", dataChegada ? new Date(dataChegada + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'],
        ["Peso Inicial (kg)", pesoInicialBoi || 'N/A'], 
        ["Custo Total Carcaça (R$)", custoTotalCarcaça || 'N/A']
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dadosCarcaça), "Dados Carcaça");
    
    const detalhesCortesHeader = ["Cód. Produto", "Nome", "Peso (kg)", "Preço Venda (R$/kg)", `Parte do ${tipoAnimalLabel}`, "Rend. (%)", "Índice Part. (%)", "Novo Custo (R$/kg)", "Margem (%)", "Receita (R$)"];
    const detalhesCortesData = cortes.map(c => [ 
      c.codigo_produto, c.nome, c.peso, c.preco_venda_kg, c.parte_animal || c.parte_boi, 
      c.rendimentoIndividual, c.indiceParticipacao, c.novoCustoKg, c.margemLucro, c.receitaVendaCorte 
    ]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([detalhesCortesHeader, ...detalhesCortesData]), "Detalhes dos Cortes");
    
    const resultadosConsolidadosData = [
        ["Item", "Valor"], 
        ["Rendimento Total (%)", resultados.rendimentoTotalCalculado], 
        ["Custo Total Após Desossa (R$)", resultados.custoTotalAposDesossaCalculado],
        ["Receita Total Estimada (R$)", resultados.receitaTotalVendaCalculada],
        ["Custo Total Descarte (R$)", resultados.custoTotalDescarte], 
        ["Lucro Bruto Estimado (R$)", resultados.lucroTotalEstimado]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resultadosConsolidadosData), "Resultados Consolidados");

    if (resultados.dadosAnalisePartes.length > 0) {
      const analisePartesHeader = [`Parte do ${tipoAnimalLabel}`, "Peso Total (kg)", "Receita Total (R$)", "Custo Total (R$)", "Lucro/Prejuízo (R$)"];
      const analisePartesData = resultados.dadosAnalisePartes.map(p => [p.nome, p.pesoTotal, p.receitaTotal, p.custoTotal, p.lucroPrejuizo]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([analisePartesHeader, ...analisePartesData]), "Análise por Parte");
    }

    XLSX.writeFile(wb, `Resultado_Desossa_${tipoAnimalLabel}_${numeroNotaFiscal || 'Atual'}_${APP_NAME}.xlsx`);
    toast({ title: "Exportação Excel Concluída", description: "Resultados exportados em Excel."});
  };

  const handleExportResultadosPDF = (
    tipoAnimal,
    numeroNotaFiscal,
    dataChegada,
    pesoInicialBoi,
    custoTotalCarcaça,
    cortes,
    resultados
  ) => {
    if (!pesoInicialBoi && cortes.length === 1 && !cortes[0].nome) { 
      toast({ title: "Nada para Exportar", description: "Preencha ou calcule os dados primeiro.", variant: "default" }); 
      return; 
    }

    try {
      const dadosDesossa = {
        tipoAnimal,
        numeroNotaFiscal,
        dataChegada,
        pesoInicialBoi,
        custoTotalCarcaça
      };

      const doc = exportToPDF(dadosDesossa, resultados, cortes);
      const tipoAnimalLabel = tipoAnimal === 'suino' ? 'Suino' : 'Bovino';
      doc.save(`Relatorio_Desossa_${tipoAnimalLabel}_${numeroNotaFiscal || 'Atual'}_${APP_NAME}.pdf`);
      
      toast({ title: "Exportação PDF Concluída", description: "Relatório exportado em PDF." });
    } catch (error) {
      toast({ title: "Erro na Exportação PDF", description: error.message, variant: "destructive" });
    }
  };

  return {
    handleExportResultadosExcel,
    handleExportResultadosPDF
  };
};