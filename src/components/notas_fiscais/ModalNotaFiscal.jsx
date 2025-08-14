import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from '@/components/LoadingSpinner';
import FormularioItemNota from './FormularioItemNota';

const ModalNotaFiscal = ({ 
  open, 
  setOpen, 
  currentNota, 
  handleNotaChange, 
  handleItemChange, 
  handleAddItem, 
  handleRemoveItem, 
  handleSaveNota, 
  isSaving, 
  handleAplicarRendimento, 
  produtosInventario,
  produtosDesossa,
  desossasRegistradas
}) => {
  if (!currentNota) return null;

  const isNewNota = typeof currentNota.id === 'string' && currentNota.id.startsWith('new_');
  const safeDesossasRegistradas = desossasRegistradas || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1100px] glass-card max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isNewNota ? 'Adicionar Nova Nota Fiscal' : 'Editar Nota Fiscal'}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes da nota fiscal. O estoque será atualizado ao salvar.
            <br />
            <span className="text-primary font-medium">
              💡 Use o botão de busca (🔍) no campo Código para ver produtos do inventário e das desossas!
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 py-4">
          {isNewNota && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <Label htmlFor="desossaRef" className="font-semibold text-primary">Entrada Rápida por Desossa</Label>
                  <p className="text-xs text-muted-foreground mb-2">Selecione uma desossa para preencher automaticamente os dados da carcaça.</p>
                  <Select onValueChange={(value) => handleNotaChange('desossa_id_ref', value)}>
                      <SelectTrigger><SelectValue placeholder="Selecione uma desossa registrada..." /></SelectTrigger>
                      <SelectContent>
                          <SelectGroup>
                              <SelectLabel>Desossas Recentes</SelectLabel>
                              {safeDesossasRegistradas.length === 0 && <SelectItem value="no-desossa" disabled>Nenhuma desossa encontrada</SelectItem>}
                              {safeDesossasRegistradas.map(d => (
                                  <SelectItem key={d.id} value={d.id}>
                                      NF {d.numero_nota_fiscal} ({new Date(d.data_chegada + 'T00:00:00').toLocaleDateString('pt-BR')}) - R$ {d.custo_total_carcaca}
                                  </SelectItem>
                              ))}
                          </SelectGroup>
                      </SelectContent>
                  </Select>
              </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numeroNotaModal">Número da Nota</Label>
              <Input 
                id="numeroNotaModal" 
                value={currentNota.numero_nota || ''} 
                onChange={(e) => handleNotaChange('numero_nota', e.target.value)} 
                disabled={isSaving} 
              />
            </div>
            <div>
              <Label htmlFor="dataNotaModal">Data da Nota</Label>
              <Input 
                id="dataNotaModal" 
                type="date" 
                value={currentNota.data_nota || ''} 
                onChange={(e) => handleNotaChange('data_nota', e.target.value)} 
                disabled={isSaving} 
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="cnpjEmitenteModal">CNPJ Emitente da Nota</Label>
            <Input 
              id="cnpjEmitenteModal" 
              value={currentNota.cnpj_emitente || ''} 
              onChange={(e) => handleNotaChange('cnpj_emitente', e.target.value)} 
              disabled={isSaving} 
            />
          </div>

          <h3 className="text-lg font-semibold mt-4 border-b pb-2">Itens da Nota</h3>
          
          {currentNota.items.map((item, index) => (
            <FormularioItemNota
              key={item.id || index}
              item={item}
              index={index}
              handleItemChange={handleItemChange}
              handleRemoveItem={handleRemoveItem}
              isSaving={isSaving}
              handleAplicarRendimento={handleAplicarRendimento}
              produtosInventario={produtosInventario}
              produtosDesossa={produtosDesossa}
            />
          ))}
          
          <Button onClick={handleAddItem} variant="outline" size="sm" disabled={isSaving}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
          </Button>

          <div className="mt-4">
            <Label htmlFor="linkPdfModal">Link para o PDF da Nota</Label>
            <Input 
              id="linkPdfModal" 
              placeholder="https://exemplo.com/nota.pdf"
              value={currentNota.link_pdf || ''} 
              onChange={(e) => handleNotaChange('link_pdf', e.target.value)} 
              className="w-full p-2 border rounded bg-input/50" 
              disabled={isSaving} 
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="observacoesModal">Observações</Label>
            <textarea 
              id="observacoesModal" 
              value={currentNota.observacoes || ''} 
              onChange={(e) => handleNotaChange('observacoes', e.target.value)} 
              className="w-full p-2 border rounded bg-input/50 min-h-[80px]" 
              disabled={isSaving} 
            />
          </div>

          <p className="text-right font-bold text-xl mt-4">
            Total Geral: <span className="text-primary">
              {parseFloat(currentNota.total_calculado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSaveNota} disabled={isSaving}>
            {isSaving ? <LoadingSpinner className="mr-2" /> : null}
            Salvar Nota e Atualizar Estoque
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalNotaFiscal;