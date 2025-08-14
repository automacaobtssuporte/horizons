import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, Save, FileSpreadsheet, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingSpinner from '@/components/LoadingSpinner';
import { useSimulacaoData } from '@/hooks/useSimulacaoData';
import { useSimulacaoCalculations } from '@/hooks/useSimulacaoCalculations';
import { useSimulacaoActions } from '@/hooks/useSimulacaoActions';
import DashboardMargem from '@/components/simulacao/DashboardMargem';
import TabelaItensSimulacao from '@/components/simulacao/TabelaItensSimulacao';
import { useDesossaData } from '@/hooks/useDesossaData';

const initialItemState = { 
  id: Date.now(), 
  codigo: '', 
  nome: '', 
  custoAtual: '', 
  precoVendaAtual: '', 
  novaMargem: '', 
  precoOferta: '', 
  novoPrecoVenda: '', 
  novaMargemCalculada: '', 
  markup: '',
  peso: '',
  totalVenda: '',
  novoCusto: ''
};

const SimulacaoPrecos = () => {
  const [itensSimulacao, setItensSimulacao] = useState([initialItemState]);
  const [selectedNotaId, setSelectedNotaId] = useState('');
  const [selectedDesossaId, setSelectedDesossaId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [nomeSimulacao, setNomeSimulacao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [selectedSimulacaoId, setSelectedSimulacaoId] = useState('');

  const { notasFiscais, simulacoesSalvas, loadingNotas, reloadSimulacoesSalvas } = useSimulacaoData();
  const { desossasRegistradas, loadingDesossas } = useDesossaData();
  const { 
    calcularMargemAtual, 
    calcularTotalVendaAtual, 
    calcularDashboardMargem, 
    processarItemChange 
  } = useSimulacaoCalculations();
  const { salvarSimulacao, exportarExcel, exportarPDF } = useSimulacaoActions();

  const handleNotaSelect = (notaId) => {
    setSelectedNotaId(notaId);
    setSelectedDesossaId('');
    if (!notaId) {
      setItensSimulacao([initialItemState]);
      return;
    }
    const notaSelecionada = notasFiscais.find(n => n.id === notaId);
    if (notaSelecionada && notaSelecionada.items) {
      const novosItens = notaSelecionada.items.map((item, index) => ({
        ...initialItemState,
        id: Date.now() + index,
        codigo: item.codigoProduto || '',
        nome: item.descricao || '',
        custoAtual: item.valorUnitario || '',
        peso: item.quantidade || '',
      }));
      setItensSimulacao(novosItens.length > 0 ? novosItens : [initialItemState]);
    } else {
      setItensSimulacao([initialItemState]);
    }
  };

  const handleDesossaSelect = (desossaId) => {
    setSelectedDesossaId(desossaId);
    setSelectedNotaId('');
    if (!desossaId) {
      setItensSimulacao([initialItemState]);
      return;
    }
    const desossaSelecionada = desossasRegistradas.find(d => d.id === desossaId);
    if (desossaSelecionada && desossaSelecionada.cortes_info) {
      const novosItens = desossaSelecionada.cortes_info.map((corte, index) => {
        const custoAtual = corte.novoCustoKg || '';
        const precoVendaAtual = corte.preco_venda_kg || '';
        const peso = corte.peso || '';

        return {
          ...initialItemState,
          id: Date.now() + index,
          codigo: corte.codigo_produto || `C${index + 1}`,
          nome: corte.nome || '',
          peso: String(peso),
          custoAtual: String(custoAtual),
          precoVendaAtual: String(precoVendaAtual),
          novoPrecoVenda: String(precoVendaAtual),
          totalVenda: String(corte.receitaVendaCorte || ''),
          novoCusto: String(custoAtual),
          novaMargemCalculada: String(corte.margemLucro || ''),
        };
      });
      setItensSimulacao(novosItens.length > 0 ? novosItens : [initialItemState]);
    } else {
      setItensSimulacao([initialItemState]);
    }
  };

  const handleSimulacaoSelect = (simulacaoId) => {
    setSelectedSimulacaoId(simulacaoId);
    if (!simulacaoId) {
      setItensSimulacao([initialItemState]);
      setNomeSimulacao('');
      setObservacoes('');
      return;
    }
    const simulacaoSelecionada = simulacoesSalvas.find(s => s.id === simulacaoId);
    if (simulacaoSelecionada) {
      setItensSimulacao(simulacaoSelecionada.itens_simulacao.map(item => ({...initialItemState, ...item})) || [initialItemState]);
      setNomeSimulacao(simulacaoSelecionada.nome_simulacao || '');
      setObservacoes(simulacaoSelecionada.observacoes || '');
    }
  };

  const handleAddItem = () => {
    setItensSimulacao([...itensSimulacao, { ...initialItemState, id: Date.now() }]);
  };

  const handleItemChange = (id, field, value) => {
    setItensSimulacao(prevItens => 
      prevItens.map(item => {
        if (item.id === id) {
          return processarItemChange(item, field, value);
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id) => {
    setItensSimulacao(itensSimulacao.filter(item => item.id !== id));
  };

  const handleSaveSimulacao = async () => {
    setIsSaving(true);
    const result = await salvarSimulacao(nomeSimulacao, observacoes, itensSimulacao, selectedSimulacaoId);
    if (result.success) {
      await reloadSimulacoesSalvas();
    }
    setIsSaving(false);
  };

  const handleExportExcel = () => {
    exportarExcel(itensSimulacao, nomeSimulacao, calcularTotalVendaAtual, calcularMargemAtual);
  };

  const handleExportPDF = () => {
    exportarPDF(itensSimulacao, nomeSimulacao, observacoes, calcularTotalVendaAtual, calcularMargemAtual);
  };

  const dadosMargem = calcularDashboardMargem(itensSimulacao);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gradient-brand">Simulação de Preços de Venda</h1>
      </div>

      <DashboardMargem dadosMargem={dadosMargem} />

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Controles da Simulação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="nomeSimulacao">Nome da Simulação</Label>
              <Input
                id="nomeSimulacao"
                value={nomeSimulacao}
                onChange={(e) => setNomeSimulacao(e.target.value)}
                placeholder="Ex: Simulação Janeiro 2024"
              />
            </div>
            <div>
              <Label htmlFor="simulacaoSalva">Carregar Simulação Salva</Label>
              <Select onValueChange={handleSimulacaoSelect} value={selectedSimulacaoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar simulação..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Simulações Salvas</SelectLabel>
                    {simulacoesSalvas.length === 0 && <SelectItem value="no-sim" disabled>Nenhuma simulação salva</SelectItem>}
                    {simulacoesSalvas.map(sim => (
                      <SelectItem key={sim.id} value={sim.id}>
                        {sim.nome_simulacao} ({new Date(sim.data_simulacao + 'T00:00:00').toLocaleDateString('pt-BR')})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="desossaSelect">Carregar de Desossa</Label>
              <Select onValueChange={handleDesossaSelect} value={selectedDesossaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar desossa..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Desossas Registradas</SelectLabel>
                    {loadingDesossas && <SelectItem value="loading" disabled>Carregando...</SelectItem>}
                    {!loadingDesossas && desossasRegistradas.length === 0 && <SelectItem value="no-desossa" disabled>Nenhuma desossa encontrada</SelectItem>}
                    {desossasRegistradas.map(desossa => (
                      <SelectItem key={desossa.id} value={desossa.id}>
                        NF {desossa.numero_nota_fiscal} - {new Date(desossa.data_chegada + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
                <Label htmlFor="notaSelect">Carregar de Nota Fiscal</Label>
                <Select onValueChange={handleNotaSelect} value={selectedNotaId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecionar nota..."/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Notas Fiscais</SelectLabel>
                            {loadingNotas && <SelectItem value="loading" disabled>Carregando...</SelectItem>}
                            {!loadingNotas && notasFiscais.length === 0 && <SelectItem value="no-nota" disabled>Nenhuma nota encontrada</SelectItem>}
                            {notasFiscais.map(nota => (
                                <SelectItem key={nota.id} value={nota.id}>
                                    NF {nota.numero_nota} ({new Date(nota.data_nota + 'T00:00:00').toLocaleDateString('pt-BR')})
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações sobre a simulação..."
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSaveSimulacao} disabled={isSaving} className="hover-lift">
              {isSaving ? <LoadingSpinner className="mr-2" size={16} /> : <Save className="mr-2 h-4 w-4" />}
              {selectedSimulacaoId ? 'Atualizar' : 'Salvar'} Simulação
            </Button>
            <Button onClick={handleExportExcel} variant="outline" className="hover-lift">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button onClick={handleExportPDF} variant="outline" className="hover-lift">
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <TabelaItensSimulacao
        itensSimulacao={itensSimulacao}
        onAddItem={handleAddItem}
        onItemChange={handleItemChange}
        onRemoveItem={handleRemoveItem}
        calcularTotalVendaAtual={calcularTotalVendaAtual}
        calcularMargemAtual={calcularMargemAtual}
      />
    </div>
  );
};

export default SimulacaoPrecos;