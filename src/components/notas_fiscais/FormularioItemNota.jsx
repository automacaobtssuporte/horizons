import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, Search } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { partesBoiOpcoes } from '@/config/partesBoi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FormularioItemNota = ({ 
  item, 
  index, 
  handleItemChange, 
  handleRemoveItem, 
  isSaving, 
  handleAplicarRendimento, 
  produtosInventario, 
  produtosDesossa 
}) => {
  const [modalProdutosOpen, setModalProdutosOpen] = useState(false);
  const [searchProduto, setSearchProduto] = useState('');
  
  // Combinar produtos do inventário e das desossas
  const todosProdutos = [
    ...produtosInventario.map(p => ({ ...p, origem: 'inventario' })),
    ...produtosDesossa.map(p => ({ ...p, origem: 'desossa' }))
  ];

  // Remover duplicatas baseado no código
  const produtosUnicos = todosProdutos.reduce((acc, produto) => {
    const chave = produto.codigo.toLowerCase();
    if (!acc.has(chave)) {
      acc.set(chave, produto);
    }
    return acc;
  }, new Map());

  const produtosFiltrados = Array.from(produtosUnicos.values()).filter(p => 
    p.codigo.toLowerCase().includes(searchProduto.toLowerCase()) ||
    p.nome.toLowerCase().includes(searchProduto.toLowerCase())
  );

  const handleProductSelect = (codigo) => {
    const produtoSelecionado = Array.from(produtosUnicos.values()).find(p => p.codigo === codigo);
    if (produtoSelecionado) {
      handleItemChange(index, {
        codigoProduto: produtoSelecionado.codigo,
        descricao: produtoSelecionado.nome
      });
      setModalProdutosOpen(false);
      setSearchProduto('');
    }
  };

  const handleCodigoChange = (value) => {
    // Buscar produto pelo código digitado
    const produtoEncontrado = Array.from(produtosUnicos.values()).find(p => 
      p.codigo.toLowerCase() === value.toLowerCase()
    );
    
    if (produtoEncontrado) {
      handleItemChange(index, {
        codigoProduto: produtoEncontrado.codigo,
        descricao: produtoEncontrado.nome
      });
    } else {
      handleItemChange(index, {
        codigoProduto: value,
        descricao: item.descricao // Manter descrição existente se não encontrar produto
      });
    }
  };

  const handleDescricaoChange = (value) => {
    // Buscar produto pela descrição digitada
    const produtoEncontrado = Array.from(produtosUnicos.values()).find(p => 
      p.nome.toLowerCase().includes(value.toLowerCase())
    );
    
    if (produtoEncontrado) {
      handleItemChange(index, {
        codigoProduto: produtoEncontrado.codigo,
        descricao: produtoEncontrado.nome
      });
    } else {
      handleItemChange(index, {
        descricao: value
      });
    }
  };

  const isParteBoi = ['dianteiro', 'traseiro', 'serrote', 'boi_inteiro', 'ponta_de_agulha', 'costela'].includes(item.parte_boi);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-10 gap-2 items-end border p-3 rounded-md relative">
        <div className="md:col-span-1">
          <Label>Código</Label>
          <div className="flex gap-1">
            <Input 
              value={item.codigoProduto || ''} 
              onChange={(e) => handleCodigoChange(e.target.value)}
              placeholder="Digite código..."
              disabled={isSaving}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setModalProdutosOpen(true)}
              disabled={isSaving}
              className="px-2"
              title="Buscar produtos"
            >
              <Search className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="md:col-span-2">
          <Label>Produto (Nome)</Label>
          <Input 
            value={item.descricao || ''} 
            onChange={(e) => handleDescricaoChange(e.target.value)}
            placeholder="Digite nome do produto..."
            disabled={isSaving}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Parte do Boi (Opcional)</Label>
          <Select value={item.parte_boi || ''} onValueChange={(value) => handleItemChange(index, { parte_boi: value })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                  {partesBoiOpcoes.map(op => <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>)}
              </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Qtd.</Label>
          <Input type="number" value={item.quantidade || ''} onChange={(e) => handleItemChange(index, { quantidade: e.target.value })} disabled={isSaving} />
        </div>
        <div>
          <Label>Vlr. Unit.</Label>
          <Input type="number" step="0.01" value={item.valorUnitario || ''} onChange={(e) => handleItemChange(index, { valorUnitario: e.target.value })} disabled={isSaving} />
        </div>
        <div className="md:col-span-2">
          <Label>Vlr. Total</Label>
          <Input value={item.valorTotal || '0.00'} readOnly disabled className="bg-muted/50" />
        </div>
        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="text-destructive absolute top-1 right-1 md:static md:self-center md:justify-self-end" disabled={isSaving}>
          <Trash2 className="h-4 w-4" />
        </Button>
        {isParteBoi && (
           <Button 
              onClick={() => handleAplicarRendimento(index)} 
              variant="outline" 
              size="sm" 
              className="md:col-span-full mt-2 text-xs bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-200"
              disabled={isSaving}
          >
              Calcular e Adicionar Cortes de "{partesBoiOpcoes.find(p => p.value === item.parte_boi)?.label}" com base na Desossa
          </Button>
        )}
      </div>

      <Dialog open={modalProdutosOpen} onOpenChange={setModalProdutosOpen}>
        <DialogContent className="sm:max-w-2xl glass-card max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Selecionar Produto</DialogTitle>
            <DialogDescription>
              Produtos disponíveis do inventário e dos cálculos de desossa
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 flex-1 overflow-hidden">
            <div>
              <Label htmlFor="searchProduto">Buscar produto</Label>
              <Input 
                id="searchProduto"
                placeholder="Digite código ou nome do produto..."
                value={searchProduto}
                onChange={(e) => setSearchProduto(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="flex-1 overflow-y-auto border rounded-md">
              <div className="grid grid-cols-1 gap-1 p-2">
                {produtosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchProduto ? 'Nenhum produto encontrado' : 'Digite para buscar produtos'}
                  </div>
                ) : (
                  produtosFiltrados.map((produto) => (
                    <button
                      key={`${produto.codigo}-${produto.origem}`}
                      onClick={() => handleProductSelect(produto.codigo)}
                      className="flex items-center justify-between p-3 text-left hover:bg-muted/50 rounded-md border border-transparent hover:border-border transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{produto.codigo}</div>
                        <div className="text-sm text-muted-foreground">{produto.nome}</div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {produto.origem === 'inventario' ? 'Inventário' : 'Desossa'}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FormularioItemNota;