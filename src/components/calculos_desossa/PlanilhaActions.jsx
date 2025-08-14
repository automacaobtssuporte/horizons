import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';

const PlanilhaActions = ({ onDownloadModelo, onFileUpload }) => {
  return (
    <Card className="glass-card">
      <CardHeader><CardTitle>Importar Cortes de Planilha</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={onDownloadModelo} variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" /> Baixar Planilha Modelo
        </Button>
        <div>
          <Label htmlFor="uploadPlanilhaDesossa">Carregar Planilha (.xlsx)</Label>
          <Input id="uploadPlanilhaDesossa" type="file" accept=".xlsx, .xls" onChange={onFileUpload} />
        </div>
        <p className="text-xs text-muted-foreground">Use o modelo para garantir a formatação correta.</p>
      </CardContent>
    </Card>
  );
};

export default PlanilhaActions;