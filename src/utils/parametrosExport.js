import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { APP_NAME } from '@/config/constants';

export const exportToExcel = (parametros, resultados) => {
  const wb = XLSX.utils.book_new();

  const parametrosData = parametros.map(p => ({
    'Cód. Peça': p.codigo_peca,
    'Nome da Peça': p.nome_peca,
    'Parte do Animal': p.nome_parte_animal,
    'Rendimento (%)': p.rendimento_percentual,
    'Preço Venda (R$/kg)': p.preco_venda_kg || 0,
  }));
  const wsParametros = XLSX.utils.json_to_sheet(parametrosData);
  XLSX.utils.book_append_sheet(wb, wsParametros, 'Parâmetros Cadastrados');

  if (resultados && resultados.length > 0) {
    const resultadosData = resultados.map(r => ({
      'Peça': `${r.nome} (${r.codigo_peca})`,
      'Peso (kg)': r.peso,
      'Preço Venda (R$/kg)': r.precoVendaKg,
      'Valor Peça (R$)': r.valorPeca,
      '% Peso': r.percentualPeso,
      '% Venda': r.percentualVenda,
      'Novo Custo (R$/kg)': r.novoCustoUnitario,
      'Margem (%)': r.margem,
    }));
    const wsResultados = XLSX.utils.json_to_sheet(resultadosData);
    XLSX.utils.book_append_sheet(wb, wsResultados, 'Resultados do Cálculo');
  }

  XLSX.writeFile(wb, 'parametros_rendimento.xlsx');
};

export const exportToPDF = (parametros, resultados) => {
  const doc = new jsPDF();
  const primaryColor = [59, 130, 246];
  const lightGray = [249, 250, 251];
  let yPosition = 25;

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Parâmetros de Rendimento', 14, 14);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Parâmetros Cadastrados', 14, yPosition);
  yPosition += 7;

  doc.autoTable({
    startY: yPosition,
    head: [['Cód. Peça', 'Nome da Peça', 'Parte do Animal', 'Rendimento (%)', 'Preço Venda (R$/kg)']],
    body: parametros.map(p => [
      p.codigo_peca,
      p.nome_peca,
      p.nome_parte_animal,
      p.rendimento_percentual,
      `R$ ${parseFloat(p.preco_venda_kg || 0).toFixed(2)}`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: lightGray },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  if (resultados && resultados.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resultados do Cálculo de Rendimento', 14, yPosition);
    yPosition += 7;

    doc.autoTable({
      startY: yPosition,
      head: [['Peça', 'Peso (kg)', 'Preço (R$/kg)', 'Valor (R$)', '% Peso', '% Venda', 'Novo Custo (R$/kg)', 'Margem (%)']],
      body: resultados.map(r => [
        `${r.nome} (${r.codigo_peca})`,
        r.peso,
        `R$ ${r.precoVendaKg}`,
        `R$ ${r.valorPeca}`,
        r.percentualPeso,
        r.percentualVenda,
        `R$ ${r.novoCustoUnitario}`,
        r.margem,
      ]),
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: lightGray },
      styles: { fontSize: 8 },
    });
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`${APP_NAME} - Página ${i} de ${pageCount}`, 14, 285);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 150, 285);
  }

  doc.save('parametros_rendimento.pdf');
};