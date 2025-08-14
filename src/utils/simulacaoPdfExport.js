import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { APP_NAME } from '@/config/constants';

export const exportSimulacaoToPDF = (dadosSimulacao, itens) => {
  const doc = new jsPDF();
  
  // Configurações de estilo
  const primaryColor = [59, 130, 246]; // blue-500
  const textColor = [55, 65, 81]; // gray-700
  const lightGray = [249, 250, 251]; // gray-50
  const successColor = [34, 197, 94]; // green-500
  const warningColor = [245, 158, 11]; // amber-500
  
  // Cabeçalho
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Simulação de Preços de Venda', 20, 16);
  
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 150, 22);
  
  let yPosition = 35;
  
  // Dados da Simulação
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados da Simulação', 20, yPosition);
  yPosition += 10;
  
  const dadosSimulacaoTable = [
    ['Nome da Simulação', dadosSimulacao.nomeSimulacao || 'N/A'],
    ['Data da Simulação', dadosSimulacao.dataSimulacao || 'N/A'],
    ['CNPJ da Empresa', dadosSimulacao.cnpjEmpresa || 'N/A'],
    ['Nome da Empresa', dadosSimulacao.nomeEmpresa || 'N/A'],
    ['Observações', dadosSimulacao.observacoes || 'Nenhuma observação']
  ];
  
  doc.autoTable({
    startY: yPosition,
    head: [['Item', 'Valor']],
    body: dadosSimulacaoTable,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: lightGray },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 10 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Verificar se precisa de nova página
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Detalhes dos Itens da Simulação
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhes da Simulação de Preços', 20, yPosition);
  yPosition += 10;
  
  const itensHeaders = [
    'Código', 'Nome', 'Peso (kg)', 'Custo Atual (R$)', 
    'Preço Atual (R$/kg)', 'Total Atual (R$)', 'Margem Atual',
    'Novo Preço (R$/kg)', 'Total Venda (R$)', 'Novo Custo (R$)', 'Nova Margem'
  ];
  
  const itensData = itens.map(item => [
    item.codigo || '',
    item.nome || '',
    item.peso || '0',
    item.custoAtual || '0',
    item.precoVendaAtual || '0',
    item.totalVendaAtual || '0',
    item.margemAtual || 'N/A',
    item.novoPrecoVenda || '0',
    item.totalVenda || '0',
    item.novoCusto || '0',
    item.novaMargemCalculada ? item.novaMargemCalculada + '%' : 'N/A'
  ]);
  
  doc.autoTable({
    startY: yPosition,
    head: [itensHeaders],
    body: itensData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: lightGray },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 15 }, // Código
      1: { cellWidth: 22 }, // Nome
      2: { cellWidth: 12 }, // Peso
      3: { cellWidth: 16 }, // Custo Atual
      4: { cellWidth: 16 }, // Preço Atual
      5: { cellWidth: 16 }, // Total Atual
      6: { cellWidth: 14 }, // Margem Atual
      7: { cellWidth: 16 }, // Novo Preço
      8: { cellWidth: 16 }, // Total Venda
      9: { cellWidth: 16 }, // Novo Custo
      10: { cellWidth: 14 }  // Nova Margem
    }
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Verificar se precisa de nova página
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Resumo Consolidado com Dashboard de Margem
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Dashboard de Margem e Lucratividade', 20, yPosition);
  yPosition += 10;
  
  // Calcular totais para o dashboard
  const totalItens = itens.length;
  const totalPesoAtual = itens.reduce((sum, item) => sum + (parseFloat(item.peso) || 0), 0);
  const receitaTotalEstimada = itens.reduce((sum, item) => sum + (parseFloat(item.totalVenda) || 0), 0);
  const custoTotalEstimado = itens.reduce((sum, item) => sum + (parseFloat(item.novoCusto) || 0), 0);
  const lucroTotalEstimado = receitaTotalEstimada - custoTotalEstimado;
  const margemLucroPercentual = receitaTotalEstimada > 0 ? (lucroTotalEstimado / receitaTotalEstimada) * 100 : 0;
  
  const resumoData = [
    ['Total de Itens Simulados', totalItens.toString()],
    ['Peso Total (kg)', totalPesoAtual.toFixed(2)],
    ['Receita Total Estimada (R$)', receitaTotalEstimada.toFixed(2)],
    ['Custo Total Estimado (R$)', custoTotalEstimado.toFixed(2)],
    ['Lucro Total Estimado (R$)', lucroTotalEstimado.toFixed(2)],
    ['Margem de Lucro (%)', margemLucroPercentual.toFixed(2) + '%']
  ];
  
  doc.autoTable({
    startY: yPosition,
    head: [['Indicador', 'Valor']],
    body: resumoData,
    theme: 'grid',
    headStyles: { fillColor: successColor, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: lightGray },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 10 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Observações sobre as Fórmulas
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Fórmulas Utilizadas', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Novo Custo = (Quantidade × Preço de Venda) × Índice de Participação %', 20, yPosition);
  yPosition += 6;
  doc.text('2. Margem de Lucro = (Lucro ÷ Receita Total Estimada) × 100', 20, yPosition);
  yPosition += 6;
  doc.text('3. Total da Venda = Preço de Venda × Peso', 20, yPosition);
  yPosition += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Interpretação da Margem de Lucro:', 20, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('• ≥ 30%: Excelente lucratividade', 20, yPosition);
  yPosition += 5;
  doc.text('• 15-29%: Boa lucratividade', 20, yPosition);
  yPosition += 5;
  doc.text('• < 15%: Atenção necessária', 20, yPosition);
  
  // Rodapé
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`${APP_NAME} - Página ${i} de ${pageCount}`, 20, 285);
    doc.text(`Simulação gerada automaticamente em ${new Date().toLocaleDateString('pt-BR')}`, 120, 285);
  }
  
  return doc;
};