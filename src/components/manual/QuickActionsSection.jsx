import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Package, Calculator, FileText, LineChart } from 'lucide-react';

const QuickActionsSection = () => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Atalhos Rápidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto flex-col gap-2 p-4">
            <Package className="h-6 w-6" />
            <span className="text-xs">Inventário</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 p-4">
            <Calculator className="h-6 w-6" />
            <span className="text-xs">Desossa</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 p-4">
            <FileText className="h-6 w-6" />
            <span className="text-xs">Notas Fiscais</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 p-4">
            <LineChart className="h-6 w-6" />
            <span className="text-xs">Simulação</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsSection;