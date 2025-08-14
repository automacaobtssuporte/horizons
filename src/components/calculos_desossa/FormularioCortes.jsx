import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Trash2, Plus, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPartesOpcoesPorTipo } from '@/config/partesAnimais';
import { useToast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FormularioCortes = ({ cortes, handleCorteChange, handleRemoveCorte, tipoAnimal = 'bovino' }) => {
  const { toast } = useToast();
  const [modalNovaParteOpen, setModalNovaParteOpen] = useState(false);
  const [novaParteNome, setNovaParteNome] = useState('');
  const [novaParteDescricao, setNovaParteDescricao] = useState('');
  
  const partesOpcoes = getPartesOpcoesPorTipo(tipoAnimal);
  const tipoAnimalLabel = tipoAnimal === 'suino' ? 'Suíno' : 'Boi';

  const handleAdicionarNovaParte = () => {
    if (!novaParteNome.trim()) {
      toast({ title: "Erro", description: "Nome da parte é obrigatório.", variant: "destructive" });
      return;
    }

    const parteExistente = partesOpcoes.find(p => 
      p.value.toLowerCase() === novaParteNome.toLowerCase() || 
      p.label.toLowerCase() === novaParteNome.toLowerCase()
    );

    if (parteExistente) {
      toast({ title: "Parte já existe", description: "Esta parte já está disponível na lista.", variant: "destructive" });
      return;
    }

    const novaOpcao = {
      value: novaParteNome.toLowerCase().replace(/\s+/g, '_'),
      label: novaParteDescricao || novaParteNome
    };

    partesOpcoes.push(novaOpcao);

    toast({ 
      title: "Parte Adicionada", 
      description: `"${novaOpcao.label}" foi adicionada às opções disponíveis.`,
      duration: 5000
    });

    setNovaParteNome('');
    setNovaParteDescricao('');
    setModalNovaParteOpen(false);
  };
  
  return (
    <>
      <div className="hidden md:grid md:grid-cols-11 gap-2 mb-2 text-sm font-medium text-muted-foreground px-3">
        <span>Cód. Produto</span>
        <span>Nome</span>
        <span>Peso (kg)</span>
        <span>Preço Venda (R$/kg)</span>
        <span>Parte do {tipoAnimalLabel}</span>
        <span className="flex items-center">
          Índice Venda
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 ml-1 text-blue-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs max-w-xs">
                <p>Fórmula: (Preço Venda * Peso) / Receita Total</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
        <span className="text-green-600 font-semibold flex items-center">
          Custo Total (R$)
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 ml-1 text-blue-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs max-w-xs">
                <p>Fórmula: Índice Venda * Custo Total Carcaça</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
        <span className="text-green-600 font-semibold flex items-center">
          Custo (R$/kg)
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 ml-1 text-blue-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs max-w-xs">
                <p>Fórmula: Custo Total Peça / Peso Peça</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
        <span>Margem (%)</span>
        <span>Ações</span>
      </div>
      {cortes.map((corte) => (
        <motion.div
          key={corte.id}
          className="grid grid-cols-2 md:grid-cols-11 gap-2 mb-3 p-3 border rounded-lg items-center bg-background/30 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Input 
            placeholder="Cód." 
            value={corte.codigo_produto || ''} 
            onChange={e => handleCorteChange(corte.id, 'codigo_produto', e.target.value)} 
            className="col-span-2 md:col-span-1" 
          />
          <Input 
            placeholder="Nome" 
            value={corte.nome || ''} 
            onChange={e => handleCorteChange(corte.id, 'nome', e.target.value)} 
            className="col-span-2 md:col-span-1" 
          />
          <Input 
            type="number" 
            placeholder="Peso" 
            value={corte.peso || ''} 
            onChange={e => handleCorteChange(corte.id, 'peso', e.target.value)} 
            className="col-span-1" 
          />
          <Input 
            type="number" 
            placeholder="Preço Venda" 
            value={corte.preco_venda_kg || ''} 
            onChange={e => handleCorteChange(corte.id, 'preco_venda_kg', e.target.value)} 
            className="col-span-1"
            disabled={corte.parte_animal === 'descarte' || corte.parte_boi === 'descarte'}
            title={(corte.parte_animal === 'descarte' || corte.parte_boi === 'descarte') ? 'Preço de venda é R$ 0 para Descarte' : ''}
          />
          
          <div className="col-span-2 md:col-span-1 flex gap-1">
            <Select
              value={corte.parte_animal || corte.parte_boi || ''}
              onValueChange={(value) => {
                handleCorteChange(corte.id, 'parte_animal', value);
                handleCorteChange(corte.id, 'parte_boi', value);
                if (value === 'descarte') {
                  handleCorteChange(corte.id, 'preco_venda_kg', '0');
                }
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {partesOpcoes.map(opcao => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setModalNovaParteOpen(true)}
              className="px-2"
              title="Adicionar nova parte"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <Input 
            type="text" 
            value={corte.indiceVenda || '0.00%'} 
            readOnly 
            disabled 
            title="Índice de Venda" 
            className="bg-muted/50 col-span-1" 
          />
          <Input 
            type="text" 
            value={corte.novoCustoTotal || '0.00'} 
            readOnly 
            disabled 
            title="Custo Total da Peça (R$)" 
            className="bg-green-500/20 font-semibold text-green-700 col-span-1" 
          />
          <Input 
            type="text" 
            value={corte.novoCustoKg || '0.00'} 
            readOnly 
            disabled 
            title="Novo Custo (R$/kg) - Rateado" 
            className="bg-green-500/20 font-semibold text-green-700 col-span-1" 
          />
          
          <Input 
            type="text" 
            value={corte.margem || '0.00%'} 
            readOnly 
            disabled 
            title="Margem de Lucro (%)" 
            className="bg-muted/50 col-span-1" 
          />
          <div className="flex flex-col items-stretch gap-1 col-span-2 md:col-span-1">
            <Button 
              variant="destructive" 
              onClick={() => handleRemoveCorte(corte.id)} 
              size="sm" 
              className="w-full"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      ))}

      <Dialog open={modalNovaParteOpen} onOpenChange={setModalNovaParteOpen}>
        <DialogContent className="sm:max-w-md glass-card">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Parte do {tipoAnimalLabel}</DialogTitle>
            <DialogDescription>
              Adicione uma nova parte que não está na lista padrão.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="novaParteNome">Nome da Parte (obrigatório)</Label>
              <Input 
                id="novaParteNome"
                placeholder="Ex: Cupim, Fraldinha, etc."
                value={novaParteNome}
                onChange={(e) => setNovaParteNome(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="novaParteDescricao">Descrição (opcional)</Label>
              <Input 
                id="novaParteDescricao"
                placeholder="Descrição mais detalhada..."
                value={novaParteDescricao}
                onChange={(e) => setNovaParteDescricao(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNovaParteOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdicionarNovaParte}>
              Adicionar Parte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FormularioCortes;