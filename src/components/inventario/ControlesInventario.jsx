import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Download, UploadCloud, FileSpreadsheet, Save, Search, FolderOpen } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import * as XLSX from 'xlsx';
import { APP_NAME } from '@/config/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPartesOpcoesPorTipo } from '@/config/partesAnimais';

const ControlesInventario = ({ currentUser, setItensInventario, onFileUploadUnificado, onSaveInventario, onOpenSearchModal, itensInventario }) => {
  const { toast } = useToast();
  const [novoItem, setNovoItem] = useState({ codigo: '', nome: '', quantidade: '', unidade: 'kg', parte_boi: '' });
  const [isAddingManually, setIsAddingManually] = useState(false);
  const partesOpcoes = getPartesOpcoesPorTipo('bovino');

  const handleAddItemManual = async () => {
    if (!novoItem.codigo || !novoItem.nome || !novoItem.quantidade) {
      toast({ title: "Erro", description: "Preencha todos os campos do item.", variant: "destructive" });
      return;
    }
    if (!currentUser || !currentUser.id || !currentUser.cnpj) {
      toast({ title: "Erro", description: "Usuário ou CNPJ não identificado para salvar.", variant: "destructive" });
      return;
    }

    setIsAddingManually(true);
    try {
      const itemToInsert = {
        ...novoItem,
        user_id: currentUser.id,
        cnpj_loja: currentUser.cnpj,
        quantidade: parseFloat(novoItem.quantidade),
      };
      const { data, error } = await supabase
        .from('inventario_fisico')
        .insert([itemToInsert])
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        const itemAdicionadoComCamposAnalise = {
          ...data[0],
          estoque_inicial: '', compras: '', outras_entradas: '', vendas: '',
          outras_saidas: '', estoque_fisico_contado: '', custo_medio_unitario: '',
          estoque_calculado: 0, divergencia: 0, divergencia_valor: 0,
          percentual_quebra: 0, mensagem_quebra: '', cor_mensagem: 'text-muted-foreground',
        };
        setItensInventario(prev => [itemAdicionadoComCamposAnalise, ...prev]);
        setNovoItem({ codigo: '', nome: '', quantidade: '', unidade: 'kg', parte_boi: '' });
        toast({ title: "Sucesso", description: "Item adicionado ao inventário." });
      }
    } catch (error) {
      toast({ title: "Erro ao Adicionar Item", description: error.message, variant: "destructive" });
    } finally {
      setIsAddingManually(false);
    }
  };

  const handleDownloadPlanilhaUnificada = () => {
    const worksheetData = [
        ["codigo_produto", "nome_produto", "quantidade_estoque", "unidade", "parte_boi", "estoque_inicial", "compras", "outras_entradas", "vendas", "outras_saidas", "estoque_fisico_contado", "custo_medio_unitario"],
        ["P001", "Picanha", "10.5", "kg", "traseiro", "100", "50", "10", "80", "5", "72", "55.90"],
        ["A002", "Alcatra", "5", "un", "traseiro", "50", "20", "0", "40", "2", "28", "42.50"]
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ModeloUnificadoInventario");
    XLSX.writeFile(workbook, `Modelo_Unificado_Inventario_${APP_NAME}.xlsx`);
    toast({ title: "Download Iniciado", description: "Modelo de planilha unificada baixado."});
  };

  const handleExportarAnalises = () => {
    if (!itensInventario || itensInventario.length === 0) {
      toast({ title: "Erro", description: "Nenhum item para exportar.", variant: "destructive" });
      return;
    }

    try {
      const dadosExportacao = itensInventario.map(item => ({
        'Código': item.codigo || '',
        'Nome do Item': item.nome || '',
        'Quantidade Atual': item.quantidade || 0,
        'Unidade': item.unidade || '',
        'Parte do Boi': item.parte_boi || '',
        'Estoque Inicial': item.estoque_inicial || 0,
        'Compras': item.compras || 0,
        'Outras Entradas': item.outras_entradas || 0,
        'Vendas': item.vendas || 0,
        'Outras Saídas': item.outras_saidas || 0,
        'Estoque Físico Contado': item.estoque_fisico_contado || 0,
        'Custo Médio Unitário (R$)': item.custo_medio_unitario || 0,
        'Estoque Calculado': item.estoque_calculado || 0,
        'Divergência (Qtd)': item.divergencia || 0,
        'Divergência (R$)': item.divergencia_valor || 0,
        'Percentual Quebra/Sobra (%)': item.percentual_quebra || 0,
        'Análise': item.mensagem_quebra || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(dadosExportacao);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Análise de Quebras");

      const fileName = `Analise_Quebras_Inventario_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({ 
        title: "Exportação Concluída", 
        description: `Arquivo "${fileName}" baixado com sucesso!` 
      });
    } catch (error) {
      toast({ 
        title: "Erro na Exportação", 
        description: "Não foi possível exportar os dados. Tente novamente.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Adicionar Novo Item Manualmente</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <Input placeholder="Código" value={novoItem.codigo} onChange={e => setNovoItem({...novoItem, codigo: e.target.value})} disabled={isAddingManually} />
            <Input placeholder="Nome" value={novoItem.nome} onChange={e => setNovoItem({...novoItem, nome: e.target.value})} disabled={isAddingManually} />
            <Input type="number" placeholder="Quantidade" value={novoItem.quantidade} onChange={e => setNovoItem({...novoItem, quantidade: e.target.value})} disabled={isAddingManually} />
            <Select value={novoItem.parte_boi} onValueChange={value => setNovoItem({...novoItem, parte_boi: value})}>
              <SelectTrigger><SelectValue placeholder="Parte do Boi" /></SelectTrigger>
              <SelectContent>
                {partesOpcoes.map(op => <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleAddItemManual} disabled={isAddingManually} className="w-full">
              {isAddingManually ? <LoadingSpinner className="mr-2" /> : <PlusCircle className="mr-2 h-4 w-4" />} Adicionar
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle>Ações do Inventário</CardTitle></CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onOpenSearchModal} className="w-full flex-1">
              <FolderOpen className="mr-2 h-4 w-4" /> Carregar Inventário Salvo
            </Button>
            <Button onClick={onSaveInventario} className="w-full flex-1 bg-green-600 hover:bg-green-700 text-white">
              <Save className="mr-2 h-4 w-4" /> Salvar Inventário Atual
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle>Importar Dados do Inventário</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
                <h3 className="font-semibold">Planilha Unificada</h3>
                <p className="text-sm text-muted-foreground">Use esta planilha para criar novos itens e/ou atualizar dados de análise de uma só vez.</p>
                <Button onClick={handleDownloadPlanilhaUnificada} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4"/> Baixar Modelo Unificado
                </Button>
                <div>
                    <Label htmlFor="uploadPlanilhaUnificada" className="text-sm font-medium">Carregar Planilha Unificada</Label>
                    <Input id="uploadPlanilhaUnificada" type="file" accept=".xlsx, .xls" onChange={onFileUploadUnificado} className="text-xs" />
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold">Exportar Análises Atuais</h3>
                <p className="text-sm text-muted-foreground">Exporte os dados de análise de quebras que estão atualmente na tela para uma planilha Excel.</p>
                 <Button onClick={handleExportarAnalises} variant="outline" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    <FileSpreadsheet className="mr-2 h-4 w-4"/> Exportar Análises
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlesInventario;