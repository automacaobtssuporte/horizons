import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getPartesOpcoesPorTipo } from '@/config/partesAnimais';

const ModalParametro = ({
  modalOpen,
  setModalOpen,
  currentParametro,
  handleParametroChange,
  handleSaveParametro,
  isSaving,
}) => {
  if (!modalOpen || !currentParametro) {
    return null;
  }

  const partesOpcoes = getPartesOpcoesPorTipo('bovino');

  const handleParteAnimalChange = (value) => {
    const selectedOption = partesOpcoes.find(op => op.value === value);
    handleParametroChange('nome_parte_animal', selectedOption ? selectedOption.label : '');
    handleParametroChange('codigo_parte_animal', value);
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-lg glass-card">
        <DialogHeader>
          <DialogTitle>{currentParametro.id && !String(currentParametro.id).startsWith('new_') ? 'Editar Parâmetro' : 'Adicionar Novo Parâmetro'}</DialogTitle>
          <DialogDescription>Defina os detalhes do parâmetro de rendimento.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div>
            <Label htmlFor="codigoPecaModal">Código da Peça</Label>
            <Input
              id="codigoPecaModal"
              type="number"
              placeholder="Ex: 1001"
              value={currentParametro.codigo_peca}
              onChange={(e) => handleParametroChange('codigo_peca', e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div>
            <Label htmlFor="nomePecaModal">Nome da Peça</Label>
            <Input
              id="nomePecaModal"
              placeholder="Ex: Alcatra"
              value={currentParametro.nome_peca}
              onChange={(e) => handleParametroChange('nome_peca', e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div>
            <Label htmlFor="parteAnimalModal">Parte do Animal</Label>
            <Select
              value={String(currentParametro.codigo_parte_animal || '')}
              onValueChange={handleParteAnimalChange}
              disabled={isSaving}
            >
              <SelectTrigger id="parteAnimalModal">
                <SelectValue placeholder="Selecione a parte" />
              </SelectTrigger>
              <SelectContent>
                {partesOpcoes.map(opcao => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label} (Cód: {opcao.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="rendimentoPercentualModal">Rendimento (%)</Label>
            <Input
              id="rendimentoPercentualModal"
              type="number"
              step="0.01"
              placeholder="Ex: 3.50"
              value={currentParametro.rendimento_percentual}
              onChange={(e) => handleParametroChange('rendimento_percentual', e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="precoVendaKgModal">Preço de Venda (R$/kg)</Label>
            <Input
              id="precoVendaKgModal"
              type="number"
              step="0.01"
              placeholder="Ex: 45.90"
              value={currentParametro.preco_venda_kg || ''}
              onChange={(e) => handleParametroChange('preco_venda_kg', e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="descricaoPecaModal">Descrição da Peça (opcional)</Label>
            <Input
              id="descricaoPecaModal"
              placeholder="Ex: Parte traseira nobre"
              value={currentParametro.descricao_peca || ''}
              onChange={(e) => handleParametroChange('descricao_peca', e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSaveParametro} disabled={isSaving}>
            {isSaving ? <LoadingSpinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Parâmetro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalParametro;