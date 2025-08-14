import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { APP_NAME } from '@/config/constants';

export const exportToPDF = (dadosDesossa, resultados, cortes) => {
  const doc = new jsPDF();
  const tipoAnimalLabel = dadosDesossa.tipoAnimal === 'suino' ? 'Suíno' : 'Bovino';
  
  // Configurações de estilo
  const primaryColor = [59, 130, 246]; // blue-500
  const textColor = [55, 65, 81]; // gray-700
  const lightGray = [249, 250, 251]; // gray-50
  
  // Cabeçalho
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Relatório de Desossa - ${tipoAnimalLabel}`, 20, 16);
  
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 150, 22);
  
  let yPosition = 35;
  
  // Dados da Carcaça
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados da Carcaça', 20, yPosition);
  yPosition += 10;
  
  const dadosCarcaca = [
    ['Tipo de Animal', tipoAnimalLabel],
    ['Número Nota Fiscal', dadosDesossa.numeroNotaFiscal || 'N/A'],
    ['Data de Chegada', dadosDesossa.dataChegada ? new Date(dadosDesossa.dataChegada + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'],
    ['Peso Inicial (kg)', dadosDesossa.pesoInicialBoi || 'N/A'],
    ['Custo Total Carcaça (R$)', dadosDesossa.custoTotalCarcaça || 'N/A']
  ];
  
  doc.autoTable({
    startY: yPosition,
    head: [['Item', 'Valor']],
    body: dadosCarcaca,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: lightGray },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 10 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Detalhes dos Cortes
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhes dos Cortes', 20, yPosition);
  yPosition += 10;
  
  const cortesHeaders = [
    'Código', 'Nome', 'Peso (kg)', 'Preço (R$/kg)', 
    `Parte ${tipoAnimalLabel}`, 'Rend. (%)', 'Índice (%)', 
    'Novo Custo (R$/kg)', 'Margem (%)'
  ];
  
  const cortesData = cortes.map(corte => [
    corte.codigo_produto || '',
    corte.nome || '',
    corte.peso || '',
    corte.preco_venda_kg || '',
    corte.parte_animal || corte.parte_boi || '',
    corte.rendimentoIndividual || '0',
    corte.indiceParticipacao || '0',
    corte.novoCustoKg || '0',
    corte.margemLucro || '0'
  ]);
  
  doc.autoTable({
    startY: yPosition,
    head: [cortesHeaders],
    body: cortesData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: lightGray },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 25 },
      2: { cellWidth: 15 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 15 },
      6: { cellWidth: 15 },
      7: { cellWidth: 20 },
      8: { cellWidth: 15 }
    }
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Verificar se precisa de nova página
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Resultados Consolidados
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resultados Consolidados', 20, yPosition);
  yPosition += 10;
  
  const resultadosData = [
    ['Rendimento Total (%)', resultados.rendimentoTotalCalculado || '0'],
    ['Custo Total Após Desossa (R$)', resultados.custoTotalAposDesossaCalculado || '0'],
    ['Receita Total Estimada (R$)', resultados.receitaTotalVendaCalculada || '0'],
    ['Custo Total Descarte (R$)', resultados.custoTotalDescarte || '0'],
    ['Lucro Bruto Estimado (R$)', resultados.lucroTotalEstimado || '0']
  ];
  
  doc.autoTable({
    startY: yPosition,
    head: [['Indicador', 'Valor']],
    body: resultadosData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: lightGray },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 10 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Análise por Parte (se houver dados)
  if (resultados.dadosAnalisePartes && resultados.dadosAnalisePartes.length > 0) {
    // Verificar se precisa de nova página
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Análise de Lucratividade por Parte do ${tipoAnimalLabel}`, 20, yPosition);
    yPosition += 10;
    
    const analiseHeaders = [`Parte do ${tipoAnimalLabel}`, 'Peso (kg)', 'Receita (R$)', 'Custo (R$)', 'Lucro/Prejuízo (R$)'];
    const analiseData = resultados.dadosAnalisePartes.map(parte => [
      parte.nome || '',
      parte.pesoTotal || '0',
      parte.receitaTotal || '0',
      parte.custoTotal || '0',
      parte.lucroPrejuizo || '0'
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [analiseHeaders],
      body: analiseData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: lightGray },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
  }
  
  // Rodapé
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`${APP_NAME} - Página ${i} de ${pageCount}`, 20, 285);
    doc.text(`Relatório gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')}`, 120, 285);
  }
  
  return doc;
};