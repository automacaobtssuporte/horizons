import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, FileDown, FileType, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { AUTH_KEY, APP_NAME } from '@/config/constants';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DREPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const initialDreState = {
    id: null, start_date: '', end_date: '',
    receita_carnes_bovinas: '', receita_outras_carnes: '', receita_produtos_comp: '',
    deducao_devolucoes: '', deducao_descontos: '', deducao_impostos_vendas: '',
    cmv_compra_carne: '', cmv_perdas: '', cmv_embalagens: '', cmv_desossa: '',
    despesa_salarios: '', despesa_aluguel: '', despesa_energia: '', despesa_agua: '', despesa_internet_telefone: '', despesa_software: '',
    despesa_limpeza: '', despesa_consertos: '', despesa_uniformes_epis: '',
    despesa_contabilidade: '', despesa_taxas_bancarias: '', despesa_transporte: '',
    outras_receitas: '', outras_despesas: '',
    impostos_sobre_lucro: '',
  };

  const [dreData, setDreData] = useState(initialDreState);
  const [calculatedData, setCalculatedData] = useState(null);
  const [savedDres, setSavedDres] = useState([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem(AUTH_KEY));
    setCurrentUser(user);
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setDreData(prev => ({ ...prev, [id]: value }));
  };

  const pFloat = (val) => {
    if (typeof val === 'string' && val.trim() === '') return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const calculateDRE = () => {
    const receitaBruta = pFloat(dreData.receita_carnes_bovinas) + pFloat(dreData.receita_outras_carnes) + pFloat(dreData.receita_produtos_comp);
    const totalDeducoes = pFloat(dreData.deducao_devolucoes) + pFloat(dreData.deducao_descontos) + pFloat(dreData.deducao_impostos_vendas);
    const receitaLiquida = receitaBruta - totalDeducoes;
    const totalCMV = pFloat(dreData.cmv_compra_carne) + pFloat(dreData.cmv_perdas) + pFloat(dreData.cmv_embalagens) + pFloat(dreData.cmv_desossa);
    const lucroBruto = receitaLiquida - totalCMV;
    const totalDespesasOperacionais = pFloat(dreData.despesa_salarios) + pFloat(dreData.despesa_aluguel) + pFloat(dreData.despesa_energia) + pFloat(dreData.despesa_agua) + pFloat(dreData.despesa_internet_telefone) + pFloat(dreData.despesa_software) + pFloat(dreData.despesa_limpeza) + pFloat(dreData.despesa_consertos) + pFloat(dreData.despesa_uniformes_epis) + pFloat(dreData.despesa_contabilidade) + pFloat(dreData.despesa_taxas_bancarias) + pFloat(dreData.despesa_transporte);
    const lucroOperacional = lucroBruto - totalDespesasOperacionais;
    const lucroAntesImpostos = lucroOperacional + pFloat(dreData.outras_receitas) - pFloat(dreData.outras_despesas);
    const lucroLiquido = lucroAntesImpostos - pFloat(dreData.impostos_sobre_lucro);

    return {
      receitaBruta, totalDeducoes, receitaLiquida, totalCMV, lucroBruto, totalDespesasOperacionais, lucroOperacional, lucroAntesImpostos, lucroLiquido,
    };
  };
  
  useEffect(() => {
    setCalculatedData(calculateDRE());
  }, [dreData]);
  
  const handleNewDRE = () => {
    setDreData(initialDreState);
    toast({ title: "Pronto!", description: "Formulário limpo para um novo DRE." });
  };

  const handleSearchDRE = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dre_reports')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('cnpj_empresa', currentUser.cnpj)
        .order('start_date', { ascending: false });
      if (error) throw error;
      setSavedDres(data);
      setIsSearchModalOpen(true);
    } catch (error) {
      toast({ title: "Erro ao buscar DREs", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadDre = (report) => {
    const loadedData = { ...initialDreState };
    for (const key in report) {
      if (key in loadedData) {
        loadedData[key] = report[key] === null ? '' : report[key];
      }
    }
    setDreData(loadedData);
    setIsSearchModalOpen(false);
    toast({ title: "DRE Carregado", description: `Dados de ${report.start_date} a ${report.end_date} carregados.` });
  };

  const handleDeleteDRE = async () => {
    if (!dreData.id) {
      toast({ title: "Atenção", description: "Nenhum DRE salvo está carregado para exclusão.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('dre_reports').delete().eq('id', dreData.id);
      if (error) throw error;
      toast({ title: "Sucesso!", description: "Relatório DRE excluído com sucesso." });
      handleNewDRE();
    } catch (error) {
      toast({ title: "Erro ao Excluir", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async () => {
    if (!dreData.start_date || !dreData.end_date) {
      toast({ title: "Erro", description: "As datas de início e fim são obrigatórias.", variant: "destructive" });
      return;
    }
    if (new Date(dreData.start_date) > new Date(dreData.end_date)) {
      toast({ title: "Erro de Validação", description: "A data de início não pode ser posterior à data de fim.", variant: "destructive" });
      return;
    }
    if (!currentUser) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      return;
    }
    setLoading(true);
    
    const payload = { 
      user_id: currentUser.id, 
      cnpj_empresa: currentUser.cnpj, 
      ...Object.fromEntries(Object.entries(dreData).map(([key, value]) => {
        if (key === 'id' && !value) return [key, undefined]; // Dont send null id for insert
        if (key.endsWith('_date')) return [key, value];
        return [key, pFloat(value)];
      }))
    };
    if (!payload.id) delete payload.id;

    try {
      const { data, error } = await supabase.from('dre_reports').upsert(payload, { onConflict: 'id' }).select().single();
      if (error) throw error;
      setDreData(prev => ({...prev, id: data.id}));
      toast({ title: "Sucesso!", description: "Relatório DRE salvo com sucesso." });
    } catch (error) {
      toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (value) => (isNaN(value) ? 'R$ 0,00' : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  
  const exportToExcel = () => {
    if (!calculatedData) return;
    const data = [
      { Categoria: 'Receita Bruta de Vendas', Item: 'Vendas de carnes bovinas', Valor: pFloat(dreData.receita_carnes_bovinas) },
      { Categoria: '', Item: 'Vendas de suínos, aves e embutidos', Valor: pFloat(dreData.receita_outras_carnes) },
      { Categoria: '', Item: 'Vendas de produtos complementares', Valor: pFloat(dreData.receita_produtos_comp) },
      { Categoria: '(-) Deduções da Receita', Item: 'Devoluções', Valor: pFloat(dreData.deducao_devolucoes) },
      { Categoria: '', Item: 'Descontos comerciais', Valor: pFloat(dreData.deducao_descontos) },
      { Categoria: '', Item: 'Impostos sobre vendas (ICMS, PIS, COFINS)', Valor: pFloat(dreData.deducao_impostos_vendas) },
      { Categoria: '(-) Custos das Mercadorias Vendidas (CMV)', Item: 'Compra de carne', Valor: pFloat(dreData.cmv_compra_carne) },
      { Categoria: '', Item: 'Perdas por validade ou quebra', Valor: pFloat(dreData.cmv_perdas) },
      { Categoria: '', Item: 'Embalagens utilizadas', Valor: pFloat(dreData.cmv_embalagens) },
      { Categoria: '', Item: 'Custos com desossa e beneficiamento', Valor: pFloat(dreData.cmv_desossa) },
      { Categoria: '(-) Despesas Operacionais', Item: 'Salários e encargos', Valor: pFloat(dreData.despesa_salarios) },
      { Categoria: '', Item: 'Aluguel', Valor: pFloat(dreData.despesa_aluguel) },
      { Categoria: '', Item: 'Energia elétrica', Valor: pFloat(dreData.despesa_energia) },
      { Categoria: '', Item: 'Água', Valor: pFloat(dreData.despesa_agua) },
      { Categoria: '', Item: 'Internet / telefone', Valor: pFloat(dreData.despesa_internet_telefone) },
      { Categoria: '', Item: 'Software de gestão', Valor: pFloat(dreData.despesa_software) },
      { Categoria: '', Item: 'Produtos de limpeza e higiene', Valor: pFloat(dreData.despesa_limpeza) },
      { Categoria: '', Item: 'Manutenção de equipamentos', Valor: pFloat(dreData.despesa_consertos) },
      { Categoria: '', Item: 'Uniformes e EPIs', Valor: pFloat(dreData.despesa_uniformes_epis) },
      { Categoria: '', Item: 'Contabilidade', Valor: pFloat(dreData.despesa_contabilidade) },
      { Categoria: '', Item: 'Taxas bancárias e cartões', Valor: pFloat(dreData.despesa_taxas_bancarias) },
      { Categoria: '', Item: 'Transporte', Valor: pFloat(dreData.despesa_transporte) },
      { Categoria: '(+/-) Outras Receitas/Despesas', Item: 'Outras Receitas', Valor: pFloat(dreData.outras_receitas) },
      { Categoria: '', Item: 'Outras Despesas', Valor: pFloat(dreData.outras_despesas) },
      { Categoria: '(-) Impostos sobre o Lucro', Item: 'Simples Nacional / Lucro Presumido / Lucro Real', Valor: pFloat(dreData.impostos_sobre_lucro) },
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DRE');
    XLSX.writeFile(workbook, `DRE_${dreData.start_date}_${dreData.end_date}.xlsx`);
  };

  const exportToPDF = () => {
    if (!calculatedData) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${APP_NAME} - DRE`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Período: ${dreData.start_date} a ${dreData.end_date}`, 14, 30);
    const tableData = [
      ['Receita Bruta de Vendas', formatCurrency(calculatedData.receitaBruta)],
      ['(-) Deduções da Receita', formatCurrency(calculatedData.totalDeducoes)],
      ['= Receita Líquida de Vendas', formatCurrency(calculatedData.receitaLiquida)],
      ['(-) Custos das Mercadorias Vendidas (CMV)', formatCurrency(calculatedData.totalCMV)],
      ['= Lucro Bruto', formatCurrency(calculatedData.lucroBruto)],
      ['(-) Despesas Operacionais', formatCurrency(calculatedData.totalDespesasOperacionais)],
      ['= Lucro Operacional', formatCurrency(calculatedData.lucroOperacional)],
      ['(+/-) Outras Receitas/Despesas', formatCurrency(pFloat(dreData.outras_receitas) - pFloat(dreData.outras_despesas))],
      ['= Lucro Antes do IR e CSLL', formatCurrency(calculatedData.lucroAntesImpostos)],
      ['(-) Impostos sobre o Lucro', formatCurrency(pFloat(dreData.impostos_sobre_lucro))],
      ['= Lucro Líquido do Período', formatCurrency(calculatedData.lucroLiquido)],
    ];
    doc.autoTable({ startY: 40, head: [['Descrição', 'Valor (R$)']], body: tableData, theme: 'grid', headStyles: { fillColor: [59, 130, 246] }, didParseCell: (data) => { if(data.cell.text[0].startsWith('=')) data.cell.styles.fontStyle = 'bold'; } });
    doc.save(`DRE_${dreData.start_date}_${dreData.end_date}.pdf`);
  };

  const renderInput = (id, label, placeholder, type = "number") => (
    <div><Label htmlFor={id}>{label}</Label><Input id={id} type={type} placeholder={placeholder} value={dreData[id]} onChange={handleInputChange} /></div>
  );

  const renderSection = (title, children) => (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4 py-4 border-t">
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
    </div>
  );

  const renderResultRow = (label, value, isTotal = false, isNegative = false) => (
    <TableRow className={isTotal ? "font-bold bg-muted/20" : ""}>
      <TableCell>{label}</TableCell>
      <TableCell className={`text-right ${isTotal ? '' : 'font-medium'} ${isNegative ? 'text-red-500' : ''}`}>{formatCurrency(value)}</TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gradient-brand">DRE - Demonstrativo de Resultados</h1>
        <div className="flex gap-2">
            <Button onClick={handleNewDRE} variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Novo DRE</Button>
            <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
                <DialogTrigger asChild>
                    <Button onClick={handleSearchDRE} variant="outline"><Search className="mr-2 h-4 w-4" /> Pesquisar</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Pesquisar DREs Salvos</DialogTitle></DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableBody>
                                {savedDres.length > 0 ? savedDres.map(report => (
                                    <TableRow key={report.id} onClick={() => loadDre(report)} className="cursor-pointer hover:bg-muted">
                                        <TableCell>Período de {new Date(report.start_date + 'T00:00:00').toLocaleDateString('pt-BR')} a {new Date(report.end_date + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell>Nenhum DRE encontrado.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      </div>
      <Card className="glass-card">
        <CardHeader><CardTitle>Cadastro e Análise DRE</CardTitle><CardDescription>Insira os dados detalhados para calcular e salvar o DRE.</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderInput('start_date', 'Data de Início', '', 'date')}
            {renderInput('end_date', 'Data de Fim', '', 'date')}
          </div>
          {renderSection('1. Receita Bruta de Vendas', <>
            {renderInput('receita_carnes_bovinas', 'Vendas de carnes bovinas', 'Ex: 80000')}
            {renderInput('receita_outras_carnes', 'Vendas de suínos, aves, etc.', 'Ex: 50000')}
            {renderInput('receita_produtos_comp', 'Vendas de produtos complementares', 'Ex: 20000')}
          </>)}
          {renderSection('2. Deduções da Receita', <>
            {renderInput('deducao_devolucoes', 'Devoluções', 'Ex: 500')}
            {renderInput('deducao_descontos', 'Descontos comerciais', 'Ex: 1000')}
            {renderInput('deducao_impostos_vendas', 'Impostos sobre vendas (ICMS, PIS, COFINS)', 'Ex: 15000')}
          </>)}
          {renderSection('3. Custos das Mercadorias Vendidas (CMV)', <>
            {renderInput('cmv_compra_carne', 'Compra de carne', 'Ex: 70000')}
            {renderInput('cmv_perdas', 'Perdas por validade ou quebra', 'Ex: 2000')}
            {renderInput('cmv_embalagens', 'Embalagens utilizadas', 'Ex: 1500')}
            {renderInput('cmv_desossa', 'Custos com desossa e beneficiamento', 'Ex: 1000')}
          </>)}
          {renderSection('4. Despesas Operacionais', <>
            {renderInput('despesa_salarios', 'Salários e encargos', 'Ex: 15000')}
            {renderInput('despesa_aluguel', 'Aluguel', 'Ex: 3000')}
            {renderInput('despesa_energia', 'Energia elétrica', 'Ex: 1500')}
            {renderInput('despesa_agua', 'Água', 'Ex: 500')}
            {renderInput('despesa_internet_telefone', 'Internet / telefone', 'Ex: 300')}
            {renderInput('despesa_software', 'Software de gestão', 'Ex: 200')}
            {renderInput('despesa_limpeza', 'Produtos de limpeza e higiene', 'Ex: 400')}
            {renderInput('despesa_consertos', 'Manutenção de equipamentos', 'Ex: 600')}
            {renderInput('despesa_uniformes_epis', 'Uniformes e EPIs', 'Ex: 250')}
            {renderInput('despesa_contabilidade', 'Contabilidade', 'Ex: 800')}
            {renderInput('despesa_taxas_bancarias', 'Taxas bancárias e cartões', 'Ex: 1200')}
            {renderInput('despesa_transporte', 'Transporte', 'Ex: 700')}
          </>)}
          {renderSection('5. Outras Receitas/Despesas', <>
            {renderInput('outras_receitas', 'Outras Receitas (Venda de ativos, etc.)', 'Ex: 100')}
            {renderInput('outras_despesas', 'Outras Despesas (Multas, etc.)', 'Ex: 50')}
          </>)}
          {renderSection('6. Impostos sobre o Lucro', <>
            {renderInput('impostos_sobre_lucro', 'Simples Nacional / Lucro Presumido / Real', 'Ex: 5000')}
          </>)}
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
            <div>
                {dreData.id && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o relatório DRE de {dreData.start_date} a {dreData.end_date}.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteDRE}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                )}
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={exportToExcel} disabled={loading}><FileType className="mr-2 h-4 w-4" /> Gerar Excel</Button>
                <Button variant="outline" onClick={exportToPDF} disabled={loading}><FileDown className="mr-2 h-4 w-4" /> Gerar PDF</Button>
                <Button onClick={handleSave} disabled={loading}><Save className="mr-2 h-4 w-4" /> {loading ? 'Salvando...' : (dreData.id ? 'Salvar Alterações' : 'Salvar Novo DRE')}</Button>
            </div>
        </CardFooter>
      </Card>

      {calculatedData && (
        <Card className="glass-card">
          <CardHeader><CardTitle>Resultado do Período</CardTitle>{dreData.start_date && dreData.end_date && (<CardDescription>De {new Date(dreData.start_date + 'T00:00:00').toLocaleDateString('pt-BR')} até {new Date(dreData.end_date + 'T00:00:00').toLocaleDateString('pt-BR')}</CardDescription>)}</CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {renderResultRow('1. Receita Bruta de Vendas', calculatedData.receitaBruta)}
                {renderResultRow('2. (-) Deduções da Receita', calculatedData.totalDeducoes, false, true)}
                {renderResultRow('✅ = Receita Líquida de Vendas', calculatedData.receitaLiquida, true)}
                {renderResultRow('3. (-) Custos das Mercadorias Vendidas (CMV)', calculatedData.totalCMV, false, true)}
                {renderResultRow('📌 = Lucro Bruto', calculatedData.lucroBruto, true)}
                {renderResultRow('4. (-) Despesas Operacionais', calculatedData.totalDespesasOperacionais, false, true)}
                {renderResultRow('📌 = Lucro Operacional', calculatedData.lucroOperacional, true)}
                {renderResultRow('5. (+/-) Outras Receitas/Despesas', pFloat(dreData.outras_receitas) - pFloat(dreData.outras_despesas), false, (pFloat(dreData.outras_receitas) - pFloat(dreData.outras_despesas)) < 0)}
                {renderResultRow('✅ = Lucro Antes do IR e CSLL', calculatedData.lucroAntesImpostos, true)}
                {renderResultRow('6. (-) Impostos sobre o Lucro', pFloat(dreData.impostos_sobre_lucro), false, true)}
                <TableRow className="font-bold text-lg bg-primary/10 text-primary">
                  <TableCell>🟢 = Lucro Líquido do Período</TableCell>
                  <TableCell className="text-right">{formatCurrency(calculatedData.lucroLiquido)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DREPage;