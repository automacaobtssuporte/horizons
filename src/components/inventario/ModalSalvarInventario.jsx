import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';

const ModalSalvarInventario = ({ open, setOpen, onConfirmSave }) => {
  const [nomeInventario, setNomeInventario] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    if (!nomeInventario.trim()) {
      toast({
        title: "Nome Obrigatório",
        description: "Por favor, dê um nome ao seu inventário.",
        variant: "destructive",
      });
      return;
    }
    onConfirmSave(nomeInventario);
    setNomeInventario('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] glass-card">
        <DialogHeader>
          <DialogTitle>Salvar Inventário Atual</DialogTitle>
          <DialogDescription>
            Dê um nome para este "retrato" do seu inventário. Isso permitirá que você o consulte mais tarde.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={nomeInventario}
              onChange={(e) => setNomeInventario(e.target.value)}
              className="col-span-3"
              placeholder={`Inventário ${new Date().toLocaleDateString('pt-BR')}`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="submit" onClick={handleSave}>Confirmar e Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalSalvarInventario;