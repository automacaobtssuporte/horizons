import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoadingSpinner from '@/components/LoadingSpinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderArchive } from 'lucide-react';

const ModalPesquisaInventario = ({ open, setOpen, inventarios, isLoading, onSelectInventario }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle>Carregar Inventário Salvo</DialogTitle>
          <DialogDescription>
            Selecione um dos inventários salvos para visualizar seus dados.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
              <p className="ml-2">Buscando inventários...</p>
            </div>
          ) : inventarios.length > 0 ? (
            <div className="space-y-2">
              {inventarios.map((nome, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => onSelectInventario(nome)}
                >
                  <FolderArchive className="mr-2 h-4 w-4" />
                  {nome}
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhum inventário salvo encontrado.
            </div>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalPesquisaInventario;