import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Save, FileSpreadsheet, FileText } from 'lucide-react';

const ParametrosHeader = ({ 
  handleOpenModal, 
  handleSaveAll, 
  handleExportExcel, 
  handleExportPDF,
  isSaving,
  hasChanges
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <h1 className="text-3xl font-bold text-gradient-brand">Parâmetros de Rendimento</h1>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSaveAll} disabled={isSaving || !hasChanges}>
          <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Salvando...' : 'Salvar Preços'}
        </Button>
        <Button onClick={handleExportExcel} variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
        </Button>
        <Button onClick={handleExportPDF} variant="outline">
          <FileText className="mr-2 h-4 w-4" /> Exportar PDF
        </Button>
        <Button onClick={() => handleOpenModal()} className="whitespace-nowrap">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Parâmetro
        </Button>
      </div>
    </div>
  );
};

export default ParametrosHeader;