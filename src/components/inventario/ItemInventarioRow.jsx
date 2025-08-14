import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit3, Save, XCircle, Calculator, AlertTriangle, CheckCircle2, TrendingUp, PackageOpen, DollarSign } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { partesBoiOpcoes } from '@/config/partesBoi';

const ItemInventarioRow = ({
  item,
  editingItemId,
  editedItemData,
  isSavingEdit,
  onEditItem,
  onSaveEdit,
  onCancelEdit,
  onInputChange,
  onDeleteItem,
  onUpdateItemAnalise,
  onCalcularAnaliseQuebraItem,
  onSaveItemAnalise
}) => {
  
  const isEditingThisItem = editingItemId === item.id;

  return (
    <motion.div
      className="border rounded-lg p-4 bg-background/50 shadow-sm hover:shadow-md transition-shadow duration-300 relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
        {isEditingThisItem ? (
          <>
            <div className="space-y-1">
              <Label htmlFor={`edit-codigo-${item.id}`}>Código</Label>
              <Input id={`edit-codigo-${item.id}`} value={editedItemData.codigo} onChange={(e) => onInputChange('codigo', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`edit-nome-${item.id}`}>Nome</Label>
              <Input id={`edit-nome-${item.id}`} value={editedItemData.nome} onChange={(e) => onInputChange('nome', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`edit-quantidade-${item.id}`}>Quantidade ({editedItemData.unidade})</Label>
              <Input id={`edit-quantidade-${item.id}`} type="number" value={editedItemData.quantidade} onChange={(e) => onInputChange('quantidade', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Parte do Boi</Label>
              <Select value={editedItemData.parte_boi} onValueChange={value => onInputChange('parte_boi', value)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {partesBoiOpcoes.map(op => <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <>
            <div className="font-medium">
              <p className="text-xs text-muted-foreground">Código</p> 
              {item.codigo}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nome</p>
              {item.nome}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estoque Atual</p>
              {item.quantidade} <span className="text-xs">{item.unidade}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Parte do Boi</p>
              {partesBoiOpcoes.find(p => p.value === item.parte_boi)?.label || 'N/A'}
            </div>
          </>
        )}
      </div>

      {isEditingThisItem && (
        <div className="flex gap-2 mb-4">
          <Button onClick={() => onSaveEdit(item.id)} size="sm" disabled={isSavingEdit}>
            {isSavingEdit ? <LoadingSpinner size={16} /> : <Save className="mr-1 h-4 w-4" />} Salvar
          </Button>
          <Button onClick={onCancelEdit} size="sm" variant="outline">
            <XCircle className="mr-1 h-4 w-4" /> Cancelar
          </Button>
        </div>
      )}

      {!isEditingThisItem && (
         <Button onClick={() => onEditItem(item)} size="sm" variant="ghost" className="absolute top-2 right-12 text-muted-foreground hover:text-primary p-1">
            <Edit3 className="h-4 w-4" />
         </Button>
      )}
      <Button onClick={() => onDeleteItem(item.id)} size="sm" variant="ghost" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1">
        <Trash2 className="h-4 w-4" />
      </Button>
      
      <Card className="mt-2 bg-muted/30">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center">
              <PackageOpen className="mr-2 h-5 w-5 text-sky-600"/>
              Análise de Quebra do Item
            </span>
            {onSaveItemAnalise && (
              <Button 
                onClick={() => onSaveItemAnalise(item.id)} 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="mr-1 h-3 w-3" /> Salvar Análise
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div><Label>Est. Inicial</Label><Input type="number" placeholder="Qtd" value={item.estoque_inicial || ''} onChange={(e) => onUpdateItemAnalise(item.id, 'estoque_inicial', e.target.value)} /></div>
            <div><Label>Compras</Label><Input type="number" placeholder="Qtd" value={item.compras || ''} onChange={(e) => onUpdateItemAnalise(item.id, 'compras', e.target.value)} /></div>
            <div><Label>Outras Ent.</Label><Input type="number" placeholder="Qtd" value={item.outras_entradas || ''} onChange={(e) => onUpdateItemAnalise(item.id, 'outras_entradas', e.target.value)} /></div>
            <div><Label>Vendas</Label><Input type="number" placeholder="Qtd" value={item.vendas || ''} onChange={(e) => onUpdateItemAnalise(item.id, 'vendas', e.target.value)} /></div>
            <div><Label>Outras Saídas</Label><Input type="number" placeholder="Qtd" value={item.outras_saidas || ''} onChange={(e) => onUpdateItemAnalise(item.id, 'outras_saidas', e.target.value)} /></div>
            <div><Label>Est. Físico</Label><Input type="number" placeholder="Qtd" value={item.estoque_fisico_contado || ''} onChange={(e) => onUpdateItemAnalise(item.id, 'estoque_fisico_contado', e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Custo Médio Unit. (R$)</Label><Input type="number" placeholder="0.00" value={item.custo_medio_unitario || ''} onChange={(e) => onUpdateItemAnalise(item.id, 'custo_medio_unitario', e.target.value)} /></div>
          </div>
          <Button onClick={() => onCalcularAnaliseQuebraItem(item.id)} size="sm" className="w-full md:w-auto bg-sky-600 hover:bg-sky-700">
            <Calculator className="mr-2 h-4 w-4"/> Calcular Quebra do Item
          </Button>

          { (item.estoque_calculado !== 0 || item.divergencia !== 0 ) && (
            <div className="mt-3 pt-3 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs text-center">
                <div className="p-2 bg-background/40 rounded">Est. Calculado: <span className="font-bold">{item.estoque_calculado}</span></div>
                <div className={`p-2 rounded ${parseFloat(item.divergencia) >= 0 ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}`}>
                    Divergência (Qtd): <span className="font-bold">{item.divergencia}</span>
                </div>
                 <div className={`p-2 rounded ${parseFloat(item.divergencia_valor) >= 0 ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}`}>
                    Divergência (R$): <span className="font-bold">{parseFloat(item.divergencia_valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className={`p-2 rounded ${Math.abs(parseFloat(item.percentual_quebra)) <= 2 && parseFloat(item.percentual_quebra) >= 0 ? 'bg-green-500/10 text-green-700' : (parseFloat(item.percentual_quebra) < 0 ? 'bg-blue-500/10 text-blue-700' : 'bg-red-500/10 text-red-700')}`}>
                    % Quebra/Sobra: <span className="font-bold">{item.percentual_quebra}%</span>
                </div>
              </div>
              {item.mensagem_quebra && (
                <p className={`mt-2 text-center text-xs font-medium flex items-center justify-center p-2 rounded ${item.cor_mensagem.includes('red') ? 'bg-red-500/10' : item.cor_mensagem.includes('green') ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                  {item.cor_mensagem.includes('red') && <AlertTriangle className={`mr-1 h-4 w-4 ${item.cor_mensagem}`} />}
                  {item.cor_mensagem.includes('green') && <CheckCircle2 className={`mr-1 h-4 w-4 ${item.cor_mensagem}`} />}
                  {item.cor_mensagem.includes('blue') && <TrendingUp className={`mr-1 h-4 w-4 ${item.cor_mensagem}`} />}
                  <span className={item.cor_mensagem}>{item.mensagem_quebra}</span>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ItemInventarioRow;