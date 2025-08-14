import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogDescriptionUI, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';

const ModalPesquisaDesossa = ({ open, setOpen, results, isLoading, searchTerm, loadDesossaToForm }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-4xl glass-card max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Resultados da Pesquisa de Desossas</DialogTitle>
          <DialogDescriptionUI>Selecione uma desossa para carregar os dados no formulário.</DialogDescriptionUI>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto space-y-3 pr-2">
          {isLoading && results.length === 0 ? (
            <div className="flex justify-center items-center py-8"><LoadingSpinner size={32} /> <p className="ml-2">Buscando...</p></div>
          ) : results.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma desossa encontrada para "{searchTerm}".</p>
          ) : (
            results.map(desossa => (
              <Card key={desossa.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => loadDesossaToForm(desossa)}>
                <CardHeader>
                  <CardTitle className="text-lg">NF: {desossa.numero_nota_fiscal || 'N/A'}</CardTitle>
                  <CardDescription>
                    Data: {desossa.data_chegada ? new Date(desossa.data_chegada + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'} |
                    Peso Inicial: {desossa.peso_inicial_boi} kg |
                    Custo Carcaça: R$ {desossa.custo_total_carcaca}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Cortes Registrados: {desossa.cortes_info?.length || 0}</p>
                  <p className="text-sm">Lucro Estimado: <span className={`font-semibold ${parseFloat(desossa.resultados_consolidados?.lucroTotalEstimado || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>R$ {desossa.resultados_consolidados?.lucroTotalEstimado || '0.00'}</span></p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalPesquisaDesossa;