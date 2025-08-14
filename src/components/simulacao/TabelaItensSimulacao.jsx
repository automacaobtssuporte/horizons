import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2, FileSearch } from 'lucide-react';

const TabelaItensSimulacao = ({ 
  itensSimulacao, 
  onAddItem, 
  onItemChange, 
  onRemoveItem,
  calcularTotalVendaAtual,
  calcularMargemAtual
}) => {
  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Itens para Simulação</CardTitle>
        <Button onClick={onAddItem} size="sm" variant="outline" className="hover-lift">
          <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Item Manualmente
        </Button>
      </CardHeader>
      <CardContent>
        {itensSimulacao.length === 0 ? (
          <div className="text-center py-10">
            <FileSearch className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhum item para simular.</p>
            <p className="text-sm text-muted-foreground">Adicione itens manualmente ou carregue de uma nota fiscal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1750px]">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left text-sm font-semibold">Cód.</th>
                  <th className="p-2 text-left text-sm font-semibold">Nome</th>
                  <th className="p-2 text-left text-sm font-semibold">Peso (kg)</th>
                  <th className="p-2 text-left text-sm font-semibold">Custo Atual (R$)</th>
                  <th className="p-2 text-left text-sm font-semibold">Preço Venda Atual (R$/kg)</th>
                  <th className="p-2 text-left text-sm font-semibold">Total Venda Atual (R$)</th>
                  <th className="p-2 text-left text-sm font-semibold">Margem Atual</th>
                  <th className="p-2 text-left text-sm font-semibold">Nova Margem (%)</th>
                  <th className="p-2 text-left text-sm font-semibold">Preço Oferta (R$/kg)</th>
                  <th className="p-2 text-left text-sm font-semibold bg-primary/10">Novo Preço Venda (R$/kg)</th>
                  <th className="p-2 text-left text-sm font-semibold bg-primary/10">Total da Venda (R$)</th>
                  <th className="p-2 text-left text-sm font-semibold bg-green-500/10">Novo Custo (R$)</th>
                  <th className="p-2 text-left text-sm font-semibold bg-primary/10">Nova Margem Calc.</th>
                  <th className="p-2 text-left text-sm font-semibold bg-primary/10">Markup</th>
                  <th className="p-2 text-right text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensSimulacao.map((item) => (
                  <motion.tr key={item.id} className="border-b hover:bg-muted/10 transition-colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td className="p-1"><Input className="min-w-[80px] h-9 text-xs" value={item.codigo} onChange={e => onItemChange(item.id, 'codigo', e.target.value)} /></td>
                    <td className="p-1"><Input className="min-w-[150px] h-9 text-xs" value={item.nome} onChange={e => onItemChange(item.id, 'nome', e.target.value)} /></td>
                    <td className="p-1"><Input className="min-w-[80px] h-9 text-xs" type="number" step="0.01" value={item.peso} onChange={e => onItemChange(item.id, 'peso', e.target.value)} /></td>
                    <td className="p-1"><Input className="min-w-[100px] h-9 text-xs" type="number" step="0.01" value={item.custoAtual} onChange={e => onItemChange(item.id, 'custoAtual', e.target.value)} /></td>
                    <td className="p-1"><Input className="min-w-[100px] h-9 text-xs" type="number" step="0.01" value={item.precoVendaAtual} onChange={e => onItemChange(item.id, 'precoVendaAtual', e.target.value)} /></td>
                    <td className="p-1"><Input className="min-w-[100px] h-9 text-xs bg-muted/30" value={calcularTotalVendaAtual(item.precoVendaAtual, item.peso)} readOnly disabled /></td>
                    <td className="p-1"><Input className="min-w-[80px] h-9 text-xs bg-muted/30" value={calcularMargemAtual(item.custoAtual, item.precoVendaAtual)} readOnly disabled /></td>
                    <td className="p-1"><Input className="min-w-[100px] h-9 text-xs" type="number" step="0.01" placeholder="Ex: 30" value={item.novaMargem} onChange={e => onItemChange(item.id, 'novaMargem', e.target.value)} /></td>
                    <td className="p-1"><Input className="min-w-[100px] h-9 text-xs" type="number" step="0.01" placeholder="Ex: 19.90" value={item.precoOferta} onChange={e => onItemChange(item.id, 'precoOferta', e.target.value)} /></td>
                    <td className="p-1"><Input className="min-w-[100px] h-9 text-xs bg-primary/20 font-semibold" value={item.novoPrecoVenda} readOnly disabled /></td>
                    <td className="p-1"><Input className="min-w-[100px] h-9 text-xs bg-primary/20 font-semibold" value={item.totalVenda} readOnly disabled /></td>
                    <td className="p-1"><Input className="min-w-[100px] h-9 text-xs bg-green-500/20 font-semibold" value={item.novoCusto} readOnly disabled /></td>
                    <td className="p-1"><Input className="min-w-[80px] h-9 text-xs bg-primary/20 font-semibold" value={item.novaMargemCalculada ? item.novaMargemCalculada + '%' : 'N/A'} readOnly disabled /></td>
                    <td className="p-1"><Input className="min-w-[80px] h-9 text-xs bg-primary/20 font-semibold" value={item.markup ? item.markup + '%' : 'N/A'} readOnly disabled /></td>
                    <td className="p-1 text-right"><Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} className="h-9 w-9 hover:bg-destructive/20"><Trash2 className="h-4 w-4 text-destructive"/></Button></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TabelaItensSimulacao;